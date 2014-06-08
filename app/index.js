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
    prefix = '\t  ',
    impactTempDir = '_impactjs',
    ppTempDir = '_plusplus';

fs.rm = require('rimraf');

var ImpactplusplusGenerator = yeoman.generators.Base.extend({

  init: function () {
    this.pkg = require('../package.json');

    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.installDependencies();
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
      message: 'What is your ImpactJS license key?'
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

    this.log('download impactjs...');

    var done = this.async(),
        host = 'http://impactjs.com',
        self = this;

    req.post(host + '/download', {form: {key: this.impactKey}}, function(err1, resp1, body1) {
      req.get(host + resp1.headers.location, function(err2, resp2, body2) {

        if (fs.existsSync(impactTempDir)) fs.rm.sync(impactTempDir);

        var $ = cheerio.load(body2),
            gitCmd = $('[value^="git clone"]').val();

        self.log('found link cloning repo...')

        // self.log(self.sourceRoot());
        // self.log(self.destinationRoot());

        gitCmd += ' ' + self.destinationRoot() + '/' + impactTempDir;
        self.log(gitCmd);
        exec(gitCmd, function(err, stdout, stderr) {

          self.log('cloned repo. copying files...')

          //self.log(self.sourceRoot());
          //self.log(self.destinationRoot());
          
          self.directory(self.destinationRoot() + '/' + impactTempDir + '/lib', self.destinationRoot() + '/lib');
          self.directory(self.destinationRoot() + '/' + impactTempDir + '/media', self.destinationRoot() + '/media');
          self.directory(self.destinationRoot() + '/' + impactTempDir + '/tools', self.destinationRoot() + '/tools');
          self.copy(self.destinationRoot() + '/' + impactTempDir + '/weltmeister.html', self.destinationRoot() + '/weltmeister.html');

          done();

        });
      });
    });

  },

  plusplus: function() {

    this.log('download impact++');

    var gitCmd = 'git clone -b dev https://github.com/collinhover/impactplusplus.git ' + ppTempDir,
        done = this.async();

    if (fs.existsSync(ppTempDir)) fs.rm.sync(ppTempDir);

    var self = this;
    exec(gitCmd, function(err, stdout, stderr) {
      self.directory(self.destinationRoot() + '/' + ppTempDir + '/lib', self.destinationRoot() + '/lib');
      done();
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
    
    this.copy('style.css', 'style.css');

    fs.rm.sync(impactTempDir);
    fs.rm.sync(ppTempDir);

  },

  projectfiles: function () {
    this.copy('editorconfig', '.editorconfig');
    this.copy('jshintrc', '.jshintrc');
  }
});

module.exports = ImpactplusplusGenerator;
