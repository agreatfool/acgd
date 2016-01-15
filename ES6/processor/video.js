import ProcessorBase from '../base/processor.js';

import Logger from '../util/logger';

class VideoProcessor extends ProcessorBase {

  constructor() {
    super();

    this.strategy = null;

    this.videoConcurrencyLimit = 1;  // 同时进行解析的video数量,NOTE:某些站点在请求过速的时候会报错,请尽量测试后尝试修改并发数
    this.shardConcurrencyLimit = 5;  // 同时进行下载的视频数量
    this.videoUrls = []; // 正在解析的视频url列表,解析完成后会被移除,因此length为0表示下载地址都解析完成
    this.shards = [];    // 正在下载的图片列表,当this.videoUrls和shards同时length为0,则表示下载完成
  }

  init(strategy) {
    Logger.instance.info('[VideoProcessor][%s] Init ...', process.pid);

    this.strategy = strategy;
  }

  async start(taskUrl) {
    Logger.instance.info('[VideoProcessor][%s] Start to process single task: %s', process.pid, taskUrl);

    try {
      // 解析相册地址列表
      this.videoUrls = await this.strategy.parseVideos(taskUrl);
      Logger.instance.info('[VideoProcessor][%s] Videos to be downloaded: %d', process.pid, this.videoUrls.length);

      if (!this.strategy.title) {
        Logger.instance.warn('[VideoProcessor][%s] Failed to parse the task title: %s', process.pid, taskUrl);
      }

      if (this.videoUrls.length == 0) {
        return; // nothing to download
      }
    } catch (err) {
      return Promise.reject(err);
    }


    // 从视频url解析出子视频地址列表
    let videoProcessing = 0;

    let videoTimer = setInterval(() => {
      if (this.videoUrls.length > 0 && videoProcessing < this.videoConcurrencyLimit) {
        videoProcessing++;
        this.strategy.parseVideo(this.videoUrls.shift()).then((videoInfos) => {
          videoProcessing--;
          let videoName = videoInfos[0]; // string
          let videoUrlInfos = videoInfos[1]; // [[albumName, imageUrl, imageFileName], ...]
          Logger.instance.info('[VideoProcessor][%s] Video sub shard count parsed, name: %s, count: %d', process.pid, videoName, videoUrlInfos.length);
          this.strategy.ensureOutputDir(videoName).then(() => {
            this.shards.push(...videoUrlInfos);
          }).catch((err) => {
            Logger.instance.error(err);
          });
        }).catch((err) => {
          videoProcessing--;
          Logger.instance.error(err);
        });
      }

      if (this.videoUrls.length <= 0 && videoProcessing <= 0) {
        clearInterval(videoTimer);
      }
    }, 300); // 0.3s

    // 视频下载
    return new Promise((resolve) => {
      let shardProcessing = 0;

      let reporter = setInterval(() => {
        Logger.instance.info('[VideoProcessor][%s] Video not assigned: %d, parsing: %d; Shard not assigned: %d, downloading: %d',
          process.pid, this.videoUrls.length, videoProcessing, this.shards.length, shardProcessing);
      }, 5000); // 5s

      let shardTimer = setInterval(() => {
        // process download
        if (this.shards.length > 0 && shardProcessing < this.shardConcurrencyLimit) {
          shardProcessing++;
          this.strategy.downloadVideo(this.shards.shift()).then(() => {
            shardProcessing--;
          }).catch((err) => {
            shardProcessing--;
            Logger.instance.error(err);
          });
        }

        // check status
        if (this.videoUrls.length <= 0 && videoProcessing <= 0
          && this.shards.length <= 0 && shardProcessing <= 0) {
          clearInterval(reporter);
          clearInterval(shardTimer);
          resolve();
        }
      }, 300); // 0.3s
    });
  }

}

export default VideoProcessor;