import { flatten } from 'lodash';
import { Tester, TesterContext, TestResults, TestResult } from '@teambit/tester';
import { runCLI } from 'jest';
import { TestResult as JestTestResult } from '@jest/test-result';
import { Network } from '@teambit/isolator';
import { Component } from '@teambit/component';

export class JestTester implements Tester {
  constructor(readonly jestConfig: any) {}

  private attachToComponentId(
    capsuleGraph: Network,
    testResults: JestTestResult[],
    components: Component[]
  ): TestResults[] {
    const tests = components.map((component) => {
      return {
        componentId: component.id,
        testSuites: this.buildTestsBySpecFiles(capsuleGraph, testResults, component),
      };
    });

    return flatten(tests.filter((test) => test.testSuites.length != 0));
  }

  private buildTestsBySpecFiles(capsuleGraph: Network, testResults: JestTestResult[], component: Component) {
    //@ts-ignore
    return component.specs.map((specFile: string) => {
      const capsule = capsuleGraph.capsules.getCapsule(component.id);
      if (!capsule) throw new Error('capsule not found');
      const testPath = `${capsule.wrkDir}/${specFile}`;
      const jestTestResult = testResults.find((testResult) => testResult.testFilePath === testPath);
      if (!jestTestResult) return;
      return {
        file: specFile,
        tests: this.buildTests(jestTestResult),
        error: jestTestResult.testExecError?.message,
      };
    });
  }

  private buildTests(jestTestResult: JestTestResult) {
    return jestTestResult.testResults.map(
      (test) => new TestResult(test.ancestorTitles, test.title, test.status, test.duration)
    );
  }

  async test(context: TesterContext): Promise<TestResults[]> {
    const config: any = {
      rootDir: context.rootPath,
      watch: context.watch,
      // runInBand: context.debug,
    };

    // eslint-disable-next-line
    const jestConfig = require(this.jestConfig);
    const jestConfigWithSpecs = Object.assign(jestConfig, {
      testMatch: context.specFiles,
    });

    const withEnv = Object.assign(jestConfigWithSpecs, config);
    // :TODO he we should match results to components and format them accordingly. (e.g. const results = runCLI(...))

    const testsOutPut = await runCLI(withEnv, [this.jestConfig]);
    const testResults = testsOutPut.results.testResults;
    const componentTestResults = this.attachToComponentId(context.capsuleGraph, testResults, context.components);
    return componentTestResults;
  }
}
