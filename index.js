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
var http = require('http')
var pRequest = require("promisified-request").create();
var fScraper = require("form-scraper");

var pool = new http.Agent();

// ==================================================================  Init data
var params = null;
var _xmlString = '<ul><li>h';
var domainConfigPath = './domains.json';

// =======================================================  Implements Interface
function load_authenticated_document (domainConfig, mode) {
  var def = Q.defer();
  var cookieJar = request.jar();

  /*
   *var loginDetails = {
   *  user: "",
   *  password: ""
   *};
   */
  if (mode && mode === 'form-scraper') {
    var loginDetails = domainConfig.credentials;
    var formProvider = new fScraper.ScrapingFormProvider();
    var formSubmitter = new fScraper.FormSubmitter();

    formProvider.updateOptions({
      formId             : domainConfig.formLogin,
      url                : domainConfig.loginUrl,
      promisifiedRequest : pRequest
    });

    formSubmitter
      .updateOptions({
        formProvider       : formProvider,
        promisifiedRequest : pRequest
      })
      .submitForm(loginDetails)
        .then(function(response) {
            def.resolve(response.body);
        });

    return def.promise;
  }

  request.post({
    jar     : cookieJar,
    uri     : domainConfig.loginUrl,
    headers : domainConfig.headers,
    body    : require('querystring').stringify(domainConfig.credentials)
    //form : domainConfig.credentials
  }, function (auth_err, auth_res, auth_body) {
    if (auth_err) {
      callback.call(null, new Error('Login failed'));
      def.resolve(auth_err);
      return;
    }

    request.get({
      jar     : cookieJar,
      url     : domainConfig.landingUrl,
      headers : auth_res.headers
    }, function (err, res, body) {
      if (err) {
        callback.call(null, new Error('Request failed'));
        def.resolve(err);
        return;
      }

      var $ = cheerio.load(body);
      $.res = res;
      def.resolve($);
    });
  });

  return def.promise;
}

function load_document (config) {
  var def = Q.defer();
  var defaultConfig = {
    url: 'http://www.infofree.com/'
  }
  var _config = config || defaultConfig;
  if (!_config.url) {
    var errorMsg = 'No URL loaded.';
    console.log(errorMsg);
    def.resolve(new Error(errorMsg));
  } else {
    console.log('Loading ' + _config.url);
    request(_config.url, function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        def.resolve($);
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
    engine   : undefined,
    pre      : 'span',
    strategy : 'artoo',
    content  : '',
    selector : '',
    params   : params
  };
  var _config = config || defaultConfig;
  var data = null;
  var $ = null;

  if (_config.engine) {
    _config.engine(_config.pre).each(function (i, element) {
      var a = $(this).prev();
      //console.log(a.text());
    });
  }

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

// =========================================================  Config Environment
function setup_domain () {
  var def = Q.defer();
  var domainSetup = fs.readFile(domainConfigPath, 'utf-8', function (err, data) {
    var configData = JSON.parse(data) || null;
    def.resolve(configData);
  });
  return def.promise;
}

// =============================================================  Initialization
function init (domainConfig) {
  var __xmlString;
  var engine;
  load_authenticated_document(domainConfig, null).then(function (authenticatedHtml) {
    load_document().then(function (html) {
      try {
        engine = authenticatedHtml;
        //console.log(authenticatedHtml.res);
        __xmlString = authenticatedHtml.html();
      } catch (e) {
        engine = html;
        __xmlString = html.html() || _xmlString;
      }

      var conf = {
        '$$'     : engine,
        strategy : 'artoo',
        content  : __xmlString,
        selector : 'ul > li',
        params   : null
      };

      console.log(scrape_document(conf));
    });
  });
}

setup_domain().then(function (domainConfig) {
  init(domainConfig);
});

// ==========================================================  Export Interface
module.exports = {
  crawl_document: load_document
};
