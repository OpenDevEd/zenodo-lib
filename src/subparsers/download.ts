import zenodolib = require('../zenodo-lib');

export = function download(subparsers) {
  // subcommand download subparser
  // zenodolib.download({ getInterface: true }, subparsers);
  const downloadSubparser = subparsers.add_parser('download', {
    help: 'Download all the files in the deposition.',
  });
  downloadSubparser.add_argument('id', { nargs: 1 });
  downloadSubparser.set_defaults({ func: zenodolib.download });
};
