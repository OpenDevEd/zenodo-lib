#!/usr/bin/env node
import parser = require('./parser');
import logger = require('./logger');
// import configureSubparsers = require('./subparsers/configureSubparsers');

// import record = require('./subparsers/record');
// import about = require('./subparsers/about');
// import create = require('./subparsers/create');
// import update = require('./subparsers/update');
// import duplicate = require('./subparsers/duplicate');
// import upload = require('./subparsers/upload');

// PRODUCTION: Load library
/*
import {
  concept,
  copy,
  create,
  download,
  duplicate,
  listDepositions,
  newVersion,
  getRecord,
  update,
  upload
} from zenodolib; // from "lib-zenodo-api" where lib-zenodo-api is module in npm install
*/

function getVersion() {
  const version = process.env.npm_package_version;
  logger.info(`zenodo-lib version=${version}`);
}

function getArguments() {
  // about(subparsers);
  // record(subparsers);
  // create(subparsers);
  // update(subparsers);
  // duplicate(subparsers);
  // upload(subparsers);

  console.log('parser: ', parser);
  // console.log('subparsers: ', configureSubparsers);
  // configureSubparsers(parser);
  console.log('parse: ', parser);
  const parsed = parser.parse_args();

  if (process.argv.length === 2) {
    logger.info('No argument passed exiting with help');
    parser.print_help();
    process.exit(1);
  }
  return parsed; // r.parse_args();
}

// --- main ---
async function run() {
  const args = getArguments();
  if (args.verbose) {
    logger.info('zenodo-cli starting...');
  }
  if (args.version) {
    getVersion();
    return 0;
  }
  // zenodo-cli create --title "..." --authors "..." --dryrun
  if (args.dryrun) {
    logger.info(
      `API command:\n zenodolib.${args.func.name}(${JSON.stringify(
        args,
        null,
        2,
      )})`,
    );
  } else {
    const result = await args.func(args);
    // const result = await ZenodoAPI(args);
    if (args.verbose) {
      logger.info('zenodo-cli result=');
    }
    logger.info(`${JSON.stringify(result, null, 2)}`);
    if (args.func.name === 'listDepositions') {
      // TODO: Just list the ids in pairs.
      // logger.info(`zenodo-cli result=${JSON.stringify(result, null, 2)}`);
    }
  }
  return 0;
}

run();
