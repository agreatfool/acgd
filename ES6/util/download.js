import libFs from 'fs';
import libRequest from 'request';
import libFilesize from 'filesize';

import Logger from './logger.js';

class DownloadAgent {

  getInfo(url) { // http head
    return new Promise((resolve, reject) => {
      libRequest.head(url, (err, res) => {
        if (err != null) {
          reject(err);
        }
        resolve(res);
      });
    });
  }

  getSize(url) { // byte
    return new Promise((resolve, reject) => {
      this.getInfo(url).then((res) => {
        resolve(res.headers['content-length']);
      }, (err) => reject(err));
    });
  }

  writeBinary(url, filePath, size = null) {
    return new Promise((resolve, reject) => {
      let dres = libRequest(url).pipe(libFs.createWriteStream(filePath));
      dres.on('error', (err) => {
        Logger.instance.error('[Worker][%s] Image %s error: ', process.pid, url, err);
        reject(err);
      });
      dres.on('close', () => {
        if (null == size) {
          Logger.instance.info('[Worker][%s] Image %s downloaded', process.pid, url);
        } else {
          Logger.instance.info('[Worker][%s] Image %s downloaded, size: %s', process.pid, url, libFilesize(size));
        }
        resolve();
      });
    });
  }

}

export default new DownloadAgent();