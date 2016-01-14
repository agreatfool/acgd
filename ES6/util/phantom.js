import libCp from 'child_process';
import libPath from 'path';

import Logger from './logger.js';
import PromiseRetry from './retry.js';

class Phantom {

  getRenderedPage(url) {
    return new Promise((resolve, reject) => {
      let child = libCp.spawn('phantomjs', [libPath.join(__dirname, 'phantom_exec.js'), url]);

      let buff = '';
      let error = '';

      child.stdout.on('data', (data) => {
        buff += data;
      });

      child.on('close', (code) => {
        if (0 === code) {
          //Logger.instance.info('[Phantom][%s] phantomjs succeed with code: %s', process.pid, code); // too more logs
          resolve(buff);
        } else {
          Logger.instance.error('[Phantom][%s] phantomjs failed with code: %s, out: %s', process.pid, code, buff);
          reject(buff);
        }
      });
    });
  }

  getRenderedPageWithRetry(url) { // return promise
    return PromiseRetry.retry(this.getRenderedPage, this, [url], 5);
  }

}

export default new Phantom();