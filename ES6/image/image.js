import ProcessorBase from '../base/processor.js';

import Logger from '../util/logger';

class ImageProcessor extends ProcessorBase {

  constructor() {
    super();
    this.strategy = null;
  }

  init(strategy) {
    Logger.instance.info('[ImageProcessor] Init ...');

    this.strategy = strategy;
  }

  async start(taskUrl) {
    Logger.instance.info('[ImageProcessor] Start to process single task: %s', taskUrl);
  }

  prepareList(albumUrl) {
    Logger.instance.info('[ImageProcessor] Start to download album: %s', albumUrl);
  }

  downloadList(imageUrls) {
    Logger.instance.info('[ImageProcessor] Start to download images: %j', imageUrls);
  }

  downloadFile(imageUrl) {
    Logger.instance.info('[ImageProcessor] Start to download single image: %s', imageUrl);
  }

  persistFile(file, data) {
    Logger.instance.info('[ImageProcessor] Start to save file: %s', file);
  }

  end() {
    Logger.instance.info('[ImageProcessor] End process');
  }

}

export default ImageProcessor;