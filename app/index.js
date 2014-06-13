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
    }];

    this.prompt(prompts, function (props) {
      
      this.name = props.name;
      this.desc = props.desc;
      this.user = props.user;
      this.impactKey = props.impactKey;

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

  plusplus: function() {

    this.log('download impact++');

    var gitCmd = 'git clone -b dev https://github.com/collinhover/impactplusplus.git ' + ppTempDir,
        src = self.destinationRoot() + '/' + ppTempDir + '/lib',
        dest = self.destinationRoot() + '/lib',
        done = this.async();

    if (fs.existsSync(ppTempDir)) fs.rm.sync(ppTempDir);

    exec(gitCmd, function(err, stdout, stderr) {
      directoryAsync(src, dest, function() {
        fs.rm(ppTempDir, done);
      });
    });
    
  },

  app: function () {
    
    this.directory('lib', 'lib');
    this.mkdir('lib/game/levels');
    this.mkdir('lib/impact');
    this.mkdir('lib/weltmeister');
    this.mkdir('media');

    this.template('_package.json', 'package.json');
    this.template('_bower.json', 'bower.json');
    this.template('_readme.md', 'readme.md');
    this.template('_index.html','index.html');
    
    this.copy('Gruntfile.js', 'Gruntfile.js');
    this.copy('style.css', 'style.css');

  },

  projectfiles: function () {
    this.copy('editorconfig', '.editorconfig');
    this.copy('jshintrc', '.jshintrc');
  }

});

module.exports = ImpactplusplusGenerator;
