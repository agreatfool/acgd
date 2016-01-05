import 'babel-polyfill';

import libFs from 'fs';
import libPath from 'path';
import libCp from 'child_process';

import libFsp from 'fs-promise';
import libValidUrl from 'valid-url';
import yargs from 'yargs';

import Logger from './util/logger.js';

import conf from '../config/config.json';

class Runner {

  constructor() {
    this.argv = yargs.argv;
    this.numCPUs = conf.workersCount;

    this.workingWorkersCount = 0;
    this.workers = [];
    this.works = [];

    this.initializedWorkerCount = 0;
    this.addedWorksCount = 0;
  }

  async run() {
    if (!this.validateArgs()) {
      process.exit(1);
    }

    await Runner.clearPreviousLog();
    await this.spawnWorkers();
    await this.parseSource();
    await this.assignWorks();
    this.makeWorkersRun();
    this.stay();
  }

  static async clearPreviousLog() {
    // 清理之前的运行日志
    Logger.instance.info('[acgd] Start to clear previous logs ...');

    let logPath = libPath.join(__dirname, '..', 'log');

    let logExists = await libFsp.exists(logPath);
    if (!logExists) {
      return;
    }

    let files = await libFsp.readdir(logPath);
    for (let filename of files) {
      if (filename == 'placeholder' || filename == Logger.logName) {
        return;
      }
      let filePath = libPath.join(logPath, filename);
      await libFsp.unlink(filePath);
      Logger.instance.info('[acgd] Log deleted: %s', filePath);
    }
  }

  spawnWorkers() {
    // 创建工作子进程
    Logger.instance.info('[acgd] Start to spawn workers ...');

    for (let i = 0; i < this.numCPUs; i++) {
      let worker = libCp.fork(libPath.join(__dirname, 'worker.js'));

      worker.on('message', (msg) => { // 处理worker子进程发送过来的消息
        if (typeof msg != 'object' || !msg.hasOwnProperty('cmd')) {
          Logger.instance.error('[acgd] Worker[%s]: Invalid message:', worker.pid, msg);
          return;
        }
        switch (msg.cmd) {
          case 'initialized':
            Logger.instance.info('[acgd] Worker[%s]: Worker initialized ...', worker.pid);
            this.initializedWorkerCount++;
            break;
          case 'added':
            Logger.instance.info('[acgd] Worker[%s]: Work %s added ...', worker.pid, msg.url);
            this.addedWorksCount++;
            break;
          case 'end':
            Logger.instance.info('[acgd] Worker[%s]: All works finished, exited ...', worker.pid);
            this.workingWorkersCount--;
            break;
          default:
            Logger.instance.error('[acgd] Worker[%s]: Invalid command: %s', worker.pid, msg.cmd);
            break;
        }
      });
      this.workers.push(worker);
      worker.send({cmd: 'init', data: this.argv}); // 初始化worker子进程
    }

    return new Promise((resolve) => {
      let timer = setInterval(() => {
        if (this.initializedWorkerCount == this.numCPUs) {
          clearInterval(timer);
          Logger.instance.info('[acgd] All workers initialized ...');
          resolve();
        }
      }, 500); // 0.5s
    });
  }

  async parseSource() {
    // 解析传入的请求源
    Logger.instance.info('[acgd] Start to parse source: %s', this.argv.source);

    if (libValidUrl.isUri(this.argv.source)) {
      // 给予的资源参数是一个链接,即需要下载的albumUrl
      this.works.push(this.argv.source);
    } else if (await libFsp.exists(this.argv.source)) {
      // 给予的资源参数是一个本地文件,即需要下载的内容列表,每个URL一行
      let fileContent = await libFsp.readFile(this.argv.source);
      let lines = fileContent.toString().match(/^.*((\r\n|\n|\r)|$)/gm);
      lines.forEach((line) => {
        line = line.replace(/(\r\n|\n|\r|$)/gm, "");
        if (!libValidUrl.isUri(line)) {
          Logger.instance.error('[acgd] Line data in source file is invalid: %s', line);
          return;
        }
        this.works.push(line);
      });
    } else {
      // 非法资源
      Logger.instance.error('[acgd] Invalid source: %s', this.argv.source);
      process.exit(1);
    }

    Logger.instance.info('[acgd] Works parsed: ', this.works);
  }

  assignWorks() {
    // 将解析出来的任务,分配给工作子进程
    Logger.instance.info('[acgd] Start to assign works to workers ...');

    let workerIndex = 0;
    for (let work of this.works) {
      this.workers[workerIndex].send({cmd: 'add', data: work});

      // 更新下一个运行的worker的编号
      workerIndex++;
      if (workerIndex > (this.workers.length - 1)) {
        workerIndex = 0;
      }
    }

    // 更新正在工作的子进程数量
    this.workingWorkersCount = this.numCPUs;

    return new Promise((resolve) => {
      let timer = setInterval(() => {
        if (this.addedWorksCount == this.works.length) {
          clearInterval(timer);
          Logger.instance.info('[acgd] All works assigned ...');
          resolve();
        }
      }, 500); // 0.5s
    });
  }

  makeWorkersRun() {
    // 通知所有子进程工作起来
    Logger.instance.info('[acgd] Start make workers run ...');

    for (let worker of this.workers) {
      worker.send({cmd: 'start'});
    }
  }

  stay() {
    // 等待所有子进程将任务完成,然后退出
    Logger.instance.info('[acgd] Start to loop and watch the status of working workers ...');

    var timer = setInterval(() => {
      if (this.workingWorkersCount <= 0) {
        Logger.instance.info('[acgd] All working workers done, main thread exit ...');
        clearInterval(timer);
        process.exit(0);
      }
    }, 500); // 0.5s
  }

  validateArgs() {
    // 验证输入参数
    if (!this.argv.hasOwnProperty('type') || !this.argv.hasOwnProperty('strategy') || !this.argv.hasOwnProperty('source')) {
      Runner.printUsage();
      return false;
    }

    let type = this.argv.type;
    let strategy = this.argv.strategy;

    let typePath = libPath.join(__dirname, type, type + '.js');
    if (!libFs.existsSync(typePath)) {
      Logger.instance.error('[acgd] Invalid download type: %s', type);
      return false;
    }

    let strategyPath = libPath.join(__dirname, 'strategy', type, strategy + '.js');
    if (!libFs.existsSync(strategyPath)) {
      Logger.instance.error('[acgd] Invalid download strategy: %s', strategy);
      return false;
    }

    Logger.instance.info('[acgd] Arguments: ', this.argv);

    return true;
  }

  static printUsage() {
    Logger.instance.error('[acgd] Invalid usage, shall: ./bin/run.sh --type=... --strategy=... --source=...');
  }

}

Logger.instance.info('[acgd] System start...');

new Runner().run();