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

    var src = impactSrc,
        dest = path.join(this.destinationRoot(), '/lib/impact'),
        adjSrc;

    fs.exists(dest, function(exists) {

      if (exists) fs.rm.sync(dest);

      mkdirp(dest, function(err) {
        if (err) return callback(err);

        fs.exists(src + '/lib/impact', function(exists) { //accept the path of a full game or just the /lib/impact folder

            adjSrc = exists ? src + '/lib/impact' : src;

            fs.ncp(adjSrc, dest, function(err) {
              if (err) return callback(err);
              
              if (rm) {
                fs.rm(src, callback);
              }
              else {
                callback();
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