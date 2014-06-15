(function () {
  
  'use strict';
  var path = require('path');

  module.exports = function (grunt) {

    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
      
      watch: {
        livereload: {
            options: {
              livereload: true
            },
            files: [
              'media/{,*/}*',
              'lib/{,*/}*.js',
              '{,*/}*.html',
              '{,*/}*.css'
            ]
        }
      },

      connect: {
        options: {
          port: 9000,
          open: true,
          livereload: 35729,
          // Change this to '0.0.0.0' to access the server from outside
          hostname: 'localhost'
        },
        livereload: true

      }

    });

    grunt.registerTask('live-serve', [
      'connect:livereload',
      'watch',
    ]);
    grunt.registerTask('default', ['live-serve']);

  };

}());