import libPath from 'path';

import Logger from '../util/logger.js';

class InstanceLoader {

  static load(downloadType, downloadStrategy = '') {
    Logger.instance.info('[acgd] Worker[%s]: Load instance: %s %s', process.pid, downloadType, downloadStrategy);

    let type = downloadType.toLowerCase();

    let strategy = '';
    if (downloadStrategy != '') {
      strategy = downloadStrategy.toLowerCase()
    }

    return downloadStrategy == '' ?
      require(libPath.join(__dirname, '..', type, type + '.js')).default :
      require(libPath.join(__dirname, '..', 'strategy', type, strategy + '.js')).default;
  }

}

export default InstanceLoader;