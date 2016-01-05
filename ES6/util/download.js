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

  writeBinary(url, filePath) {
    return new Promise((resolve, reject) => {
      let req = libRequest(url);

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
          resolve(); // wrong code skip it
        }
      });
    });
  }

}

export default new DownloadAgent();