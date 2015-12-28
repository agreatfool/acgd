import ProgressBar from 'progress';

class Progress {

  buildProgressBar(name, totalLength) {
    return new ProgressBar('Downloading "' + name + '" [:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total: totalLength
    });
  }

}

export default new Progress();