import VideoStrategy from './video.js';

import libUrl from 'url';
import libPath from 'path';
import libUtil from 'util';
import libCheerio from 'cheerio';
import libValidUrl from 'valid-url';
import libUuid from 'node-uuid';
import libFsp from 'fs-promise';

import needle from '../../util/needle.js';
import Logger from '../../util/logger.js';
import Phantom from '../../util/phantom.js';
import downAgent from '../../util/download.js';

import conf from '../../../config/config.json';

class Blibili extends VideoStrategy {

  constructor() {
    super();

    this.baseUrl = 'http://www.bilibili.com/';
    this.pattern = /http:\/\/www.bilibili.com\/video\/av\d+\/?.+/;

    this.flvcd = 'http://www.flvcd.com/parse.php?format=&kw=';

    this.title = null;
    this.fileext = null;
  }

  async parseVideos(taskUrl) {
    // validate url
    let match = taskUrl.match(this.pattern);
    if (null == match) {
      Logger.instance.error('[Worker][%s] Invalid taskUrl: %s', process.pid, taskUrl);
      return [];
    }

    let videoUrls = [];

    let html = await Phantom.getRenderedPageWithRetry(taskUrl, libPath.join(__dirname, 'bilibili_phantom.js'));
    let $ = libCheerio.load(html);

    this.title = $('.v-title').text();

    videoUrls.push(taskUrl);
    $('#plist a').each((index, element) => {
      videoUrls.push(libUrl.resolve(this.baseUrl, $(element).attr('href')));
    });

    return [videoUrls.shift()];
    //return videoUrls;
  }

  async parseVideo(videoUrl) { // return promise
    let html = await needle.getWithRetry(this.flvcd + videoUrl);
    let $ = libCheerio.load(html);
    let coreSelector = $('.mn.STYLE4');

    // 解析标题
    let title = '';
    coreSelector.each((index, element) => {
      let match = $(element).text().match(/当前解析视频：(.+)（请用右键"目标另存为"或硕鼠来快速下载\.）/);
      if (match != null) {
        title = match[1].trim();
      }
    });
    if (!title) {
      Logger.instance.error('[Worker][%s] Cannot parse title from %s', process.pid, videoUrl);
      return [];
    }

    let shardUrls = [
      // ["manga_album_title", "url", "filename"]
    ];
    $($($('body table')[3]).find('tr')[0]).find('a').each((index, element) => {
      // 验证shard地址是否合法
      let shardUrl = $(element).attr('href');
      if (shardUrl.match(/http:\/\/.+acgvideo\.com\/?.+/) == null) {
        return; // invalid shard url
      }
      // 获取shard文件名
      let shardName = '';
      let match = shardUrl.match(/http:\/\/.+acgvideo\.com.+\/(.+)\?.+/);
      if (match == null) {
        Logger.instance.warn('[Worker][%s] Cannot parse file name from %s', process.pid, shardUrl);
        return;
      } else {
        shardName = match[1];
      }
      // 组装结果
      shardUrls.push([title, shardUrl, shardName]);
    });

    return shardUrls;
  }

}

export default Blibili;