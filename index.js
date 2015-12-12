/**
 * @fileOverview
 * ./index.js
 * @description
 *
 *
 */

// ===============================================================  Dependencies
var artoo = require('artoo-js');
var cheerio = require('cheerio');
var request = require('request');
var Q = require('q');
var fs = require('fs');

// ==================================================================  Init data
var params = null;
var _xmlString = '<ul><li>h';

// =======================================================  Implements Interface
function authenticate (domainConfig) {
  request.post({
    uri: domainConfig.loginUrl,
    headers: domainConfig.headers,
    body: require('querystring').stringify(domainConfig.credentials)
  }, function(err, res, body){
    if(err) {
      callback.call(null, new Error('Login failed'));
      return;
    }

    request('http://yourwebsite.com/info', function(err, res, body) {
      if(err) {
        callback.call(null, new Error('Request failed'));
        return;
      }

      var $ = cheerio.load(body);
      var text = $('#element').text();
    });
  });
}

function load_document (config) {
  var def = Q.defer();
  var defaultConfig = {
    url: 'http://www.infofree.com/'
  }
  var _config = config || defaultConfig;
  if (!_config.url) {
    console.log('No URL loaded.');
    def.reject(null);
  } else {
    console.log('Loading ' + _config.url);
    request(_config.url, function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        def.resolve($);

        /*
         *$('span.comhead').each(function(i, element){
         *  var a = $(this).prev();
         *  console.log(a.text());
         *});
         */
      }
    });
  }
  return def.promise;
}

// ===================================================  Implementation Functions
function scrape_document (config) {
  /**
   * @inner
   */
  var defaultConfig = {
    strategy : 'artoo',
    content  : '',
    selector : '',
    params   : params
  };
  var _config = config || defaultConfig;
  var data = null;
  var $ = null;

  if (_config.strategy !== 'artoo') {
    // @strategy 'jquery'
    artoo.bootstrap(cheerio);
    $ = cheerio.load(_config.content);
    data = $(_config.selector).scrape(_config.params);
  } else {
    $ = cheerio.load(_config.content);
    artoo.setContext($);
    data = artoo.scrape(_config.selector, _config.params);
  }

  return data;

}

var domainConfigPath = './domains.json';

function setup_domain () {
  var def = Q.defer();
  var domainSetup = fs.readFile(domainConfigPath, 'utf-8', function (err, data) {
    var configData = JSON.parse(data) || null;
    def.resolve(configData);
  });
  return def.promise;
}

function init (domainConfig) {
  authenticate(domainConfig).then(function () {
    load_document().then(function (html) {
      var __xmlString = html.html() || _xmlString;
      var conf = {
        strategy : 'artoo',
        content  : __xmlString,
        selector : 'ul > li',
        params   : null
      };

      //console.dir(conf);
      console.log(scrape_document(conf));
    });
  });
}

setup_domain().then(function (domainConfig) {
  init(domainConfig);
});

module.exports = {
  crawl_document: load_document
};
