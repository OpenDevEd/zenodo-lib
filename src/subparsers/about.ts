import zenodolib = require('./../zenodo-lib');

export = function about(subparsers) {
  const aboutSubparser = subparsers.add_parser('about', {
    help: 'This command returns details about the api key.',
  });
  aboutSubparser.set_defaults({ func: zenodolib.about });
};
