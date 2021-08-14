import about = require('./about');
import record = require('./record');
import create = require('./create');
import update = require('./update');
import duplicate = require('./duplicate');
import upload = require('./upload');
import list = require('./list');

export = function configureSubparsers(parser) {
  const subparsers = parser.add_subparsers({ help: 'sub-command help' });

  about(subparsers);
  record(subparsers);
  create(subparsers);
  update(subparsers);
  duplicate(subparsers);
  upload(subparsers);
  list(subparsers);
  
};
