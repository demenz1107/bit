import { migrate } from '../../../api/consumer';
import { fetch } from '../../../api/scope';
import logger from '../../../logger/logger';
import CompsAndLanesObjects from '../../../scope/comps-and-lanes-objects';
import { checkVersionCompatibilityOnTheServer } from '../../../scope/network/check-version-compatibility';
import { buildCommandMessage, fromBase64, unpackCommand } from '../../../utils';
import clientSupportCompressedCommand from '../../../utils/ssh/client-support-compressed-command';
import { CommandOptions, LegacyCommand } from '../../legacy-command';

let compressResponse;
export default class Fetch implements LegacyCommand {
  name = '_fetch <path> <args>';
  private = true;
  internal = true;
  description = 'fetch components(s) from a scope';
  alias = '';
  // @ts-ignore AUTO-ADDED-AFTER-MIGRATION-PLEASE-FIX!
  opts = [
    ['n', 'no-dependencies', 'do not include component dependencies'],
    ['', 'lanes', 'provided ids are lanes'],
  ] as CommandOptions;

  action([path, args]: [string, string], { noDependencies, lanes }: any): Promise<any> {
    const { payload, headers } = unpackCommand(args);
    compressResponse = clientSupportCompressedCommand(headers.version);
    checkVersionCompatibilityOnTheServer(headers.version);
    logger.info('Checking if a migration is needed');
    const scopePath = fromBase64(path);
    return migrate(scopePath, false).then(() => {
      return fetch(scopePath, payload, noDependencies, lanes, headers);
    });
  }

  report(compsAndLanesObjects: CompsAndLanesObjects): string {
    const components = compsAndLanesObjects.toString();
    // No need to use packCommand because we handle all the base64 stuff in a better way inside the ComponentObjects.manyToString
    return JSON.stringify(buildCommandMessage(components, undefined, compressResponse));
  }
}
