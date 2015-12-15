"use strict";

var fs = require('fs');
//var phantom = require('phantom');
var util = require('util');
var Q = require('q');
var _ = require('lodash');
var path = require('path');

/**
 * Load cookies from a file within a PhantomJS context.
 *
 * @param {String} file name of the file.
 *
 * @return {Array} of cookies.
 */
 function loadCookies(file) {
  var def = Q.defer();
  var cookies = [];
  var loadedCookies = [];
  var cookieConstruct = {};
  var fp = path.resolve(__dirname, file);
  console.log(fp);
  if (fs.exists(fp)) {
    fs.readFile(fp, 'utf-8', function (err, data) {
      var cookieData = JSON.parse(data) || null;
      def.resolve(cookieData);
    });

    /*
     *cookies = fs.read(file).split("\r\n");
     *cookies.forEach(function (cookie) {
     *  var detail = cookie.split("\t"),
     *      newCookie = {
     *    'name':   detail[5],
     *    'value':  detail[6],
     *    'domain': detail[0],
     *    'path':   detail[2],
     *    'httponly': false,
     *    'secure':   false,
     *    'expires':  (new Date()).getTime() + 3600 * 24 * 30 [> <- expires in 1 month <]
     *  };
     *  phantom.addCookie(newCookie);
     *  loadedCookies.push(newCookie);
     *});
     */
    /*
     *cookieConstruct.cookies = cookies;
     *cookieConstruct.loadedCookies = loadCookies;
     *def.resolve(cookieConstruct);
     */
  } else {
    console.log("Unable to load cookies from " + fp + ". File doesn't exist", "warning");
  }

  return def.promise;
};

/**
 * Save cookies to a file from request or within PhantomJS context,
 * if not in PhantomJS context, a request with .jar() should be passed.
 *
 * @param {String} file name of the file.
 */
function saveCookies(file, cookieJar) {
  var res = '';
  var def = Q.defer()
  //console.log(cookieJar);
  if (cookieJar) {
    var _cookies = cookieJar;
  } else {
    var _cookies = this.page.cookies;
  }
  var s_cookies = JSON.stringify(_cookies, null, 4);
  console.log(s_cookies);
  fs.writeFile(path.resolve(__dirname, file), s_cookies, 'utf-8', function (err, d) {
    console.log(err);
    console.log(d);
    def.resolve(d);
  });
  /*
   *return;
   *_.forEach(_cookies, function (cookie) {
   *  res += util.format("%s\t%s\t%s\t%s\t%s\t%s\t%s\r\n", cookie.domain, 'TRUE', cookie.path, 'FALSE', cookie.expiry, cookie.name, cookie.value);
   *});
   *fs.write(file, res, 'w');
   */
  return def.promise;
};

module.exports = {
  loadCookies: loadCookies,
  saveCookies: saveCookies
}
