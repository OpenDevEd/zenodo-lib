import zenodolib = require('../zenodo-lib');

export = function list(subparsers) {
  // zenodolib.list({ getInterface: true }, subparsers);
  // listDepositions: define CLI interface
  const listSubparser = subparsers.add_parser('list', {
    help:
      'List deposits for this account. Note that the Zenodo API does not seem to send continuation tokens. The first 1000 results are retrieved. Please use --page to retrieve more. The result is the record id, followed by the concept id.',
  });
  listSubparser.set_defaults({ func: zenodolib.listDepositions });
  // zenodolib.listDepositions({getInterface: true}, parser_list)
  // parser_list.set_defaults({ "action": "listDepositions" });
  listSubparser.add_argument('--page', {
    action: 'store',
    help: 'Page number of the list.',
  });
  listSubparser.add_argument('--size', {
    action: 'store',
    help: 'Number of records in one page.',
  });
  listSubparser.add_argument('--publish', {
    action: 'store_true',
    help: 'Publish the depositions after executing the command.',
    default: false,
  });
  listSubparser.add_argument('--open', {
    action: 'store_true',
    help: 'Open the depositions in the browser after executing the command.',
    default: false,
  });
  listSubparser.add_argument('--show', {
    action: 'store_true',
    help:
      'Show key information for the depositions after executing the command.',
    default: false,
  });
  listSubparser.add_argument('--dump', {
    action: 'store_true',
    help: 'Show json for list and for depositions after executing the command.',
    default: false,
  });
};
