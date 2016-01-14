import libPath from 'path';

import libFsp from 'fs-promise';
import libMkdirp from 'mkdirp';

import downAgent from '../../util/download.js';

import conf from '../../../config/config.json';

class ImageStrategy {

  constructor() {
    this.baseUrl = null; // 下载的基本url
    this.pattern = null; // 下载中使用的正则pattern
    this.title = null;   // 当前下载任务的标题
    this.fileext = null; // 该次下载的文件扩展
  }

  /**
   * 从指定的任务url中解析出所有的相册url
   * @param {string} taskUrl
   * @return {Promise} [albumUrl, ...]
   */
  async parseAlbums(taskUrl) {}

  /**
   * 从指定的相册url中解析出相册所有的图片信息
   * @param {string} albumUrl
   * @return {Promise} [albumName, [imageUrlInfo, ...]], imageUrlInfo: [albumName, imageUrl, imageFileName]
   */
  async parseImages(albumUrl) {}

  /**
   * 从图片地址解析图片名
   * @param {string} imageUrl
   * @return {string}
   */
  _parseFilenameFromUrl(imageUrl) {}

  /**
   * 检查并保证相册的输出路径存在
   * @param {string} albumName
   * @return {Promise}
   */
  async ensureOutputDir(albumName = '') {
    let path = libPath.join(conf.downloadBase, this.title.replace('/', '_'), albumName.replace('/', '_'));
    let exists = await libFsp.exists(path);
    if (!exists) {
      return new Promise((resolve, reject) => {
        libMkdirp(path, (err) => {
          if (err != null) {
            reject(err);
          }
          resolve();
        });
      });
    }
  }

  /**
   * 下载文件
   * 文件的完整性会受到检查,如果文件下载到一半会继续下载,如果下载完成则跳过
   * @param {Array} imageUrlInfo [albumName, imageUrl, imageFileName]
   * @returns {Promise}
   */
  downloadImage(imageUrlInfo) { // promise
    return new Promise((resolve, reject) => {
      let imageUrl = imageUrlInfo[1];
      let filePath = this._buildFileOutputPath(imageUrlInfo);
      libFsp.stat(filePath).then((stat) => {
        // file found
        downAgent.getSizeWithRetry(imageUrl).then((size) => {
          if (size == stat.size) {
            // file completely downloaded
            resolve();
          } else {
            // partly downloaded, restart
            downAgent.writeBinaryWithRetry(imageUrl, filePath, size).then(() => resolve()).catch((err) => reject(err));
          }
        }).catch((err) => reject(err));
      }).catch((err) => {
        if (err.code == 'ENOENT') {
          // file not found
          downAgent.writeBinaryWithRetry(imageUrl, filePath).then(() => resolve()).catch((err) => reject(err));
        } else {
          // other error
          reject(err);
        }
      });
    });
  }

  /**
   * 构造文件输出路径
   * @param {Array} imageUrlInfo [albumName, imageUrl, imageFileName]
   * @returns {string}
   */
   _buildFileOutputPath(imageUrlInfo) { // sync
    return libPath.join(conf.downloadBase, this.title, imageUrlInfo[0], imageUrlInfo[2]);
  }

}

export default ImageStrategy;