
var sharedConfig = require('./karma.conf.shared.js');

module.exports = function(config)
{
    config.set({
        basePath: sharedConfig.basePath,

        frameworks: sharedConfig.frameworks,

        files: sharedConfig.files,

        exclude: sharedConfig.exclude,

        preprocessors: {
            'src/**/*.js': 'coverage'
        },

        reporters: ['story', 'coverage', 'html'],

        coverageReporter: {
            type: 'html',
            dir: __dirname + '/Karma/Coverage'
        },

        htmlReporter: {
            outputDir: 'Karma/Html',
            templatePath: __dirname + '/jasmine_template.html'
        },

        port: 9876,

        colors: sharedConfig.colors,

        logLevel: config.LOG_INFO,

        autoWatch: sharedConfig.autoWatch,

        singleRun: sharedConfig.singleRun,

        browsers: ['PhantomJS']

    });
};