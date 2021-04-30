import zenodolib = require('./../zenodo-lib');

export = function record(subparsers) {
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
};
