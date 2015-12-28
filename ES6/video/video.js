import ProcessorBase from '../base/processor.js';

import Logger from '../util/logger';

class VideoProcessor extends ProcessorBase {

  constructor(strategy, source) {
    this.strategy = strategy;
    this.source = source;
  }

  init() {
    Logger.instance.info('初始化整个下载工作');
  }

  start() {
    Logger.instance.info('开始整个下载工作');
  }

  prepareList() {
    Logger.instance.info('读取最外层的下载页面，剥离下载列表');
  }

  downloadList() {
    Logger.instance.info('根据剥离出来的下载列表，解析可能存在的二级列表，最后开始解析并下载内容');
  }

  downloadFile() {
    Logger.instance.info('下载单个文件');
  }

  persistFile() {
    Logger.instance.info('保存文件，可能牵涉到部分文件转换工作（视频）');
  }

  end() {
    Logger.instance.info('结束整个下载流程');
  }

}

export default VideoProcessor;