import libFs from 'fs';
import libRequest from 'request';
import libFilesize from 'filesize';

import PromiseRetry from './retry.js';
import Logger from './logger.js';

class DownloadAgent {

  constructor() {
    this.timeout = 5000; // 5s

    this.request = libRequest.defaults({
      timeout: this.timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36'
      }
    });
  }

  getInfo(url) { // http head
    return new Promise((resolve, reject) => {
      this.request.head(url, (err, res) => {
        if (err != null) {
          reject(err);
        }
        resolve(res);
      });
    });
  }

  getInfoWithRetry(url) { // http head
    return PromiseRetry.retry(this.getInfo, this, [url], 3);
  }

  getSize(url) { // byte
    return new Promise((resolve, reject) => {
      this.getInfoWithRetry(url).then((res) => {
        resolve(res.headers['content-length']);
      }).catch((err) => reject(err));
    });
  }

  getSizeWithRetry(url) { // byte
    return PromiseRetry.retry(this.getSize, this, [url], 3);
  }

  writeBinary(url, filePath) {
    return new Promise((resolve, reject) => {
      let req = this.request(url);

      req.on('error', (err) => {
        Logger.instance.error('[Worker][%s] File %s error in downloading: ', process.pid, url, err);
        reject(err);
      });
      req.on('response', (resp) => {
        let type = resp.headers['content-type'];
        let size = resp.headers['content-length'];
        if (resp && resp.statusCode == 200) {
          let dres = req.pipe(libFs.createWriteStream(filePath));

          dres.on('error', (err) => {
            Logger.instance.error('[Worker][%s] File %s error in downloading: ', process.pid, url, err);
            reject(err);
          });
          dres.on('close', () => {
            Logger.instance.info('[Worker][%s] File %s downloaded, type: %s, size: %s', process.pid, url, type ,libFilesize(size));
            resolve();
          });
        } else {
          Logger.instance.error('[Worker][%s] File %s status code invalid, code: %d', process.pid, url, resp.statusCode);
          resolve(); // wrong code skip it
        }
      });
    });
  }

  writeBinaryWithRetry(url, filePath) {
    return PromiseRetry.retry(this.writeBinary, this, [url, filePath], 10);
  }

}

export default new DownloadAgent();