var artoo = require('artoo-js');
var cheerio = require('cheerio');
var request = require('request');
var Q = require('q');

var params = null;
var _xmlString = '<ul><li>h';

function load_document (config) {
  var def = Q.defer();
  var defaultConfig = {
    url: null
  }
  var _config = config || defaultConfig;
  if (!_config.url)
    return;
  request(_config.url, function (error, response, html) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(html);
      def.resolve($);

      $('span.comhead').each(function(i, element){
        var a = $(this).prev();
        console.log(a.text());
      });
    }
  });
  return def.promise;
}

function scrape_document (config) {
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

// @password Success2014?
var domainConfig = {
  url      : 'http://infofree.com',
  username : 'brian@waltonhenry.com',
  password : 'success2014'
};

load_document(domainConfig).then(function (html) {
  var __xmlString = html || _xmlString;
  var conf = {
    strategy : 'artoo',
    content  : __xmlString,
    selector : 'ul > li',
    params   : null
  };
  console.dir(conf);

  console.log(scrape_document(conf));
})
