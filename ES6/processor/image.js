import ProcessorBase from '../base/processor.js';

import Logger from '../util/logger.js';

class ImageProcessor extends ProcessorBase {

  constructor() {
    super();

    this.strategy = null; // 执行策略代码,自动注入

    this.albumConcurrencyLimit = 5;  // 同时进行解析的album数量
    this.imageConcurrencyLimit = 10; // 同时进行下载的图片数量
    this.albumUrls = []; // 正在解析的相册url列表,解析完成后会被移除,因此length为0表示下载地址都解析完成
    this.images = [];    // 正在下载的图片列表,当this.albumUrls和images同时length为0,则表示下载完成
  }

  init(strategy) {
    Logger.instance.info('[ImageProcessor][%s] Init ...', process.pid);

    this.strategy = strategy;
  }

  async start(taskUrl) {
    Logger.instance.info('[ImageProcessor][%s] Start to process task: %s', process.pid, taskUrl);

    try {
      // 解析相册地址列表
      this.albumUrls = await this.strategy.parseAlbums(taskUrl);
      Logger.instance.info('[ImageProcessor][%s] Albums to be downloaded: %d', process.pid, this.albumUrls.length);

      if (!this.strategy.title) {
        Logger.instance.warn('[ImageProcessor][%s] Failed to parse the task title: %s', process.pid, taskUrl);
      }

      if (this.albumUrls.length == 0) {
        return; // nothing to download
      }
    } catch (err) {
      return Promise.reject(err);
    }

    // 从相册url解析出图片地址列表
    let albumProcessing = 0;

    let albumTimer = setInterval(() => {
      if (this.albumUrls.length > 0 && albumProcessing < this.albumConcurrencyLimit) {
        albumProcessing++;
        this.strategy.parseImages(this.albumUrls.shift()).then((imageInfos) => {
          albumProcessing--;
          let albumName = imageInfos[0]; // string
          let imageUrlInfos = imageInfos[1]; // [[albumName, imageUrl, imageFileName], ...]
          Logger.instance.info('[ImageProcessor][%s] Album image count, album: %s, count: %d', process.pid, albumName, imageUrlInfos.length);
          this.strategy.ensureOutputDir(albumName).then(() => {
            this.images.push(...imageUrlInfos);
          }).catch((err) => {
            Logger.instance.error(err);
          });
        }).catch((err) => {
          albumProcessing--;
          Logger.instance.error(err);
        });
      }

      if (this.albumUrls.length <= 0 && albumProcessing <= 0) {
        clearInterval(albumTimer);
      }
    }, 300); // 0.3s

    // 图片下载
    return new Promise((resolve) => {
      let imageProcessing = 0;

      let reporter = setInterval(() => {
        Logger.instance.info('[ImageProcessor][%s] Album not assigned: %d, parsing: %d; Image not assigned: %d, downloading: %d',
          process.pid, this.albumUrls.length, albumProcessing, this.images.length, imageProcessing);
      }, 5000); // 5s

      let imageTimer = setInterval(() => {
        // process download
        if (this.images.length > 0 && imageProcessing < this.imageConcurrencyLimit) {
          imageProcessing++;
          this.strategy.downloadImage(this.images.shift()).then(() => {
            imageProcessing--;
          }).catch((err) => {
            imageProcessing--;
            Logger.instance.error(err);
          });
        }

        // check status
        if (this.albumUrls.length <= 0 && albumProcessing <= 0
          && this.images.length <= 0 && imageProcessing <= 0) {
          clearInterval(reporter);
          clearInterval(imageTimer);
          resolve();
        }
      }, 300); // 0.3s
    });
  }

}

export default ImageProcessor;