import zenodolib = require('./../zenodo-lib');

export = function copy(subparsers) {
  // subcommand copy parser
  // zenodolib.copy({ getInterface: true }, subparsers);
  const copySubparser = subparsers.add_parser('multiduplicate', {
    help:
      'Duplicates existing deposit with id multiple times, once for each file.',
  });
  copySubparser.add_argument('id', { nargs: 1 });
  copySubparser.add_argument('files', { nargs: '*' });
  copySubparser.add_argument('--publish', {
    action: 'store_true',
    help: 'Publish the deposition after executing the command.',
    default: false,
  });
  copySubparser.add_argument('--open', {
    action: 'store_true',
    help: 'Open the deposition in the browser after executing the command.',
    default: false,
  });
  copySubparser.add_argument('--show', {
    action: 'store_true',
    help: 'Show the info of the deposition after executing the command.',
    default: false,
  });
  copySubparser.add_argument('--dump', {
    action: 'store_true',
    help: 'Show json for deposition after executing the command.',
    default: false,
  });
  copySubparser.set_defaults({ func: zenodolib.copy });
};
