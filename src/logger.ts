const { createLogger, format, transports } = require('winston');

import parser = require('./parser');

console.log('parser: ', parser);

function getLogingLevel() {
  const args = parser.parse_args();

  let level = 'info';

  if (args.silent) {
    level = 'error';
  } else if (args.verbosityLevel === 1) {
    level = 'verbose';
  } else if (args.verbosityLevel === 2) {
    level = 'debug';
  } else {
    level = 'info';
  }

  return level;
}

// Configure the Winston logger. For the complete documentation see https://github.com/winstonjs/winston
const logger = createLogger({
  // To see more detailed errors, change this to 'debug'
  level: getLogingLevel(),
  format: format.combine(format.splat(), format.simple()),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
    new transports.Console(),
  ],
});
export = logger;
