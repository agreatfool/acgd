import ProcessorBase from '../base/processor.js';

import libFsp from 'fs-promise';
import libValidUrl from 'valid-url';

import Logger from '../util/logger';

class ImageProcessor extends ProcessorBase {

  constructor(strategy, source) {
    this.strategy = strategy;
    this.source = source;
  }

  async init() {
    Logger.instance.info('[ImageProcessor] Start to work, source: %s', this.source);

    if (libValidUrl.isUri(this.source)) {
      // 给予的资源参数是一个链接,即需要下载的albumUrl
      this.start(this.source);
    } else if (await libFsp.exists(this.source)) {
      // 给予的资源参数是一个本地文件,即需要下载的内容列表,每个URL一行
      let fileContent = await libFsp.readFile(this.source);
      let lines = fileContent.match(/^.*((\r\n|\n|\r)|$)/gm);
      lines.forEach((line) => {
        if (line == '' || line == undefined || line == null) {
          return;
        }
        this.start(line);
      });
    } else {
      // 非法资源
      Logger.instance.error('[ImageProcessor] Invalid source: %s', this.source);
      process.exit(1);
    }
  }

  start(albumUrl) {
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

export default ImageProcessor;