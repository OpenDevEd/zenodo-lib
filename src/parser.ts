import * as argparse from 'argparse';
import zenodolib = require('./zenodo-lib');

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

const group = parser.add_mutually_exclusive_group();
group.add_argument('-v', '--verbosityLevel', { action: 'count' });
group.add_argument('-s', '--silent', { action: 'store_true' });

const subparsers = parser.add_subparsers({ help: 'sub-command help' });

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
  help: 'Show key information for the deposition after executing the command.',
  default: false,
});
recordSubparser.add_argument('--dump', {
  action: 'store_true',
  help: 'Show json for deposition after executing the command.',
  default: false,
});

export = parser;
