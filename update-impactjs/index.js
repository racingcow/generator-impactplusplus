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

  _impactJSFromWeb: function(err, impactKey, impactSrc, callback) {

    var host = 'http://impactjs.com',
        self = this;

    self.log('\tdownloading from ' + host);

    req.post(host + '/download', { form: { key: impactKey } }, function(err1, resp1, body1) {
      req.get(host + resp1.headers.location, function(err2, resp2, body2) {

        if (fs.existsSync(impactSrc)) fs.rm.sync(impactSrc);

        var $ = cheerio.load(body2),
            gitCmd = $('[value^="git clone"]').val(),
            destPath = impactSrc;

        gitCmd += ' ' + destPath;

        exec(gitCmd, function(err, stdout, stderr) {

          self._impactJSFromPath(err, impactSrc, callback, true);

        });
      });
    });

  },

  _impactJSFromPath: function(err, impactSrc, callback, rm) {

    var src = impactSrc,
        dest = path.join(this.destinationRoot(), '/lib/impact');

    fs.exists(dest, function(exists) {

      if (exists) fs.rm.sync(dest);

      mkdirp(dest, function(err) {
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
      this._impactJSFromWeb(null, impactInfo, defaultImpactInfo, done);
    } 
    else {
      this._impactJSFromPath(null, impactInfo, done);
    }

  },

});

module.exports = UpdateImpactjsGenerator;