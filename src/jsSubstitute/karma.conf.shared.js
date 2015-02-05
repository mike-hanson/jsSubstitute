module.exports = {
    basePath: './src',

    frameworks: ['jasmine'],

    files: [
        '*.js',
        __dirname + '/spec/*.js'
    ],

    exclude: [
    ],

    colors: true,

    autoWatch: true,

    singleRun: false
}