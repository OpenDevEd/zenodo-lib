import about = require('./about');
import record = require('./record');
import create = require('./create');
import update = require('./update');
import duplicate = require('./duplicate');
import upload = require('./upload');
import list = require('./list');
import concept = require('./concept');
import download = require('./download');
import newVersion = require('./newVersion');
import copy = require('./copy');

export = function configureSubparsers(parser) {
  const subparsers = parser.add_subparsers({ help: 'sub-command help' });

  about(subparsers);
  record(subparsers);
  create(subparsers);
  update(subparsers);
  duplicate(subparsers);
  upload(subparsers);
  list(subparsers);
  concept(subparsers);
  download(subparsers);
  newVersion(subparsers);
  copy(subparsers);

};
