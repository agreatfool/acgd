import ProcessorBase from '../base/processor.js';

import Logger from '../util/logger';

class ImageProcessor extends ProcessorBase {

  constructor() {
    super();
    this.strategy = null;
  }

  init(strategy) {
    Logger.instance.info('[ImageProcessor][%s] Init ...', process.pid);

    this.strategy = strategy;
  }

  async start(taskUrl) {
    Logger.instance.info('[ImageProcessor][%s] Start to process single task: %s', process.pid, taskUrl);
  }

  prepareList(albumUrl) {
    Logger.instance.info('[ImageProcessor][%s] Start to download album: %s', process.pid, albumUrl);
  }

  downloadList(imageUrls) {
    Logger.instance.info('[ImageProcessor][%s] Start to download images: %j', process.pid, imageUrls);
  }

  downloadFile(imageUrl) {
    Logger.instance.info('[ImageProcessor][%s] Start to download single image: %s', process.pid, imageUrl);
  }

  persistFile(file, data) {
    Logger.instance.info('[ImageProcessor][%s] Start to save file: %s', process.pid, file);
  }

  end() {
    Logger.instance.info('[ImageProcessor][%s] End process', process.pid);
  }

}

export default ImageProcessor;