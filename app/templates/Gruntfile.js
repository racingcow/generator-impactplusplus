(function () {
  
  'use strict';
  var path = require('path');

  module.exports = function (grunt) {

    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
      express: {
        all: {
          options: {
            port: 9000,
            hostname: '*',
            bases: [path.resolve('.')]
          }  
        }
      },
      open: {
        all: {
          path: "http://localhost:<%= express.all.options.port %>/index.html"
        }
      }

    });

    grunt.registerTask('live-serve', [
      'express',
      'open',
      'express-keepalive'
    ]);
    grunt.registerTask('default', ['live-serve']);

  };

}());