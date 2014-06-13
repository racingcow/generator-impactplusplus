'use strict';
var util = require('util'),
    path = require('path'),
    yeoman = require('yeoman-generator'),
    yosay = require('yosay'),
    chalk = require('chalk'),
    fs = require('fs'),
    req = require('request'),
    cheerio = require('cheerio'),
    exec = require('child_process').exec,
    async = require('async'),
    prefix = '\t  ',
    impactTempDir = '_impactjs',
    ppTempDir = '_plusplus',
    self;

fs.rm = require('rimraf');

function directoryAsync (src, dest, cb) {
  //console.log('directory ' + src);
  self.directory(src, dest);
  self.conflicter.resolve(cb);
}

function copyAsync(src, dest, cb) {
  //console.log('copy ' + src);
  self.directory(src, dest);
  self.conflicter.resolve(cb);
}

var ImpactplusplusGenerator = yeoman.generators.Base.extend({

  init: function () {

    self = this;

    this.pkg = require('../package.json');

    this.on('end', function () {
      
      if (!this.options['skip-install']) {
        this.installDependencies({
          callback: function() {
            self.log('Finished. Now you can...');
            self.log('* run "grunt" to start a web server to run the game.');
          }
        });
      }

    });
  },

  askFor: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay('Welcome to the supafly impact++ game generator!'));

    var prompts = [{
      type: 'input',
      name: 'name',
      message: 'What would you like to call your game?',
      default: 'my-awesome-game'
    },{
      type: 'input',
      name: 'desc',
      message: 'Enter a description for your game',
      default: 'You should play this game'
    },{
      type: 'input',
      name: 'user',
      message: 'What is your github user name?',
      default: 'someuser'
    },{
      type: 'input',
      name: 'impactKey',
      message: 'What is your impactjs license key?'
    },{
      type: 'list',
      name: 'sample',
      message: 'Start with which sample?',
      choices: ['blank', 'jumpnrun', 'supercollider'],
      default: 'blank'
    }];

    this.prompt(prompts, function (props) {
      
      this.name = props.name;
      this.desc = props.desc;
      this.user = props.user;
      this.impactKey = props.impactKey;
      this.sample = props.sample;

      done();
    }.bind(this));
  },

  impactjs: function() {

    this.log('downloading impactjs...');

    var done = this.async(),
        host = 'http://impactjs.com';

    req.post(host + '/download', {form: {key: this.impactKey}}, function(err1, resp1, body1) {
      req.get(host + resp1.headers.location, function(err2, resp2, body2) {

        if (fs.existsSync(impactTempDir)) fs.rm.sync(impactTempDir);

        var $ = cheerio.load(body2),
            gitCmd = $('[value^="git clone"]').val(),
            srcPath = self.destinationRoot() + '/' + impactTempDir;

        gitCmd += ' ' + srcPath;

        exec(gitCmd, function(err, stdout, stderr) {

          async.series([
            function(cb) { directoryAsync(srcPath + '/lib', self.destinationRoot() + '/lib', cb); },
            function(cb) { directoryAsync(srcPath + '/media', self.destinationRoot() + '/media', cb); },
            function(cb) { directoryAsync(srcPath + '/tools', self.destinationRoot() + '/tools', cb); },
            function(cb) { copyAsync(srcPath + '/weltmeister.html', self.destinationRoot() + '/weltmeister.html', cb); }
          ], 
          function(err) {
            console.log('async done');
            fs.rm(impactTempDir, done);
          });

        });
      });
    });

  },

  blank: function() {

    this.log('copying base files');

    self.directory('lib', 'lib');
    self.copy('style.css', 'style.css');
    self.template('_index.html','index.html');
  },

  plusplus: function() {

    this.log('download impact++');

    var gitCmd = 'git clone -b dev https://github.com/collinhover/impactplusplus.git ' + ppTempDir,
        src = self.destinationRoot() + '/' + ppTempDir + '/lib',
        dest = self.destinationRoot() + '/lib',
        exSrc = self.destinationRoot() + '/' + ppTempDir + '/examples',
        exDest = self.destinationRoot(),
        done = this.async();

    if (fs.existsSync(ppTempDir)) fs.rm.sync(ppTempDir);

    exec(gitCmd, function(err, stdout, stderr) {
      directoryAsync(src, dest, function() {
        if (self.sample != 'blank') {
          self.log('copying sample "' + self.sample + '"');
          self.log(exSrc + '/' + self.sample + ' to ' + exDest);
          directoryAsync(exSrc + '/' + self.sample, exDest, function() {
            fs.rm(ppTempDir, done);
          });
        }
        else {
          fs.rm(ppTempDir, done);
        }
      });
    });
    
  },

  app: function () {

    self.template('_package.json', 'package.json');
    self.template('_bower.json', 'bower.json');
    self.template('_readme.md', 'readme.md');
    self.copy('Gruntfile.js', 'Gruntfile.js');

    self.copy('editorconfig', '.editorconfig');
    self.copy('jshintrc', '.jshintrc');

  }

  // makeFolders: function() {
  //   self.mkdir('lib/game/levels');
  //   self.mkdir('lib/impact');
  //   self.mkdir('lib/weltmeister');
  //   self.mkdir('media');
  // },

});

module.exports = ImpactplusplusGenerator;
