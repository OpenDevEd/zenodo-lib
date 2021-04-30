import zenodolib = require('../zenodo-lib');

export = function update(subparsers) {
  // subcommand update parser
  // zenodolib.update({ getInterface: true }, subparsers);
  // TODO: Make sure that the options for update and create are the same.
  // TODO: If you add options to update, also check the update function.

  const updateSubparser = subparsers.add_parser('update', {
    help:
      'The update command updates the id provided, with the title / date / description / files provided.',
  });
  updateSubparser.add_argument('id', { nargs: 1 });
  updateSubparser.add_argument('--title', { action: 'store' });
  updateSubparser.add_argument('--date', { action: 'store' });
  updateSubparser.add_argument('--description', { action: 'store' });
  updateSubparser.add_argument('--files', { nargs: '*' });
  // TODO
  updateSubparser.add_argument('--communities', {
    action: 'store',
    help:
      'Read list of communities for the record from a file. Overrides data provided via --json.',
  });
  updateSubparser.add_argument('--add-communities', { nargs: '*' });
  updateSubparser.add_argument('--remove-communities', { nargs: '*' });
  updateSubparser.add_argument('--zotero-link', {
    action: 'store',
    help: 'Zotero link of the zotero record to be linked.',
  });
  updateSubparser.add_argument('--json', {
    action: 'store',
    help:
      'Path of the JSON file with the metadata of the zenodo record to be updated.',
  });
  updateSubparser.add_argument('--publish', {
    action: 'store_true',
    help: 'Publish the deposition after executing the command.',
    default: false,
  });
  updateSubparser.add_argument('--open', {
    action: 'store_true',
    help: 'Open the deposition in the browser after executing the command.',
    default: false,
  });
  updateSubparser.add_argument('--show', {
    action: 'store_true',
    help: 'Show the info of the deposition after executing the command.',
    default: false,
  });
  updateSubparser.add_argument('--dump', {
    action: 'store_true',
    help: 'Show json for deposition after executing the command.',
    default: false,
  });
  updateSubparser.set_defaults({ func: zenodolib.update });
};
