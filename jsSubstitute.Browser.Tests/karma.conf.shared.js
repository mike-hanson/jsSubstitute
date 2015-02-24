module.exports = {
    basePath: '../jsSubstitute',

    frameworks: ['jasmine'],

    files: [
        'main.js',
        __dirname + '/spec/*.js'
    ],

    exclude: [
    ],

    colors: true,

    autoWatch: true,

    singleRun: false
}