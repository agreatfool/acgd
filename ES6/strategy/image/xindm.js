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
        this.title += '_' +match[1].trim();
      }
    });

    //return albumUrls.reverse();
    return [albumUrls.reverse().shift()];
  }

  async parseImages(albumUrl) { // return promise
    let html = await Phantom.getRenderedPage(albumUrl);
    let $ = libCheerio.load(html);

    let imageUrls = [
      // ["manga_album_title", "url"]
    ];

    let title = $('.mh_title strong').text();
    if (!title) {
      Logger.instance.error('[Worker][%s] Cannot parse title from %s', process.pid, albumUrl);
      return [];
    }

    let pageMatch = $('#J_showpage').text().match(/.+;(.+)/); // ["112/document.write(maxpages);113", "113"]
    if (pageMatch == null) {
      Logger.instance.error('[Worker][%s] Cannot parse max page from %s', process.pid, albumUrl);
    }
    let maxPage = parseInt(pageMatch[1]);

    for (let pageId = 1; pageId <= maxPage; pageId++) {
      console.log(await Phantom.getRenderedPage(libUrl.resolve(albumUrl, '?page=' + pageId)));
      break;
    }

    return [];
  }

  _parseFilenameFromUrl(imageUrl) {
    let match = imageUrl.match(this.patternImage);
    if (match != null) {
      this.fileext = libPath.extname(match[3]);
      return match[3];
    } else {
      Logger.instance.warn('[Worker][%s] Image filename not parsed from url: %s', process.pid, imageUrl);
      return libUuid.v4() + this.fileext;
    }
  }

  async _parseLastPageId(lastPageId = 1) {
    let retrievedId = await this._parseLastPageIdOnCurrentPage(lastPageId);

    if (retrievedId > lastPageId) {
      return this._parseLastPageId(retrievedId);
    } else if (lastPageId == retrievedId + 1) {
      return new Promise((resolve) => {
        resolve(lastPageId);
      });
    } else {
      return new Promise((resolve) => {
        resolve(retrievedId);
      });
    }
  }

  async _parseLastPageIdOnCurrentPage(pageId) {
    let html = await needle.getWithRetry(this._buildPageUrlViaId(pageId));
    let $ = libCheerio.load(html);
    this.title = $('title').text();

    let lastPageId = 0;

    return new Promise((resolve) => {
      $('#pages a').each((index, element) => {
        let match = $(element).text().match(/(\d+)$/);
        if (match != null) {
          let pageId = parseInt(match[1]);
          if (pageId > lastPageId) {
            lastPageId = pageId;
          }
        }
      });
      resolve(lastPageId);
    });
  }

  _buildPageUrlViaId(pageId) {
    return this.baseUrl + '/' + pageId + '.html';
  }

}

export default Xindm;