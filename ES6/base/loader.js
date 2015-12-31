import libPath from 'path';

import Logger from '../util/logger.js';

class InstanceLoader {

  load(downloadType, downloadStrategy = null) {
    Logger.instance.info('[acgd] Load instance: %s-%s', downloadType, downloadStrategy);

    let type = downloadType.toLowerCase();

    let strategy = null;
    if (downloadStrategy != null) {
      strategy = downloadStrategy.toLowerCase()
    }

    return downloadStrategy == null ?
      require(libPath.join('..', type, type + '.js')) :
      require(libPath.join('..', 'strategy', type, strategy + '.js'));
  }

}

export default new InstanceLoader();