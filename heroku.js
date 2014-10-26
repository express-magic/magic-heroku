'use strict';

var fs       = require('fs')
  , log      = require('magic-log')
  , path     = require('path')
  , inquirer = require('inquirer')
  , async    = require('async')
  , XC       = require('magic-xc')
  , config   = require( path.join(process.cwd(), 'config') )
  , heroku   = {}
  , remote   = {}
  , xc       = new XC();
;

heroku.add = function (args, cb) {
  
  async.waterfall([
      remote.check
    , remote.prompt
    , remote.add
    , remote.push
  ]
  , cb
  );
}

remote.check = function(cb) {
  var cmd = 'git remote -v';

  if ( ! config.heroku || ! config.heroku.remote) {
    log('heroku.remote in config.js not defined', 'error');
  }
  
  var args = {
    remote: config.heroku.remote
  };

  cb(null, args);
}

remote.prompt = function (args, cb) {
  if ( args.remote) { return cb(null, args); }

  inquirer.prompt({
      name: 'remote'
    , message: 'Input heroku app name:'
  }, function (input) {
    args.remote = cleanInput(input.remote);
    cb(null, args);
  });
}

function cleanInput(input) {
  return input.replace('.git', '').replace('git@heroku.com:', '');
}

remote.add = function (args, cb) {
  var cmd = 'git remote add heroku git@heroku.com:' + args.remote + '.git';
  xc(cmd, cb);
}

remote.push = function (args, cb) {
  var cmd = 'git push heroku master';
  xc(cmd, cb);
}

heroku.remote = remote;

module.exports = heroku;
