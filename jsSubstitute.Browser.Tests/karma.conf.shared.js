module.exports = {
    basePath: '../jsSubstitute',

    frameworks: ['jasmine'],

    files: [
        'index.js',
        __dirname + '/specs/*.js'
    ],

    exclude: [
    ],

    colors: true,

    autoWatch: true,

    singleRun: false
}