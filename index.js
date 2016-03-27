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
var casperCookies = require('./casperCookies');
var jsonfile = require('jsonfile');
//var pool = new http.Agent();
var Spooky;
try {
  Spooky = require('spooky');
} catch (e) {
  Spooky = require('../lib/spooky');
}


// ==================================================================  Init data
var params = null;
var _xmlString = '<ul><li>h';
//var domainConfigPath = './domains.json';
var domainConfigPath = './domains.webstersauction.com';

// =======================================================  Implements Interface
function load_authenticated_document (domainConfig, mode) {
  var def = Q.defer();
  // @note Try https://gist.github.com/clochix/5967978 to save cookieJar to file before using with CasperJS.
  // @idea Try writing to ./domains.cookies.
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

  if (domainConfig.test) {

    request.get({
      url     : domainConfig.landingUrl
    }, function (err, res, body) {
      if (err) {
        callback.call(null, new Error('Request failed'));
        def.resolve(err);
        return;
      }

      var $ = cheerio.load(body);
      $.res = res;

      $.cookieJar = cookieJar;
      def.resolve($);
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

    casperCookies.saveCookies(domainConfig.cookiesFile, cookieJar).then(function (d) {
      console.log(d);
      console.log('Cookies saved!');
    });

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

      $.cookieJar = cookieJar;
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
  if (!_config.landingUrl) {
    var errorMsg = 'No URL loaded.';
    console.log(errorMsg);
    def.resolve(new Error(errorMsg));
  } else {
    console.log('Loading ' + _config.landingUrl);
    request(_config.landingUrl, function (error, response, html) {
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
  var r = [];

  if (_config.engine) {
    _config.engine(_config.pre).each(function (i, element) {
      var a = $(this).prev();
      //console.log(a.text());
    });
  }

  if (_config.strategy === 'cheerio') {
    // @strategy 'jquery'
    artoo.bootstrap(cheerio);
    $ = cheerio.load(_config.content);
    //data = $(_config.selector).scrape(_config.params);
    data = $(_config.selector);
    //console.log(data);
    data.each(function (i, element) {
      r.push($(element).html());
    });
  } else {
    $ = cheerio.load(_config.content);
    artoo.setContext($);
    data = artoo.scrape(_config.selector, _config.params);
  }

  return {
    config: _config,
    data: data,
    scrape: r
  };

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
  var def = Q.defer();
  var __xmlString;
  var engine;

  load_authenticated_document(domainConfig, null).then(function (authenticatedHtml) {
    load_document(domainConfig).then(function (html) {
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
        //strategy : 'artoo',
        strategy : 'cheerio',
        content  : __xmlString,
        selector : 'div.gallery > dl',
        params   : null
      };

      //console.log(scrape_document(conf));
      def.resolve(scrape_document(conf));
    });
  });

  return def.promise;
}

// ===================================================================== Driver
function Spook (domainConfig, pageDataConfig) {
  //console.log(pageDataConfig.$$);
  //console.log(pageDataConfig.content);
  //phantom.pageDataConfig = pageDataConfig;

  // @node CasperJS depends on PhantomJS, and Spooky drives CasperJS in Node.js.
  // We are assuming that requests objects for .jar() from request lib can be
  // shared between phantom.cookies and request itself.

  //var cookieData = rs.read(cookieFile);
  //phantom.cookies = JSON.parse(cookieData);
  //phantom.cookies = cookieJar;

  var spooky = new Spooky({
    child: {
      transport      : 'http',
      'cookies-file' : domainConfig.cookiesFile
    },
    casper: {
      logLevel : 'debug',
      verbose  : true
    }
  }, function (err) {
    if (err) {
      e = new Error('Failed to initialize SpookyJS');
      e.details = err;
      throw e;
    }

    spooky.start(domainConfig.landingUrl);
    casperCookies.loadCookies(domainConfig.cookiesFile).then(function (cookieConstruct) {
      spooky.then(function () {
        try {
          this.page.setCookies(cookieConstruct);
        } catch (e) {
          console.log(e);
        }
      });
    });
    spooky.then(function () {
      this.emit('getTitle', 'Title from ' + this.evaluate(function () {
        return document.title;
      }));
    });
    spooky.run();
  });

  spooky.on('error', function (e, stack) {
    console.error(e);

    if (stack) {
      console.log(stack);
    }
  });

  spooky.on('console', function (line) {
    console.log(line);
  });

  spooky.on('getTitle', function (greeting) {
    console.log(greeting);
  });

  spooky.on('log', function (log) {
    if (log.space === 'remote') {
      console.log(log.message.replace(/ \- .*/, ''));
    }
  });

}

setup_domain().then(function (domainConfig) {
  init(domainConfig).then(function (capturedPageData) {
    //console.dir(capturedPageData.scrape);
    var outputFile = __dirname + '/tmp/' + domainConfig.outputName
    var outputList = {
      list: capturedPageData.scrape
    };
    jsonfile.writeFile(outputFile, outputList, {spaces: 2}, function (err) {
      //console.error(err);
    });
    //var pageDataConfig = capturedPageData.config;
    //Spook(domainConfig, pageDataConfig);
  });
});

// ==========================================================  Export Interface
module.exports = {
  crawl_document: load_document
};
