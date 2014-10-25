'use strict';

var fs       = require('fs')
  , log      = require('magic-log')
  , inquirer    = require('inquirer')
  , async    = require('async')
  , xc       = require('magic-xc')
  , config   = require( path.join(process.cwd(), 'config') )
  , heroku   = {}
;

heroku.add = function (args, cb) {
  
  async.waterfall([
      check
    , promptForRemote
    , add
    , push
  ]
  , cleanUp
  );
}

function check(cb) {
  var cmd = 'git remote -v'
    , heroku = config.heroku
  ;
  if ( ! heroku || ! heroku.remote) {
    log('heroku .remote not defined', 'error');
  }
  
  var args = {
    remote: heroku.remote;
  };

  cb(null, args);
}

function promptForRemote(args, cb) {
  if ( args.remote) { return cb(null, args); }

  inquirer.prompt({
      name: 'remote'
    , message: 'Input heroku app name:'
  }, function (input) {
    args.remote = input.remote;

    cb(null, args);
  });
}

function add(args, cb) {
  var cmd = 'git remote add heroku ' + args.remote;
  xc(cmd, args, cb);
}

function push (args, cb) {
  var cmd = 'git push heroku master';
  
  xc(cmd, args, cb);
}
function cleanUp(err, results) {
  console.log('cleanUp called');
  if(err) { log(err, 'error'); }
  if(results) { log(results); }
}

module.exports = heroku;
