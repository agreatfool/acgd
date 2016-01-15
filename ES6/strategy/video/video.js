import libPath from 'path';

import libFsp from 'fs-promise';
import libMkdirp from 'mkdirp';

import downAgent from '../../util/download.js';

import conf from '../../../config/config.json';

class VideoStrategy {

  constructor() {
    this.baseUrl = null; // 下载的基本url
    this.pattern = null; // 下载中使用的正则pattern
    this.title = null;   // 当前下载任务的标题
    this.fileext = null; // 该次下载的文件扩展
  }

  /**
   * 从指定的任务url中解析出所有的视频url
   * @param {string} taskUrl
   * @return {Promise} [videoUrl, ...]
   */
  async parseVideos(taskUrl) {}

  /**
   * 从指定的视频url中解析出所有视频片段的url
   * @param {string} videoUrl
   * @return {Promise} [videoName, [videoUrlInfo, ...]], videoUrlInfo: [videoName, videoUrl, shardFileName]
   */
  async parseVideo(videoUrl) {}

  /**
   * 检查并保证输出路径存在
   * @param {string} videoName
   * @return {Promise}
   */
  async ensureOutputDir(videoName = '') {
    let path = libPath.join(conf.downloadBase, this.title.replace('/', '_'), videoName.replace('/', '_'));
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
   * @param {Array} videoUrlInfo [videoName, videoUrl, shardFileName]
   * @returns {Promise}
   */
  downloadVideo(videoUrlInfo) {
    return new Promise((resolve, reject) => {
      let videoUrl = videoUrlInfo[1];
      let filePath = this._buildFileOutputPath(videoUrlInfo);
      libFsp.stat(filePath).then((stat) => {
        // file found
        downAgent.getSizeWithRetry(videoUrl).then((size) => {
          if (size == stat.size) {
            // file completely downloaded
            resolve();
          } else {
            // partly downloaded, restart
            downAgent.writeBinaryWithRetry(videoUrl, filePath, true).then(() => resolve()).catch((err) => reject(err));
          }
        }).catch((err) => reject(err));
      }).catch((err) => {
        if (err.code == 'ENOENT') {
          // file not found, shall be 404
          downAgent.writeBinaryWithRetry(videoUrl, filePath, true).then(() => resolve()).catch((err) => reject(err));
        } else {
          // other error
          reject(err);
        }
      });
    });
  }

  /**
   * 构造文件输出路径
   * @param {Array} videoUrlInfo [videoName, videoUrl, shardFileName]
   * @returns {string}
   */
  _buildFileOutputPath(videoUrlInfo) { // sync
    return libPath.join(conf.downloadBase, this.title, videoUrlInfo[0], videoUrlInfo[2]);
  }

}

export default VideoStrategy;