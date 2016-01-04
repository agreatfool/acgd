import Logger from '../util/logger.js';

class ProcessorBase {

  init() {
    Logger.instance.info('初始化整个下载工作');
  }

  async start() {
    Logger.instance.info('开始整个下载工作');
  }

}

export default ProcessorBase;