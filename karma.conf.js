module.exports = function(config){
    config.set({
        basePath: __dirname,
        files: [
            'jsSubstitute/main.js',
            'jsSubstitute.Browser.Tests/specs/**/*.js'
        ],
        exclude: [],
        preprocessors: {
            'jsSubstitute/main.js': 'coverage'
        },

        reporters: ['story', 'coverage', 'junit'],

        coverageReporter: {
            type: 'html',
            dir: __dirname + '/Results/Coverage'
        },

        junitReporter: {
            outputFile: __dirname + '/Results/Results.xml',
            suite: ''
        },

        browsers: ['PhantomJS'],
        frameworks: ['jasmine'],
        logLevel: config.LOG_INFO
    });
};