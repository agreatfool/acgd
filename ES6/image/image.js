import ProcessorBase from '../base/processor.js';

import Logger from '../util/logger.js';

class ImageProcessor extends ProcessorBase {

  constructor() {
    super();

    this.processingDownloads = 0;
    this.concurrencyLimit = 10;
    this.images = [];
    this.strategy = null;
  }

  init(strategy) {
    Logger.instance.info('[ImageProcessor][%s] Init ...', process.pid);

    this.strategy = strategy;
  }

  async start(taskUrl) {
    Logger.instance.info('[ImageProcessor][%s] Start to process task: %s', process.pid, taskUrl);

    try {
      let albums = await this.strategy.parseAlbums(taskUrl);
      Logger.instance.info('[ImageProcessor][%s] Albums to be downloaded:', process.pid, albums);

      for (let albumUrl of albums) {
        let albumImages = await this.strategy.parseImages(albumUrl);
        this.images = [...this.images, ...albumImages];
      }
      Logger.instance.info('[ImageProcessor][%s] Images to be downloaded:', process.pid, this.images);
    } catch (err) {
      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    if (this.images.length > 0) {
      await this.strategy.ensureOutputDir();
    }

    //for (let imageUrl of this.images) {
    //  await this.strategy.downloadImage(imageUrl);
    //}

    while (this.images.length > 0) {
      if (this.processingDownloads >= this.concurrencyLimit) {
        continue;
      }
      this.processingDownloads++;
      this.strategy.downloadImage(this.images.shift()).then(
        () => {
          this.processingDownloads--;
        },
        (err) => {
          this.processingDownloads--;
          Logger.instance.error(err);
        }
      );
    }

    return new Promise((resolve) => {
      let timer = setInterval(() => {
        if (this.images.length <= 0 && this.processingDownloads <= 0) {
          clearInterval(timer);
          resolve();
        } else {
          Logger.instance.info('[ImageProcessor][%s] Images left: %d', process.pid, this.images.length);
        }
      }, 1000); // 1s
    });
  }

}

export default ImageProcessor;