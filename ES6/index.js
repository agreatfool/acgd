import libFs from 'fs';
import libPath from 'path';
import yargs from 'yargs';

import Logger from './util/logger.js';
import InstanceLoader from './base/loader.js';

class Runner {

  constructor() {
    this.argv = yargs.argv;
  }

  run() {
    if (!this.validateArgs()) {
      process.exit(1);
    }

    let Processor = InstanceLoader.load(this.argv.type);
    let Strategy = InstanceLoader.load(this.argv.type, this.argv.strategy);

    new Processor(new Strategy(), this.argv.source).init();
  }

  validateArgs() {
    // 验证输入参数
    if (!this.argv.hasOwnProperty('type') || !this.argv.hasOwnProperty('strategy') || !this.argv.hasOwnProperty('source')) {
      Runner.printUsage();
      return false;
    }

    let type = this.argv.type;
    let strategy = this.argv.strategy;

    let typePath = libPath.join('.', type, type + '.js');
    if (!libFs.existsSync(typePath)) {
      Logger.instance.error('[acgd] Invalid download type: %s', type);
      return false;
    }

    let strategyPath = libPath.join('.', 'strategy', type, strategy + '.js');
    if (!libFs.existsSync(strategyPath)) {
      Logger.instance.error('[acgd] Invalid download strategy: %s', strategy);
      return false;
    }

    Logger.instance.info('[acgd] Arguments: %j', this.argv);

    return true;
  }

  static printUsage() {
    Logger.instance.error('[acgd] Invalid usage, shall: ./bin/run.sh --type=... --strategy=... --source=...');
  }

}

Logger.instance.info('[acgd] System start...');

new Runner().run();