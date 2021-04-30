import zenodolib = require('./../zenodo-lib');

// subcommand create parser
export = function create(subparsers) {
  // TODO: Make sure these options stay in line with 'update'.
  const createSubparser = subparsers.add_parser('create', {
    help:
      'The create command creates new records based on the json files provided, optionally providing a title / date / description / files.',
  });
  createSubparser.set_defaults({ func: zenodolib.create });
  createSubparser.add_argument('--json', {
    action: 'store',
    help:
      'Path of the JSON file with the metadata for the zenodo record to be created. If this file is not provided, a template is used. The following options override settings from the JSON file / template.',
  });
  createSubparser.add_argument('--title', {
    action: 'store',
    help: 'The title of the record. Overrides data provided via --json.',
  });
  createSubparser.add_argument('--date', {
    action: 'store',
    help: 'The date of the record. Overrides data provided via --json.',
  });
  createSubparser.add_argument('--description', {
    action: 'store',
    help:
      'The description (abstract) of the record. Overrides data provided via --json.',
  });
  createSubparser.add_argument('--communities', {
    action: 'store',
    help:
      'Read list of communities for the record from a file. Overrides data provided via --json.',
  });
  createSubparser.add_argument('--add-communities', {
    nargs: '*',
    action: 'store',
    help:
      'List of communities to be added to the record (provided on the command line, one by one). Overrides data provided via --json.',
  });
  createSubparser.add_argument('--remove-communities', {
    nargs: '*',
    action: 'store',
    help:
      'List of communities to be removed from the record (provided on the command line, one by one). Overrides data provided via --json.',
  });
  createSubparser.add_argument('--authors', {
    nargs: '*',
    action: 'store',
    help:
      "List of authors, (provided on the command line, one by one). Separate institution and ORCID with semicolon, e.g. 'Lama Yunis;University of XYZ;0000-1234-...'. (You can also use --authordata.) Overrides data provided via --json.",
  });
  createSubparser.add_argument('--authordata', {
    action: 'store',
    help:
      'A text file with a database of authors. Each line has author, institution, ORCID (tab-separated). The data is used to supplement insitution/ORCID to author names specified with --authors. Note that authors are only added to the record when specified with --authors, not because they appear in the specified authordate file. ',
  });
  createSubparser.add_argument('--zotero-link', {
    action: 'store',
    help:
      'Zotero link of the zotero record to be linked. Overrides data provided via --json.',
  });
  createSubparser.add_argument('--publish', {
    action: 'store_true',
    help: 'Publish the deposition after executing the command.',
    default: false,
  });
  createSubparser.add_argument('--open', {
    action: 'store_true',
    help: 'Open the deposition in the browser after executing the command.',
    default: false,
  });
  createSubparser.add_argument('--show', {
    action: 'store_true',
    help: 'Show the info of the deposition after executing the command.',
    default: false,
  });
  createSubparser.add_argument('--dump', {
    action: 'store_true',
    help: 'Show json for deposition after executing the command.',
    default: false,
  });
};
