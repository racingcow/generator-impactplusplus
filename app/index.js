'use strict';
var util = require('util'),
    path = require('path'),
    yeoman = require('yeoman-generator'),
    yosay = require('yosay'),
    chalk = require('chalk'),
    fs = require('fs'),
    path = require('path'),
    req = require('request'),
    cheerio = require('cheerio'),
    exec = require('child_process').exec,
    async = require('async'),
    impactTempDir = '_impactjs',
    ppTempDir = '_plusplus',
    licKeyPat = /(?:[A-z0-9]{4}-){3}[A-z0-9]{4}/,
    impactKey,
    impactSrc,
    self;

fs.rm = require('rimraf');
fs.ncp = require('ncp').ncp;

var ImpactplusplusGenerator = yeoman.generators.Base.extend({

  _impactJSFromWeb: function(err, callback) {

    var host = 'http://impactjs.com';

    self.log('\tdownloading from ' + host);

    req.post(host + '/download', { form: { key: this.impactKey } }, function(err1, resp1, body1) {
      req.get(host + resp1.headers.location, function(err2, resp2, body2) {

        if (fs.existsSync(self.impactSrc)) fs.rm.sync(self.impactSrc);

        var $ = cheerio.load(body2),
            gitCmd = $('[value^="git clone"]').val(),
            destPath = self.impactSrc;

        gitCmd += ' ' + destPath;

        exec(gitCmd, function(err, stdout, stderr) {

          self._impactJSFromPath(err, callback, true);

        });
      });
    });

  },

  _impactJSFromPath: function(err, callback, rm) {

    var src = self.impactSrc,
        dest = self.destinationRoot();

    fs.ncp(src, dest, function(err) {

      if (err) {
        callback(err);
        return;
      }
      else if (rm) {
        fs.rm(src, callback);
      }
      else {
        callback();
      }

    });
  },

  init: function () {

    self = this;

    this.pkg = require('../package.json');

    this.on('end', function () {
      
      if (!this.options['skip-install']) {
        this.installDependencies({
          callback: function() {
            self.log(yosay('Run "grunt" to start the game in a livereload web server.'));
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
      default: path.basename(this.destinationRoot())
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
      name: 'impactInfo',
      message: 'Impactjs location? (or license key to download)',
      default: '../impact'
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
      this.sample = props.sample;

      if (licKeyPat.test(props.impactInfo)) {
        this.impactKey = props.impactInfo;
        this.impactSrc = impactTempDir;
      } 
      else {
        this.impactKey = null;
        this.impactSrc = props.impactInfo;
      }

      done();
    }.bind(this));
  },

  impactjs: function() {

    this.log('impactjs...');

    var done = this.async(),
        method = this.impactKey 
          ? this._impactJSFromWeb 
          : this._impactJSFromPath;

    method.call(this, null, done);

  },

  blank: function() {

    this.log('"base" files...');

    var src  = this.sourceRoot(),
        dest = this.destinationRoot(),
        done = this.async(),
        cpy = function(item, cb) {
          fs.ncp(src + '/' + item, dest + '/' + item, cb);
        };

    async.parallel([
      function(cb) { cpy('lib', cb); },
      function(cb) { cpy('style.css', cb); },
      function(cb) { cpy('index.html', cb); },
    ],
    done);

  },

  plusplus: function() {

    var gitRepo = 'https://github.com/collinhover/impactplusplus.git',
        gitCmd = 'git clone -b dev ' + gitRepo + ' ' + ppTempDir,
        src = self.destinationRoot() + '/' + ppTempDir + '/lib',
        dest = self.destinationRoot() + '/lib',
        exSrc = self.destinationRoot() + '/' + ppTempDir + '/examples',
        exDest = self.destinationRoot(),
        done = this.async();

    this.log('impactplusplus...');
    this.log('\tdownloading from ' + gitRepo);

    async.series([
      function(cb) { exec(gitCmd, cb) },
      function(cb) { fs.ncp(src, dest, cb) },
      function(cb) {
        if (self.sample != 'blank') {
          self.log('\tcopying sample "' + self.sample + '"');
          fs.ncp(exSrc + '/' + self.sample, exDest, cb);
        }
        else cb();
      }
    ],
    function(err) {
      if (err) return done(err);
      fs.rm(ppTempDir, done);
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

});

module.exports = ImpactplusplusGenerator;
