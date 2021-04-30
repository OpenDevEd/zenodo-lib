import zenodolib = require('../zenodo-lib');

export = function concept(subparsers) {
  // subcommand concept parser
  // zenodolib.concept({ getInterface: true }, subparsers);

  const conceptSubparser = subparsers.add_parser('concept', {
    help: 'Get the record id from the concept id.',
  });
  conceptSubparser.add_argument('id', { nargs: 1 });
  conceptSubparser.add_argument('--dump', {
    action: 'store_true',
    help: 'Show json for list and for depositions after executing the command.',
    default: false,
  });
  conceptSubparser.add_argument('--open', {
    action: 'store_true',
    help: 'Open the deposition in the browser after executing the command.',
    default: false,
  });
  conceptSubparser.add_argument('--show', {
    action: 'store_true',
    help: 'Show the info of the deposition after executing the command.',
    default: false,
  });
  //parsing agrument.
  conceptSubparser.set_defaults({ func: zenodolib.concept });
};
