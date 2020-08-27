import { Command, CommandOptions } from '@teambit/cli';

import { Watcher } from './watcher';

export class WatchCommand implements Command {

  msgs = {
    onAll: (event, path) => console.log(`Event: "${event}". Path: ${path}`),
    onStart: (workspace, timestamp) => {
      console.log(`
        Watching for component changes in workspace ${workspace}.
        Compiling all {num-components} components:
        
        STATUS           COMPONENT ID
        ? {status}      {full-component-id}
        X FAIL           teambit.bit/aspect-loader
        V PASSING        teambit.bit/pkg
        
        V 56 components passed
        X 2 components failed:
          - <comp 1>
          - <comp 2>
        
        Finished. (2 minutes)
        
        Watching for component changes (${timestamp})...
    `)
    },
    // onReady: 'onReady',
    onReady: () => {},
    // onChange: 'onChange',
    onChange: (p) => {
      console.log(`file ${p} has been changed`);
    },
    // onAdd: 'onAdd',
    onAdd: (p) => {
      console.log(`file ${p} has been added`);
    },
    // onUnlink: 'onUnlink',
    onUnlink: (p) => {
      console.log(`file ${p} has been removed`);
    },
    onError: (err) => {
      console.log(`Watcher error ${err}`);
    }
  }


  name = 'watch';
  description = 'watch a set of components';
  alias = '';
  group = 'env';
  shortDescription = '';
  options = [['v', 'verbose', 'showing npm verbose output for inspection and prints stack trace']] as CommandOptions;

  constructor(
    /**
     * watcher extension.
     */
    private watcher: Watcher
  ) {}

  async report(cliArgs: [], { verbose = false }: { verbose?: boolean }) {
    // console.log(`
    // Watching for component changes in workspace {workspace}.
    // Compiling all {num-components} components:
    
    // STATUS           COMPONENT ID
    // ? {status}      {full-component-id}
    // X FAIL           teambit.bit/aspect-loader
    // V PASSING        teambit.bit/pkg
    
    // V 56 components passed
    // X 2 components failed:
    //   - <comp 1>
    //   - <comp 2>
    
    // Finished. (2 minutes)
    
    // Watching for component changes ({timestamp})...
    // `)
    await this.watcher.watch({ msgs: this.msgs, verbose });
    return 'watcher terminated';
  }
  
}
