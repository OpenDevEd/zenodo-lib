import zenodolib = require('./../zenodo-lib');

export = function duplicate(subparsers) {
  // subcommand duplicate parser
  // zenodolib.duplicate({ getInterface: true }, subparsers);
  const duplicateSubparser = subparsers.add_parser('duplicate', {
    help:
      'The duplicate command duplicates the id to a new id, optionally providing a title / date / description / files.',
  });
  duplicateSubparser.add_argument('id', { nargs: 1 });
  duplicateSubparser.add_argument('--title', { action: 'store' });
  duplicateSubparser.add_argument('--date', { action: 'store' });
  duplicateSubparser.add_argument('--description', { action: 'store' });
  duplicateSubparser.add_argument('--files', { nargs: '*' });
  duplicateSubparser.add_argument('--publish', {
    action: 'store_true',
    help: 'Publish the deposition after executing the command.',
    default: false,
  });
  duplicateSubparser.add_argument('--open', {
    action: 'store_true',
    help: 'Open the deposition in the browser after executing the command.',
    default: false,
  });
  duplicateSubparser.add_argument('--show', {
    action: 'store_true',
    help: 'Show the info of the deposition after executing the command.',
    default: false,
  });
  duplicateSubparser.add_argument('--dump', {
    action: 'store_true',
    help: 'Show json for deposition after executing the command.',
    default: false,
  });
  duplicateSubparser.set_defaults({ func: zenodolib.duplicate });
};
