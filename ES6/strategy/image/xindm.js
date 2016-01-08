import ImageStrategy from './image.js';

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

class Xindm extends ImageStrategy {

  constructor() {
    super();

    this.baseUrl = 'http://www.xindm.cn';
    this.pattern = /http:\/\/www.xindm.cn\/mh\/\w+\/?/;
    this.patternImage = /http:\/\/\w+.xindm.cn\/\w+\/\w+\/\w+\/\w+\/(.+)/;
    /**
     * match:
     * http://mh.xindm.cn/book/j/jdzs_UC/vol_03/000001.jpg
     * =>
     * ["http://mh.xindm.cn/book/j/jdzs_UC/vol_03/000001.jpg", "000001.jpg"]
     */
    this.patternImageCdn = /http:\/\/\w+.bao123.cc\/\w+.php\?url=(.+)/;
    /**
     * match:
     * http://sx2.bao123.cc/pic.php?url=http%3A%2F%2Fimages.dmzj.com%2Fs%2F%CA%D8%BB%A4%CC%EC%CA%B9happyworld%2F%B5%DA06%BE%ED%2F001.jpg
     * =>
     * [
     *   "http://sx2.bao123.cc/pic.php?url=http%3A%2F%2Fimages.dmzj.com%2Fs%2F%CA%D8%BB%A4%CC%EC%CA%B9happyworld%2F%B5%DA06%BE%ED%2F002.jpg",
     *   "http%3A%2F%2Fimages.dmzj.com%2Fs%2F%CA%D8%BB%A4%CC%EC%CA%B9happyworld%2F%B5%DA06%BE%ED%2F002.jpg"
     * ]
     */

    this.title = null;
    this.fileext = null;

    this.albumNames = [];

    this.concurrencyLimit = 10;
    this.processingImageParsing = 0;
  }

  async parseAlbums(taskUrl) { // return promise
    // validate url
    let match = taskUrl.match(this.pattern);
    if (null == match) {
      Logger.instance.error('[Worker][%s] Invalid taskUrl: %s', process.pid, taskUrl);
      return [];
    }

    let albumUrls = [];

    let html = await needle.getWithRetry(taskUrl);
    let $ = libCheerio.load(html);

    $('#mhlist a').each((index, element) => {
      albumUrls.push(libUrl.resolve(this.baseUrl, $(element).attr('href')));
    });

    this.title = $('.fengmian_comic_head_con_r h1').text();
    $('.fengmian_comic_head_con_r dd').each((index, element) => {
      let match = $(element).text().match(/漫画作者：(.+)/);
      if (match != null) {
        this.title += '_' + match[1].trim();
      }
    });

    //return albumUrls.reverse(); //FIXME
    return [albumUrls.reverse().shift()];
  }

  async parseImages(albumUrl) { // return promise
    let html = await Phantom.getRenderedPageWithRetry(albumUrl);
    let $ = libCheerio.load(html);

    let imageUrls = [
      // ["manga_album_title", "url", "filename"]
    ];

    let title = $('.mh_title strong').text();
    if (!title) {
      Logger.instance.error('[Worker][%s] Cannot parse title from %s', process.pid, albumUrl);
      return [];
    }
    this.albumNames.push(title);

    let pageMatch = $('#J_showpage').text().match(/.+;(.+)/); // ["112/document.write(maxpages);113", "113"]
    if (pageMatch == null) {
      Logger.instance.error('[Worker][%s] Cannot parse max page count from %s', process.pid, albumUrl);
    }
    let maxPage = parseInt(pageMatch[1]);

    let imagePages = [];
    for (let pageId = 1; pageId <= maxPage; pageId++) {
      imagePages.push(libUrl.resolve(albumUrl, '?page=' + pageId));
    }

    return new Promise((resolve) => {
      let reporter = setInterval(() => {
        Logger.instance.info('[Worker][%s] Image page left not parsed: %d, parsing: %d', process.pid, imagePages.length, this.processingImageParsing);
      }, 5000); // 6s

      let timer = setInterval(() => {
        // process parsing
        if (imagePages.length > 0 && this.processingImageParsing < this.concurrencyLimit) {
          this.processingImageParsing++;
          this._parseImageUrlFromSingleWebPage(imagePages.shift()).then(
            (imageUrlInfo) => {
              this.processingImageParsing--;
              imageUrls.push([title, ...imageUrlInfo]);
            },
            (err) => {
              this.processingImageParsing--;
              Logger.instance.error(err);
            }
          );
        }

        // check status
        if (imagePages.length <= 0 && this.processingImageParsing <= 0) {
          clearInterval(reporter);
          clearInterval(timer);
          resolve(imageUrls);
        }
      }, 100); // 0.2s
    });
  }

  async _parseImageUrlFromSingleWebPage(url) {
    let imageUrl = '';
    let filename = '';
    let html = '';

    try {
      html = await Phantom.getRenderedPageWithRetry(url);
    } catch (err) {
      return new Promise((resolve, reject) => reject(err));
    }
    let $ = libCheerio.load(html);

    $('#imgArea img').each((index, element) => {
      if (imageUrl !== '') {
        return;
      }
      imageUrl = $(element).attr('src');
    });

    if (imageUrl === '') {
      return new Promise((resolve, reject) => reject(new Error(libUtil.format('[Worker][%s] Cannot parse image url from %s', process.pid, url))));
    }

    let selfSiteMatch = imageUrl.match(this.patternImage);
    let cdnSiteMatch = imageUrl.match(this.patternImageCdn);
    if (selfSiteMatch != null) {
      imageUrl = selfSiteMatch[0];
      filename = selfSiteMatch[1];
    } else if (cdnSiteMatch != null) {
      imageUrl = cdnSiteMatch[1];
      let nameMatch = imageUrl.match(/.+[^0-9](\d+\..+)/); // ["http%3A%2F%2Fimages.dmzj.com%2Fs%2F%CA%D8%BB%A4%CC%EC%CA%B9happyworld%2F%B5%DA06%BE%ED%2F002.jpg", "002.jpg"]
      if (nameMatch != null) {
        filename = nameMatch[1];
      } else {
        Logger.instance.warn('[Worker][%s] Image filename not parsed from url: %s', process.pid, imageUrl);
        filename = libUuid.v4() + this.fileext;
      }
    } else {
      return new Promise((resolve, reject) => reject(new Error(libUtil.format('[Worker][%s] Cannot parse image url from %s', process.pid, url))));
    }

    this.fileext = libPath.extname(filename);

    return new Promise((resolve) => {
      resolve([imageUrl, filename]);
    });
  }

  _parseFilenameFromUrl(imageUrl) {
    // do nothing
  }

  async ensureOutputDir() { // promise
    let path = libPath.join(conf.downloadBase, this.title);
    let exists = await libFsp.exists(path);
    if (!exists) {
      await libFsp.mkdir(path);
    }

    for (let albumName of this.albumNames) {
      let albumPath = libPath.join(path, albumName);
      let albumExists = await libFsp.exists(albumPath);
      if (!albumExists) {
        await libFsp.mkdir(albumPath);
      }
    }
  }

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

  _buildFileOutputPath(imageUrlInfo) { // sync
    return libPath.join(conf.downloadBase, this.title, imageUrlInfo[0], imageUrlInfo[2]);
  }

}

export default Xindm;