'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');


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
    }];

    this.prompt(prompts, function (props) {
      
      this.name = props.name;
      this.desc = props.desc;
      this.user = props.user;

      done();
    }.bind(this));
  },

  app: function () {
    
    this.directory('lib', 'lib');
    this.mkdir('lib/game/levels');
    this.mkdir('lib/impact');
    this.mkdir('lib/plusplus');
    this.mkdir('lib/weltmeister');
    this.mkdir('media');

    this.template('_package.json', 'package.json');
    this.template('_bower.json', 'bower.json');
    this.template('_readme.md', 'readme.md');
    this.template('_index.html','index.html');
    
    this.copy('style.css', 'style.css');

  },

  projectfiles: function () {
    this.copy('editorconfig', '.editorconfig');
    this.copy('jshintrc', '.jshintrc');
  }
});

module.exports = ImpactplusplusGenerator;
