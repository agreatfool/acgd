import winston from 'winston';
import moment from 'moment';

class Logger {

  constructor() {
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
          filename: 'log/acgd_' + moment().format() + '.log',
          level: 'error' // max level
        })
      ]
    });
  }

  get instance() {
    return this.logger;
  }

}

export default new Logger();