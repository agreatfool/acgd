import libPath from 'path';

import libFsp from 'fs-promise';

import downAgent from '../../util/download.js';

import conf from '../../../config/config.json';

class ImageStrategy {

  constructor() {
    this.baseUrl = null;
    this.pattern = null;
    this.title = null;
    this.fileext = null;
  }

  async parseAlbums(taskUrl) {} // promise

  async parseImages(albumUrl) {} // promise

  _parseFilenameFromUrl(imageUrl) {} // sync

  async ensureOutputDir() { // promise
    let path = libPath.join(conf.downloadBase, this.title);
    let exists = await libFsp.exists(path);
    if (!exists) {
      await libFsp.mkdir(path);
    }
  }

  downloadImage(imageUrl) { // promise
    return new Promise((resolve, reject) => {
      let filePath = this._buildFileOutputPath(imageUrl);
      libFsp.stat(filePath).then((stat) => {
        // file found
        downAgent.getSizeWithRetry(imageUrl).then((size) => {
          if (size == stat.size) {
            // file completely downloaded
            resolve();
          } else {
            // partly downloaded, restart
            downAgent.writeBinaryWithRetry(imageUrl, filePath, size).then(() => resolve(), (err) => reject(err));
          }
        }, (err) => reject(err));
      }, (err) => {
        if (err.code == 'ENOENT') {
          // file not found
          downAgent.writeBinaryWithRetry(imageUrl, filePath).then(() => resolve(), (err) => reject(err));
        } else {
          // other error
          reject(err);
        }
      });
    });
  }

  _buildFileOutputPath(imageUrl) { // sync
    return libPath.join(conf.downloadBase, this.title, this._parseFilenameFromUrl(imageUrl));
  }

}

export default ImageStrategy;