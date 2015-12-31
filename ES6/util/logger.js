import winston from 'winston';
import moment from 'moment';

class Logger {

  constructor() {
    this.logFileName = 'acgd_' + moment().format() + '.log';

    this.logger = new winston.Logger({
      levels: {
        debug: 0,
        verbose: 1,
        info: 3,
        warn: 4,
        error: 5
      },
      colors: {
        debug: 'grey',
        verbose: 'cyan',
        info: 'green',
        warn: 'yellow',
        error: 'red'
      },
      transports: [
        new winston.transports.Console({
          name: 'acgd-console',
          level: 'error', // max level
          prettyPrint: true,
          colorize: true
        }),
        new winston.transports.File({
          name: 'acgd-file',
          filename: 'log/' + this.logFileName,
          level: 'error' // max level
        })
      ]
    });
  }

  get instance() {
    return this.logger;
  }

  get logName() {
    return this.logFileName;
  }

}

export default new Logger();