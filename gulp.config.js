module.exports = function () {
  var src = 'www/';
  var app = src + 'app/';
  var tsOutput = src + 'js/';

  var bowerOverrides = {
    'ionic': {
      'ignore': true
    },
    'angular': {
      'ignore': true
    },
    'highcharts': {
      'main': ['adapters/standalone-framework.js', 'highstock.js']
    }
  };

  var mainBowerFiles = require('main-bower-files');
  var bowerFiles = mainBowerFiles({ overrides: bowerOverrides, includeDev: true });

  var config = {
    src: src,
    index: src + 'index.html',
    css: src + 'css/**/*.css',
    cssOutputPath: src + 'css/',

    js: [
      tsOutput + "**/*.module.js",
      tsOutput + "**/*.js",
      '!' + '**/*.spec.js'
    ],

    /**
     * Typescript
     */
    ts: app + '**/*.ts',
    tsOutputPath: tsOutput,

    scss: 'scss/**/*.scss',

    /**
     * Bower and NPM locations
     */
    bower: {
      json: require('./bower.json'),
      directory: src + 'lib/',
      ignorePath: '../../',
      overrides: bowerOverrides
    }
  };

  config.getBowerFilesDefaultOptions = function () {
    var options = {
      overrides: config.bower.overrides
    };

    return options;
  };

  /**
   * karma settings
   */
  config.karma = getKarmaOptions();

  return config;

  ////////////////////////////

  function getKarmaOptions() {
    var options = {
      files: [].concat(
        'www/lib/ionic/js/ionic.bundle.js',

        bowerFiles,
        'node_modules/ng-describe/dist/ng-describe.js',

        app + '**/*.module.js',
        tsOutput + "**/*.module.js",
        app + '**/*.js',
        tsOutput + "**/*.js"
        // temp + config.templateCache.file,
        // config.serverIntegrationSpecs
      ),
      preprocessors: {}
    };

    options.preprocessors[tsOutput + '**/!(*.spec)+(.js)'] = ['coverage'];
    return options;
  }
};
