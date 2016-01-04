import libFs from 'fs';
import libRequest from 'request';

import Logger from './logger.js';

class DownloadAgent {

  getBinary(url, filePath) {
    return new Promise((resolve) => {
      console.log(url);
      libRequest.head(url, function(err, res){

        Logger.instance.info('[Worker][%s] Image %s, type: %s, length: %s', url, res.headers['content-type'], res.headers['content-length']);

        let dres = libRequest(url).pipe(libFs.createWriteStream(filePath));
        dres.on('close', () => resolve());
      });
    });
  }

}

export default new DownloadAgent();