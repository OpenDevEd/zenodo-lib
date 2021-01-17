#!/usr/bin/env node

import * as argparse from 'argparse';

// PRODUCTION: Load library
const zenodolib = require("./zenodo-lib");
// TESTING: Load locally for testing
//   const zenodolib = require("../zenodo-lib/functions");

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

function getArguments() {
  const parser = new argparse.ArgumentParser({ "description": "Zenodo command line utility" });
  parser.add_argument("--config", {
    "action": "store",
    "default": "config.json",
    "help": "Config file with API key. By default config.json then ~/.config/zenodo-cli/config.json are used if no config is provided."
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

  const subparsers = parser.add_subparsers({ "help": "sub-command help" });
  const parser_list = subparsers.add_parser("list", { "help": "List deposits for this account. Note that the Zenodo API does not seem to send continuation tokens. The first 1000 results are retrieved. Please use --page to retrieve more. The result is the record id, followed by the helper id." });
  parser_list.add_argument("--page", { "action": "store", "help": "Page number of the list." });
  parser_list.add_argument("--size", { "action": "store", "help": "Number of records in one page." });
  parser_list.add_argument("--publish", {
    "action": "store_true",
    "help": "Publish the depositions after executing the command.",
    "default": false
  });
  parser_list.add_argument("--open", {
    "action": "store_true",
    "help": "Open the depositions in the browser after executing the command.",
    "default": false
  });
  parser_list.add_argument("--show", {
    "action": "store_true",
    "help": "Show key information for the depositions after executing the command.",
    "default": false
  });
  parser_list.add_argument("--dump", {
    "action": "store_true",
    "help": "Show json for list and for depositions after executing the command.",
    "default": false
  });
  parser_list.set_defaults({ "func": zenodolib.listDepositions });
  //parser_list.set_defaults({ "action": "listDepositions" });

  const parser_get = subparsers.add_parser("get", { "help": "The get command gets the ids listed, and writes these out to id1.json, id2.json etc. The id can be provided as a number, as a deposit URL or record URL" });
  parser_get.add_argument("id", { "nargs": "*" });
  parser_get.add_argument("--publish", {
    "action": "store_true",
    "help": "Publish the deposition after executing the command.",
    "default": false
  });
  parser_get.add_argument("--open", {
    "action": "store_true",
    "help": "Open the deposition in the browser after executing the command.",
    "default": false
  });
  parser_get.add_argument("--show", {
    "action": "store_true",
    "help": "Show key information for the deposition after executing the command.",
    "default": false
  });
  parser_get.add_argument("--dump", {
    "action": "store_true",
    "help": "Show json for deposition after executing the command.",
    "default": false
  });
  parser_get.set_defaults({ "func": zenodolib.getRecord });

  // Make sure these options stay in line with 'update'.
  const parser_create = subparsers.add_parser("create", { "help": "The create command creates new records based on the json files provided, optionally providing a title / date / description / files." });
  parser_create.add_argument("--json", {
    "action": "store",
    "help": "Path of the JSON file with the metadata for the zenodo record to be created. If this file is not provided, a template is used. The following options override settings from the JSON file / template."
  });
  parser_create.add_argument("--title", {
    "action": "store",
    "help": "The title of the record. Overrides data provided via --json."
  });
  parser_create.add_argument("--date", {
    "action": "store",
    "help": "The date of the record. Overrides data provided via --json."
  });
  parser_create.add_argument("--description", {
    "action": "store",
    "help": "The description (abstract) of the record. Overrides data provided via --json."
  });
  parser_create.add_argument("--communities", {
    "action": "store",
    "help": "Read list of communities for the record from a file. Overrides data provided via --json."
  });
  parser_create.add_argument("--add-communities", {
    "nargs": "*",
    "action": "store",
    "help": "List of communities to be added to the record (provided on the command line, one by one). Overrides data provided via --json."
  });
  parser_create.add_argument("--remove-communities", {
    "nargs": "*",
    "action": "store",
    "help": "List of communities to be removed from the record (provided on the command line, one by one). Overrides data provided via --json."
  });
  parser_create.add_argument("--authors", {
    "nargs": "*",
    "action": "store",
    "help": "List of authors, (provided on the command line, one by one). Separate institution and ORCID with semicolon, e.g. 'Lama Yunis;University of XYZ;0000-1234-...'. (You can also use --authordata.) Overrides data provided via --json."
  });
  parser_create.add_argument("--authordata", {
    "action": "store",
    "help": "A text file with a database of authors. Each line has author, institution, ORCID (tab-separated). The data is used to supplement insitution/ORCID to author names specified with --authors. Note that authors are only added to the record when specified with --authors, not because they appear in the specified authordate file. "
  });
  parser_create.add_argument("--zotero-link", {
    "action": "store",
    "help": "Zotero link of the zotero record to be linked. Overrides data provided via --json."
  });
  parser_create.add_argument("--publish", {
    "action": "store_true",
    "help": "Publish the deposition after executing the command.",
    "default": false
  });
  parser_create.add_argument("--open", {
    "action": "store_true",
    "help": "Open the deposition in the browser after executing the command.",
    "default": false
  });
  parser_create.add_argument("--show", {
    "action": "store_true",
    "help": "Show the info of the deposition after executing the command.",
    "default": false
  });
  parser_create.add_argument("--dump", {
    "action": "store_true",
    "help": "Show json for deposition after executing the command.",
    "default": false
  });
  parser_create.set_defaults({ "func": zenodolib.create });

  const parser_duplicate = subparsers.add_parser("duplicate", { "help": "The duplicate command duplicates the id to a new id, optionally providing a title / date / description / files." });
  parser_duplicate.add_argument("id", { "nargs": 1 });
  parser_duplicate.add_argument("--title", { "action": "store" });
  parser_duplicate.add_argument("--date", { "action": "store" });
  parser_duplicate.add_argument("--description", { "action": "store" });
  parser_duplicate.add_argument("--files", { "nargs": "*" });
  parser_duplicate.add_argument("--publish", {
    "action": "store_true",
    "help": "Publish the deposition after executing the command.",
    "default": false
  });
  parser_duplicate.add_argument("--open", {
    "action": "store_true",
    "help": "Open the deposition in the browser after executing the command.",
    "default": false
  });
  parser_duplicate.add_argument("--show", {
    "action": "store_true",
    "help": "Show the info of the deposition after executing the command.",
    "default": false
  });
  parser_duplicate.add_argument("--dump", {
    "action": "store_true",
    "help": "Show json for deposition after executing the command.",
    "default": false
  });
  parser_duplicate.set_defaults({ "func": zenodolib.duplicate });

  // Make sure that the options for update and create are the same. If you add options to update, also check the update function.
  const parser_update = subparsers.add_parser("update", { "help": "The update command updates the id provided, with the title / date / description / files provided." });
  parser_update.add_argument("id", { "nargs": 1 });
  parser_update.add_argument("--title", { "action": "store" });
  parser_update.add_argument("--date", { "action": "store" });
  parser_update.add_argument("--description", { "action": "store" });
  parser_update.add_argument("--files", { "nargs": "*" });
/*  parser_create.add_argument("--communities", {
    "action": "store",
    "help": "Read list of communities for the record from a file. Overrides data provided via --json."
  });
*/
  parser_update.add_argument("--add-communities", { "nargs": "*" });
  parser_update.add_argument("--remove-communities", { "nargs": "*" });
  parser_update.add_argument("--zotero-link", {
    "action": "store",
    "help": "Zotero link of the zotero record to be linked."
  });
  parser_update.add_argument("--json", {
    "action": "store",
    "help": "Path of the JSON file with the metadata of the zenodo record to be updated."
  });
  parser_update.add_argument("--publish", {
    "action": "store_true",
    "help": "Publish the deposition after executing the command.",
    "default": false
  });
  parser_update.add_argument("--open", {
    "action": "store_true",
    "help": "Open the deposition in the browser after executing the command.",
    "default": false
  });
  parser_update.add_argument("--show", {
    "action": "store_true",
    "help": "Show the info of the deposition after executing the command.",
    "default": false
  });
  parser_update.add_argument("--dump", {
    "action": "store_true",
    "help": "Show json for deposition after executing the command.",
    "default": false
  });
  parser_update.set_defaults({ "func": zenodolib.update });

  const parser_upload = subparsers.add_parser("upload", { "help": "Just upload files (shorthand for update id --files ...)" });
  parser_upload.add_argument("id", { "nargs": "?" });
  parser_upload.add_argument("--bucketurl", { "action": "store" });
  parser_upload.add_argument("files", { "nargs": "*" });
  parser_upload.add_argument("--publish", {
    "action": "store_true",
    "help": "Publish the deposition after executing the command.",
    "default": false
  });
  parser_upload.add_argument("--open", {
    "action": "store_true",
    "help": "Open the deposition in the browser after executing the command.",
    "default": false
  });
  parser_upload.add_argument("--show", {
    "action": "store_true",
    "help": "Show the info of the deposition after executing the command.",
    "default": false
  });
  parser_upload.add_argument("--dump", {
    "action": "store_true",
    "help": "Show json for deposition after executing the command.",
    "default": false
  });
  parser_upload.set_defaults({ "func": zenodolib.upload });

  const parser_copy = subparsers.add_parser("multiduplicate", { "help": "Duplicates existing deposit with id multiple times, once for each file." });
  parser_copy.add_argument("id", { "nargs": 1 });
  parser_copy.add_argument("files", { "nargs": "*" });
  parser_copy.add_argument("--publish", {
    "action": "store_true",
    "help": "Publish the deposition after executing the command.",
    "default": false
  });
  parser_copy.add_argument("--open", {
    "action": "store_true",
    "help": "Open the deposition in the browser after executing the command.",
    "default": false
  });
  parser_copy.add_argument("--show", {
    "action": "store_true",
    "help": "Show the info of the deposition after executing the command.",
    "default": false
  });
  parser_copy.add_argument("--dump", {
    "action": "store_true",
    "help": "Show json for deposition after executing the command.",
    "default": false
  });
  parser_copy.set_defaults({ "func": zenodolib.copy });

  const parser_newversion = subparsers.add_parser("newversion", { "help": "The newversion command creates a new version of the deposition with id, optionally providing a title / date / description / files." });
  parser_newversion.add_argument("id", { "nargs": 1 });
  parser_newversion.add_argument("--title", { "action": "store" });
  parser_newversion.add_argument("--date", { "action": "store" });
  parser_newversion.add_argument("--description", { "action": "store" });
  parser_newversion.add_argument("--files", { "nargs": "*" });
  parser_newversion.add_argument("--publish", {
    "action": "store_true",
    "help": "Publish the deposition after executing the command.",
    "default": false
  });
  parser_newversion.add_argument("--open", {
    "action": "store_true",
    "help": "Open the deposition in the browser after executing the command.",
    "default": false
  });
  parser_newversion.add_argument("--show", {
    "action": "store_true",
    "help": "Show the info of the deposition after executing the command.",
    "default": false
  });
  parser_newversion.add_argument("--dump", {
    "action": "store_true",
    "help": "Show json for deposition after executing the command.",
    "default": false
  });
  parser_newversion.set_defaults({ "func": zenodolib.newVersion });

  const parser_download = subparsers.add_parser("download", { "help": "Download all the files in the deposition." });
  parser_download.add_argument("id", { "nargs": 1 });
  parser_download.set_defaults({ "func": zenodolib.download });

  const parser_concept = subparsers.add_parser("concept", { "help": "Get the record id from the concept id." });
  parser_concept.add_argument("id", { "nargs": 1 });
  parser_concept.add_argument("--dump", {
    "action": "store_true",
    "help": "Show json for list and for depositions after executing the command.",
    "default": false
  });
  parser_concept.add_argument("--open", {
    "action": "store_true",
    "help": "Open the deposition in the browser after executing the command.",
    "default": false
  });
  parser_concept.add_argument("--show", {
    "action": "store_true",
    "help": "Show the info of the deposition after executing the command.",
    "default": false
  });
  //parsing agrument.
  parser_concept.set_defaults({ "func": zenodolib.concept });
  parser.parse_args();
  if ((process.argv.length === 1)) {
    //this function not exist
    parser.print_help();
    process.exit(1);
  }
  return parser.parse_args();
}

// --- main ---
async function run() {
  var args = getArguments()
  if (args.verbose) {
    console.log("zenodo-cli starting...")
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
}

run();

module.exports = {
  node: 'current'
};
