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

      if (this.images.length > 0) {
        await this.strategy.ensureOutputDir();
      }
    } catch (err) {
      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    return new Promise((resolve) => {
      let reporter = setInterval(() => {
        Logger.instance.info('[ImageProcessor][%s] Image task left not assigned: %d, Image task downloading: %d', process.pid, this.images.length, this.processingDownloads);
      }, 3000); // 5s

      let timer = setInterval(() => {
        // process download
        if (this.images.length > 0 && this.processingDownloads < this.concurrencyLimit) {
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

        // check status
        if (this.images.length <= 0 && this.processingDownloads <= 0) {
          clearInterval(reporter);
          clearInterval(timer);
          resolve();
        }
      }, 500); // 0.5s
    });
  }

}

export default ImageProcessor;