import ImageStrategy from './image.js';

import libPath from 'path';
import libUtil from 'util';
import libCheerio from 'cheerio';
import libValidUrl from 'valid-url';
import libUuid from 'node-uuid';
import libFsp from 'fs-promise';

import needle from '../../util/needle.js';
import Logger from '../../util/logger.js';

import conf from '../../../config/config.json';

class Zngirls extends ImageStrategy {

  constructor() {
    super();

    this.baseUrl = 'http://www.zngirls.com/g/';
    this.pattern = /(http:\/\/www.zngirls.com\/g\/\d+)(\/?|\/(.+))$/;
    this.patternImage = /(http:\/\/\w+.zngirls.com\/gallery\/\d+\/\d+)(\/?|\/(.+))$/;
    /**
     * match:
     * http://www.zngirls.com/g/11231  => ["http://www.zngirls.com/g/11231", "http://www.zngirls.com/g/11231", "", undefined]
     * http://www.zngirls.com/g/11231/ => ["http://www.zngirls.com/g/11231/", "http://www.zngirls.com/g/11231", "/", undefined]
     * http://www.zngirls.com/g/11231/9.html => ["http://www.zngirls.com/g/11231/9.html", "http://www.zngirls.com/g/11231", "/9.html", "9.html"]
     * http://www.zngirls.com/g/11231/044.jpg => ["http://www.zngirls.com/g/11231/044.jpg", "http://www.zngirls.com/g/11231", "/044.jpg", "044.jpg"]
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

    // get base url
    this.baseUrl = match[1];

    let lastPageId = await this._parseLastPageId();

    let albumUrls = [];
    for (let pageId = 1; pageId <= lastPageId; pageId++) {
      albumUrls.push(this._buildPageUrlViaId(pageId));
    }

    return albumUrls;
  }

  async parseImages(albumUrl) { // return promise
    let html = await needle.getWithRetry(albumUrl);
    let $ = libCheerio.load(html);

    let imageUrls = [];

    $('#hgallery img').each((index, element) => {
      let imageUrl = $(element).attr('src');
      if (libValidUrl.isUri(imageUrl)) {
        imageUrls.push(imageUrl);
      }
    });

    return imageUrls;
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

export default Zngirls;