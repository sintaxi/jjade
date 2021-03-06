'use strict';

var jstransformer = require('jstransformer');
var uglify = require('uglify-js');
var CleanCSS = require('clean-css');

var warned = {};
var alternatives = {
  uglifyJS: 'uglify-js',
  uglify: 'uglify-js',
  uglifyCSS: 'clean-css',
  'uglify-css': 'clean-css' ,
  uglifyJSON: 'json',
  'uglify-json': 'json',
  live: 'livescript',
  LiveScript: 'livescript',
  ls: 'livescript',
  // TODO: remove if we add support for coffeekup
  coffeekup: 'coffeecup',
  // The `style` transformer is not the same as the `stylus` jstransformer
  styl: 'stylus',
  coffee: 'coffee-script',
  coffeescript: 'coffee-script',
  coffeeScript: 'coffee-script',
  // these marker transformers haven't made sense in a long time
  css: 'verbatim',
  js: 'verbatim',
};
var deprecated = ['jqtpl', 'jazz'];
function getMarkdownImplementation() {
  var implementations = ['marked', 'supermarked', 'markdown-js', 'markdown'];
  while (implementations.length) {
    try {
      require(implementations[0]);
      return implementations[0];
    } catch (ex) {
      implementations.shift();
    }
  }
  return 'markdown-it';
}

module.exports = filter;
function filter(name, str, options) {
  if (typeof filter[name] === 'function') {
    return filter[name](str, options);
  } else {
    var tr;
    try {
      tr = jstransformer(require('jstransformer-' + name));
    } catch (ex) {}
    if (tr) {
      // TODO: we may want to add a way for people to separately specify "locals"
      var result = tr.render(str, options, options).body;
      if (options && options.minify) {
        try {
          switch (tr.outputFormat) {
            case 'js':
              result = uglify.minify(result, {fromString: true}).code;
              break;
            case 'css':
              result = new CleanCSS().minify(result).styles;
              break;
          }
        } catch (ex) {
          // better to fail to minify than output nothing
        }
      }
      return result;
    } else {
      throw new Error('unknown filter ":' + name + '"');
    }
  }
}
