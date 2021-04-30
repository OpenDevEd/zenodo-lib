import zenodolib = require('./../zenodo-lib');

export = function upload(subparsers) {
  // subcommand upload subparser
  // zenodolib.upload({ getInterface: true }, subparsers);
  const uploadSubparser = subparsers.add_parser('upload', {
    help: 'Just upload files (shorthand for update id --files ...)',
  });
  uploadSubparser.add_argument('id', { nargs: '?' });
  uploadSubparser.add_argument('--bucketurl', { action: 'store' });
  uploadSubparser.add_argument('files', { nargs: '*' });
  uploadSubparser.add_argument('--publish', {
    action: 'store_true',
    help: 'Publish the deposition after executing the command.',
    default: false,
  });
  uploadSubparser.add_argument('--open', {
    action: 'store_true',
    help: 'Open the deposition in the browser after executing the command.',
    default: false,
  });
  uploadSubparser.add_argument('--show', {
    action: 'store_true',
    help: 'Show the info of the deposition after executing the command.',
    default: false,
  });
  uploadSubparser.add_argument('--dump', {
    action: 'store_true',
    help: 'Show json for deposition after executing the command.',
    default: false,
  });
  uploadSubparser.set_defaults({ func: zenodolib.upload });
};
