var sharedConfig = require('./karma.conf.shared.js ');

module.exports = function(config) {
  config.set({
        
        basePath: sharedConfig.basePath,
        
        frameworks: sharedConfig.frameworks,
        
        files: sharedConfig.files,
        
        exclude: sharedConfig.exclude,

    preprocessors: {
    },


    reporters: ['story'],

    port: 9877,
    
   colors: sharedConfig.colors,

    logLevel: config.LOG_DEBUG,
        
    autoWatch: sharedConfig.autoWatch,

    browsers: ['Chrome'],

    singleRun: sharedConfig.singleRun
  });
};
