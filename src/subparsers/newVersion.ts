import zenodolib = require('../zenodo-lib');

export = function newVersion(subparsers) {
  // zenodolib.newVersion({ getInterface: true }, subparsers);
  const newVersionSubparser = subparsers.add_parser('newversion', {
    help:
      'The newversion command creates a new version of the deposition with id, optionally providing a title / date / description / files.',
  });
  newVersionSubparser.add_argument('id', { nargs: 1 });
  newVersionSubparser.add_argument('--title', { action: 'store' });
  newVersionSubparser.add_argument('--date', { action: 'store' });
  newVersionSubparser.add_argument('--description', { action: 'store' });
  newVersionSubparser.add_argument('--files', { nargs: '*' });
  newVersionSubparser.add_argument('--publish', {
    action: 'store_true',
    help: 'Publish the deposition after executing the command.',
    default: false,
  });
  newVersionSubparser.add_argument('--open', {
    action: 'store_true',
    help: 'Open the deposition in the browser after executing the command.',
    default: false,
  });
  newVersionSubparser.add_argument('--show', {
    action: 'store_true',
    help: 'Show the info of the deposition after executing the command.',
    default: false,
  });
  newVersionSubparser.add_argument('--dump', {
    action: 'store_true',
    help: 'Show json for deposition after executing the command.',
    default: false,
  });
  newVersionSubparser.set_defaults({ func: zenodolib.newVersion });
};
