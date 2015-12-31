import 'babel-polyfill';

import Logger from './util/logger.js';
import InstanceLoader from './base/loader.js';

class Worker {

  constructor() {
    this.works = []; // one line one workUrl

    this.processor = null;
  }

  init(argv) {
    let Processor = InstanceLoader.load(argv.type);
    let Strategy = InstanceLoader.load(argv.type, argv.strategy);

    this.processor = new Processor();
    this.processor.init(new Strategy());

    process.send({cmd: 'initialized'});
  }

  add(workUrl) {
    this.works.push(workUrl);
    process.send({cmd: 'added', url: workUrl});
  }

  async start() {
    Logger.instance.info('[Worker][%s] Start to work, count: %d', process.pid, this.works.length);
    for (let workUrl of this.works) {
      await this.processor.start(workUrl);
    }
    Worker.end();
  }

  static end() {
    process.send({cmd: 'end'});
    process.exit(0);
  }

}

let worker = new Worker();

process.on('message', function(msg) { // 处理parent线程发送过来的消息
  if (typeof msg != 'object' || !msg.hasOwnProperty('cmd')) {
    Logger.instance.error('[Worker][%s] Invalid message:', process.pid, msg);
    return;
  }
  switch (msg.cmd) {
    case 'init':
      worker.init(msg.data);
      break;
    case 'add':
      worker.add(msg.data);
      break;
    case 'start':
      worker.start();
      break;
    default:
      Logger.instance.error('[Worker][%s] Invalid command: %s', process.pid, msg.cmd);
      break;
  }
});