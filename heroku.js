'use strict';

var fs       = require('fs')
  , log      = require('magic-log')
  , path     = require('path')
  , inquirer = require('inquirer')
  , async    = require('async')
  , prompt   = require('magic-prompt')
  , XC       = require('magic-xc')
  , xc       = new XC()
  , config   = require( path.join(process.cwd(), 'config') )
  , h        = {
    remote: {
      prepare: {}
    }
  }
;

h.deploy = function deploy(cb) {
  //this will be the place to hook in other deploy possibilities,
  //nodejitsu comes to mind.
  
  async.waterfall([
      prepare
    , h.remote.find
    , h.remote.prepare.choices
    , prompt.choice
    , h.remote.prepare.prompt
    , h.remote.add
    , h.remote.push
  ]
  , cb
  );
}

function prepare(cb) {
  cb(null,{});
}

h.remote.prepare.choices = function prepareChooseRemotes(args, cb) {
  args.choices = args.remotes;
  args.message = 'Which remote do you want to use to deploy to?';
  args.var     = 'remote'

  cb(null, args);
}

h.remote.prepare.prompt = function prepareRemotePrompt(args, cb) {

  if ( args.remote && args.remote !== 'none') { return cb(null, args); }

  args.testfor = 'none';
  args.var = 'newRemote';
  args.message = 'Name the new remote (production or staging preferred)'

  prompt.input(args, cb);
}

h.remote.add = function addRemote(args, cb) {
  if ( args.remote && args.remote !== 'none' ) { return cb(null, args); }

  if ( ! args.newRemote ) {
    return cb('addRemote needs a remote name');
  }

  log('args.remote in addRemote = ' + args.newRemote);

  var cmd = 'git remote add ' + args.newRemote;
  log('addRemote called with cmd: ' + cmd);
  args.remote = args.newRemote;
  xc(cmd, args, cb);
}

h.remote.push = function pushRemote(args, cb) {
  if ( ! args.remote ) { return cb('Remote not defined in pushRemote'); }
  var cmd = 'git push ' + args.remote + ' master';
  log('pushRemote called with cmd: ' + cmd);
  xc(cmd, args, cb);
}

h.remote.find = function findRemotes(args, cb) {
  var cmd = 'git remote -v';

  xc(cmd, args, function (err, results) {
console.log('results =', results);
    var lines = results.std.stdout.split('\n')
      , remotes = []
    ;

    for(var k in lines) {
      if ( lines.hasOwnProperty(k) ) {
        var line = lines[k];

        if( line.indexOf('(fetch)') >= 0 ) {
          var lineArray = line.split('\t')
            , remote = {
                name: lineArray[0]
              , url: lineArray[1]
            }
          ;
          if ( remote.name !== 'origin' ) {
            remotes.push(remote);
          }
        }
      }
    }
    args.remotes = remotes;

    cb(null, args);
  });
}

module.exports = h;
