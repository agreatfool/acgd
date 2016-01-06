import ProcessorBase from '../base/processor.js';

import Logger from '../util/logger';

class VideoProcessor extends ProcessorBase {

  constructor() {
    super();
    this.strategy = null;
  }

  init(strategy) {
    Logger.instance.info('[VideoProcessor][%s] Init ...', process.pid);

    this.strategy = strategy;
  }

  async start(taskUrl) {
    Logger.instance.info('[VideoProcessor][%s] Start to process single task: %s', process.pid, taskUrl);
  }

}

export default VideoProcessor;