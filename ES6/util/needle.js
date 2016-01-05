import libUtil from 'util';
import libNeedle from 'needle';

class Needle {

  constructor() {
    this.connectTimeout = 5000; // 5s
    this.requestTimeout = 10000; // 10s

    libNeedle.defaults({
      open_timeout: this.connectTimeout,
      read_timeout: this.requestTimeout,
      agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36'
    });
  }

  get(url) { // return promise
    return new Promise((resolve, reject) => {
      libNeedle.get(url, (err, response) => {
        if (err != null) {
          reject(err); return;
        }
        if (!response) {
          reject(new Error('[Worker][%s] Needle::get Invalid response')); return;
        }
        if (response.statusCode != 200) {
          reject(new Error(libUtil.format('[Worker][%s] Needle::get Wrong HTTP response, code: %d, messsage: %s', process.pid, response.statusCode, response.statusText))); return;
        }
        resolve(response.body);
      })
    });
  }

}

export default new Needle();