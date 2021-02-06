#!/usr/bin/env node

import * as argparse from 'argparse';

// PRODUCTION: Load library
const zenodolib = require("./zenodo-lib");

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
  const pjson = require('../package.json')
  if (pjson.version)
    console.log(`zenodo-lib version=${pjson.version}`)
  return pjson.version
}

function getArguments() {
  const parser = new argparse.ArgumentParser({ "description": "Zenodo command line utility" });
  parser.add_argument("--config", {
    "action": "store",
    "default": "config.json",
    "help": "Config file with API key. By default config.json then ~/.config/zenodo-cli/config.json are used if no config is provided."
  });
  parser.add_argument("--config-json", {
    "action": "store",
    "help": "Config string/object with API key.E.g., '{\"accessToken\": \"...\", \"env\": \"sandbox\"}'. Note: Elements override --config. On the command line, pass a string. For library use, pass string or object."
  });
  parser.add_argument("--api-key", {
    "action": "store",
    "help": "API key for Zenodo. If provided, overrides --config file and --config-json."
  });
  parser.add_argument("--sandbox", {
    "action": "store_true",
    "help": "Indicate that the Zenodo API key provided is for the Zenodo sandbox. If provided, it overrides --zenodo-config file and --zenodo-config-json."
  });
  parser.add_argument("--verbose", {
    "action": "store_true",
    "help": "Be more verbose",
    "default": false
  });
  parser.add_argument("--debug", {
    "action": "store_true",
    "help": "Show as much information as possible.",
    "default": false
  });
  parser.add_argument("--dryrun", {
    "action": "store_true",
    "help": "Show the API request and exit.",
    "default": false
  });
  parser.add_argument("--allowconceptids", {
    "action": "store_true",
    "help": "If you specify a conceptid, this is replaced by the record_id. Otherwise an error is produced.",
    "default": false
  });
  parser.add_argument("--version", {
    "action": "store_true",
    "help": "Show version",
  });

  const subparsers = parser.add_subparsers({ "help": "sub-command help" });
  zenodolib.list({ getInterface: true }, subparsers)
  zenodolib.record({ getInterface: true }, subparsers)
  zenodolib.create({ getInterface: true }, subparsers)
  zenodolib.update({ getInterface: true }, subparsers)
  zenodolib.duplicate({ getInterface: true }, subparsers)
  zenodolib.upload({ getInterface: true }, subparsers)
  zenodolib.copy({ getInterface: true }, subparsers)
  zenodolib.newVersion({ getInterface: true }, subparsers)
  zenodolib.download({ getInterface: true }, subparsers)
  zenodolib.concept({ getInterface: true }, subparsers)



  const parsed = parser.parse_args();
  if ((process.argv.length === 1)) {
    //this function not exist
    parser.print_help();
    process.exit(1);
  }
  return parsed // r.parse_args();
}

// --- main ---
async function run() {
  var args = getArguments()
  if (args.verbose) {
    console.log("zenodo-cli starting...")
  }
  if (args.version) {
    getVersion()
    return 0
  }
  // zenodo-cli create --title "..." --authors "..." --dryrun
  if (args.dryrun) {
    console.log(`API command:\n zenodolib.${args.func.name}(${JSON.stringify(args, null, 2)})`);
  } else {
    // ZenodoAPI.${args.func.name}(args)
    const result = await args.func(args);
    //const result = await ZenodoAPI(args);
    if (args.verbose) {
      console.log(`zenodo-cli result=${JSON.stringify(result, null, 2)}`);
    };
  }
  return 0
}

run();

module.exports = {
  node: 'current'
};
