'use strict';

var util = require('util'),
    yeoman = require('yeoman-generator'),
    fs = require('fs'),
    path = require('path'),
    ncp = require('ncp'),
    mkdirp = require('mkdirp'),
    req = require('request'),
    cheerio = require('cheerio'),
    exec = require('child_process').exec,

    licKeyPat = /(?:[A-z0-9]{4}-){3}[A-z0-9]{4}/,
    defaultImpactInfo = '../impact';

fs.ncp = require('ncp').ncp;
fs.rm = require('rimraf');

var UpdateImpactjsGenerator = yeoman.generators.NamedBase.extend({

  _impactJSFromWeb: function(impactKey, impactSrc, callback) {

    var host = 'http://impactjs.com',
        self = this;

    self.log('\tdownloading from ' + host);

    req.post(host + '/download', { form: { key: impactKey } }, function(err, resp1, body1) {
      if (err) return callback(err);
      
      req.get(host + resp1.headers.location, function(err, resp2, body2) {
        if (err) return callback(err);
        
        if (fs.existsSync(impactSrc)) fs.rm.sync(impactSrc);

        var $ = cheerio.load(body2),
            gitCmd = $('[value^="git clone"]').val(),
            destPath = impactSrc;

        gitCmd += ' ' + destPath;

        exec(gitCmd, function(err, stdout, stderr) {
          if (err) return callback(err);

          self._impactJSFromPath(impactSrc, callback, true);

        });
      });
    });

  },

  _impactJSFromPath: function(impactSrc, callback, rm) {

    var self = this,
        src = impactSrc,
        dest = path.join(this.destinationRoot(), '/lib/impact'),
        adjSrc;

    self.log('src = "' + src + '"');
    self.log('destinationRoot = "' + this.destinationRoot() + '"');
    self.log('dest = "' + dest + '"');

    fs.exists(dest, function(exists) {

      if (exists) {
        self.log('dest exists. Deleting...');
        fs.rm.sync(dest);
        self.log('dest deleted');
      }

      self.log('creating dest');
      mkdirp(dest, function(err) {
        
        if (err) {
          self.log('error with mkdirp');
          self.log(err);
          return callback(err);
        }

        self.log('checking if "' + src + '/lib/impact" exists.');
        fs.exists(src + '/lib/impact', function(exists) { //accept the path of a full game or just the /lib/impact folder

            self.log('exists = ' + exists);
            adjSrc = exists ? src + '/lib/impact' : src;
            self.log('adjSrc = ' + adjSrc);

            fs.ncp(adjSrc, dest, function(err) {
              if (err) {
                self.log('error with ncp');
                self.log(err);
                return callback(err);
              }
              
              if (rm) {
                self.log('rm "' + src + '"');
                fs.rm(src, callback);
                self.log('finished rm');
              }
              else {
                callback();
                self.log('finished');
              }
            });

        });

      });
    });

  },

  init: function () {

    var done = this.async(),
        impactInfo = this.arguments[0];
    if (!impactInfo) {
      console.log('No impactjs path (or license key) provided. Using default value of "../impact".');
      impactInfo = defaultImpactInfo;
    }

    if (licKeyPat.test(impactInfo)) {
      this._impactJSFromWeb(impactInfo, defaultImpactInfo, done);
    } 
    else {
      this._impactJSFromPath(impactInfo, done);
    }

  },

});

module.exports = UpdateImpactjsGenerator;