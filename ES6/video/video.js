import ProcessorBase from '../base/processor.js';

import Logger from '../util/logger';

class VideoProcessor extends ProcessorBase {

  constructor() {
    super();
    this.strategy = null;
  }

  init(strategy) {
    Logger.instance.info('[VideoProcessor] Init ...');

    this.strategy = strategy;
  }

  async start(taskUrl) {
    Logger.instance.info('[VideoProcessor] Start to process single task: %s', taskUrl);
  }

  prepareList(albumUrl) {
    Logger.instance.info('[VideoProcessor] Start to download album: %s', albumUrl);
  }

  downloadList(imageUrls) {
    Logger.instance.info('[VideoProcessor] Start to download videos: %j', imageUrls);
  }

  downloadFile(imageUrl) {
    Logger.instance.info('[VideoProcessor] Start to download single video: %s', imageUrl);
  }

  persistFile(file, data) {
    Logger.instance.info('[VideoProcessor] Start to save file: %s', file);
  }

  end() {
    Logger.instance.info('[VideoProcessor] End process');
  }

}

export default VideoProcessor;