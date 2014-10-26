'use strict';

var fs       = require('fs')
  , log      = require('magic-log')
  , path     = require('path')
  , inquirer = require('inquirer')
  , async    = require('async')
  , XC       = require('magic-xc')
  , xc       = new XC()
  , config   = require( path.join(process.cwd(), 'config') )
  , h        = {
      remote: {}
  }
;

h.deploy = function (args, cb) {
  if ( ! cb && typeof args === 'function') {
    cb = args;
    args = {};
  }
  h.args = args;

  async.waterfall([
      h.remote.check
    , h.remote.prompt
    , h.remote.add
    , h.remote.push
  ]
  , cb
  );
}

h.remote.check = function(cb) {
  var cmd = 'git remote -v'
    , args = h.args
  ;
  if ( ! config.heroku || ! config.heroku.remote) {
    return cb(null, args);
  }

  args.remote = config.heroku.remote;

  cb(null, args);
}

h.remote.prompt = function (args, cb) {
//  if ( args.remote) { return cb(null, args); }
  inquirer.prompt({
      name: 'remote'
    , message: 'Input heroku app name:'
    , default: args.remote
  }, function (input) {
    args.remote = cleanInput(input.remote);
    cb(null, args);
  });
}

function cleanInput(input) {
  return input.replace('.git', '').replace('git@heroku.com:', '');
}

h.remote.add = function (args, cb) {
  var cmd = 'git remote add heroku git@heroku.com:' + args.remote + '.git';

  xc(cmd, function (err, args) {
    if ( err.code === 128) {
      log('remote exists, continuing');
      return cb(null, args);
    }
    cb(err, args);
  });
}


h.remote.push = function (args, cb) {
  var cmd = 'git push heroku master';
  log('heroku.remote.push cmd: ' + cmd);
  xc(cmd, function (err, args) {
    if ( err.indexOf('Fetching repository, done.') >= 0 ) {
      log('deploy target up to date.', 'success');
      cb(null, args);
    }
    
    cb(err, args);
  });
}


module.exports = h;
