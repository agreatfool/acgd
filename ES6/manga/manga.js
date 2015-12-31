import ProcessorBase from '../base/processor.js';

import Logger from '../util/logger';

class MangaProcessor extends ProcessorBase {

  constructor() {
    super();
    this.strategy = null;
  }

  init(strategy) {
    Logger.instance.info('[MangaProcessor] Init ...');

    this.strategy = strategy;
  }

  async start(taskUrl) {
    Logger.instance.info('[MangaProcessor] Start to process single task: %s', taskUrl);
  }

  prepareList(albumUrl) {
    Logger.instance.info('[MangaProcessor] Start to download album: %s', albumUrl);
  }

  downloadList(imageUrls) {
    Logger.instance.info('[MangaProcessor] Start to download images: %j', imageUrls);
  }

  downloadFile(imageUrl) {
    Logger.instance.info('[MangaProcessor] Start to download single image: %s', imageUrl);
  }

  persistFile(file, data) {
    Logger.instance.info('[MangaProcessor] Start to save file: %s', file);
  }

  end() {
    Logger.instance.info('[MangaProcessor] End process');
  }

}

export default MangaProcessor;