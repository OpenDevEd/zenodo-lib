#!/usr/bin/env node

import * as argparse from 'argparse';
import logger = require('./logger');
import zenodolib = require('./zenodo-lib');

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
  if (version) {
    return logger.info(`zenodo-lib version=${version}`);
  }
  return version;
}

function getArguments() {
  const parser = new argparse.ArgumentParser({
    description: 'Zenodo command line utility',
  });
  parser.add_argument('--config', {
    action: 'store',
    default: 'config.json',
    help:
      'Config file with API key. By default config.json then ~/.config/zenodo-cli/config.json are used if no config is provided.',
  });
  parser.add_argument('--config-json', {
    action: 'store',
    help:
      'Config string/object with API key.E.g., \'{"accessToken": "...", "env": "sandbox"}\'. Note: Elements override --config. On the command line, pass a string. For library use, pass string or object.',
  });
  parser.add_argument('--access-token', {
    action: 'store',
    help:
      'Access token (API key) for Zenodo. If provided, overrides --config file and --config-json.',
  });
  parser.add_argument('--sandbox', {
    action: 'store_true',
    help:
      'Indicate that the Zenodo API key provided is for the Zenodo sandbox. If provided, it overrides --zenodo-config file and --zenodo-config-json.',
  });
  parser.add_argument('--verbose', {
    action: 'store_true',
    help: 'Be more verbose',
    default: false,
  });
  parser.add_argument('--debug', {
    action: 'store_true',
    help: 'Show as much information as possible.',
    default: false,
  });
  parser.add_argument('--dryrun', {
    action: 'store_true',
    help: 'Show the API request and exit.',
    default: false,
  });
  parser.add_argument('--allowconceptids', {
    action: 'store_true',
    help:
      'If you specify a conceptid, this is replaced by the record_id. Otherwise an error is produced.',
    default: false,
  });
  parser.add_argument('--version', {
    action: 'store_true',
    help: 'Show version',
  });

  const subparsers = parser.add_subparsers({ help: 'sub-command help' });

  // subcommand about interface
  // zenodolib.about({ getInterface: true }, subparsers);
  const aboutSubparser = subparsers.add_parser('about', {
    help: 'This command returns details about the api key.',
  });
  aboutSubparser.set_defaults({ func: zenodolib.about });

  zenodolib.list({ getInterface: true }, subparsers);

  // subcommand record parser
  // zenodolib.record({ getInterface: true }, subparsers);
  const recordSubparser = subparsers.add_parser('record', {
    help:
      'This command gets the record for the ids listed, and writes these out to id1.json, id2.json etc. The id can be provided as a number, as a deposit URL or record URL',
  });
  recordSubparser.set_defaults({ func: zenodolib.getRecord });
  recordSubparser.add_argument('id', { nargs: '*' });
  recordSubparser.add_argument('--strict', {
    action: 'store_true',
    help: 'Publish the deposition after executing the command.',
    default: false,
  });
  recordSubparser.add_argument('--publish', {
    action: 'store_true',
    help: 'Publish the deposition after executing the command.',
    default: false,
  });
  recordSubparser.add_argument('--open', {
    action: 'store_true',
    help: 'Open the deposition in the browser after executing the command.',
    default: false,
  });
  recordSubparser.add_argument('--show', {
    action: 'store_true',
    help:
      'Show key information for the deposition after executing the command.',
    default: false,
  });
  recordSubparser.add_argument('--dump', {
    action: 'store_true',
    help: 'Show json for deposition after executing the command.',
    default: false,
  });

  // subcommand create parser
  // zenodolib.create({ getInterface: true }, subparsers);
  // TODO: Make sure these options stay in line with 'update'.
  const createSubparser = subparsers.add_parser('create', {
    help:
      'The create command creates new records based on the json files provided, optionally providing a title / date / description / files.',
  });
  createSubparser.set_defaults({ func: zenodolib.create });
  createSubparser.add_argument('--json', {
    action: 'store',
    help:
      'Path of the JSON file with the metadata for the zenodo record to be created. If this file is not provided, a template is used. The following options override settings from the JSON file / template.',
  });
  createSubparser.add_argument('--title', {
    action: 'store',
    help: 'The title of the record. Overrides data provided via --json.',
  });
  createSubparser.add_argument('--date', {
    action: 'store',
    help: 'The date of the record. Overrides data provided via --json.',
  });
  createSubparser.add_argument('--description', {
    action: 'store',
    help:
      'The description (abstract) of the record. Overrides data provided via --json.',
  });
  createSubparser.add_argument('--communities', {
    action: 'store',
    help:
      'Read list of communities for the record from a file. Overrides data provided via --json.',
  });
  createSubparser.add_argument('--add-communities', {
    nargs: '*',
    action: 'store',
    help:
      'List of communities to be added to the record (provided on the command line, one by one). Overrides data provided via --json.',
  });
  createSubparser.add_argument('--remove-communities', {
    nargs: '*',
    action: 'store',
    help:
      'List of communities to be removed from the record (provided on the command line, one by one). Overrides data provided via --json.',
  });
  createSubparser.add_argument('--authors', {
    nargs: '*',
    action: 'store',
    help:
      "List of authors, (provided on the command line, one by one). Separate institution and ORCID with semicolon, e.g. 'Lama Yunis;University of XYZ;0000-1234-...'. (You can also use --authordata.) Overrides data provided via --json.",
  });
  createSubparser.add_argument('--authordata', {
    action: 'store',
    help:
      'A text file with a database of authors. Each line has author, institution, ORCID (tab-separated). The data is used to supplement insitution/ORCID to author names specified with --authors. Note that authors are only added to the record when specified with --authors, not because they appear in the specified authordate file. ',
  });
  createSubparser.add_argument('--zotero-link', {
    action: 'store',
    help:
      'Zotero link of the zotero record to be linked. Overrides data provided via --json.',
  });
  createSubparser.add_argument('--publish', {
    action: 'store_true',
    help: 'Publish the deposition after executing the command.',
    default: false,
  });
  createSubparser.add_argument('--open', {
    action: 'store_true',
    help: 'Open the deposition in the browser after executing the command.',
    default: false,
  });
  createSubparser.add_argument('--show', {
    action: 'store_true',
    help: 'Show the info of the deposition after executing the command.',
    default: false,
  });
  createSubparser.add_argument('--dump', {
    action: 'store_true',
    help: 'Show json for deposition after executing the command.',
    default: false,
  });

  zenodolib.update({ getInterface: true }, subparsers);
  zenodolib.duplicate({ getInterface: true }, subparsers);
  zenodolib.upload({ getInterface: true }, subparsers);
  zenodolib.copy({ getInterface: true }, subparsers);
  zenodolib.newVersion({ getInterface: true }, subparsers);
  zenodolib.download({ getInterface: true }, subparsers);
  zenodolib.concept({ getInterface: true }, subparsers);

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
        2
      )})`
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

module.exports = {
  node: 'current',
};
