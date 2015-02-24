
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

        reporters: ['story', 'coverage'],

        coverageReporter: {
            type: 'html',
            dir: __dirname + '/Karma/Coverage'
        },

        port: 9876,

        colors: sharedConfig.colors,

        logLevel: config.LOG_INFO,

        autoWatch: sharedConfig.autoWatch,

        singleRun: sharedConfig.singleRun,

        browsers: ['PhantomJS']

    });
};