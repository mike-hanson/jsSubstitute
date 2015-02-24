module.exports = function(grunt){
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jasmine_node: {
            options: {
                forceExit: false
            },
            unit: ['jsSubstitute.Node.Tests/specs']
        },
        uglify: {
            options: {
                compress: true,
                mangle: true,
                beautify: false
            },
            lib: {
                src: ['jsSubstitute/main.js'],
                dest: 'bladeUx/BladeUx/js/bladeUx.angular.js'
            }
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: 'Shields.PCG.Web.Client/app/css/images',
                        src: ['*'],
                        dest: 'Shields.PCG.Web/App/css/images/',
                        filter: 'isFile',
                        flatten: true
                    },
                    {
                        expand: true,
                        cwd: 'Shields.PCG.Web.Client/app/fonts',
                        src: ['**/*'],
                        dest: 'Shields.PCG.Web/App/fonts/',
                        filter: 'isFile',
                        flatten: false
                    },
                    {
                        expand: true,
                        cwd: 'app',
                        src: ['favicon.ico'],
                        dest: 'Shields.PCG.Web/App/',
                        flatten: true
                    },
                    {
                        expand: true,
                        cwd: 'Shields.PCG.Web.Client/bower_components/font-awesome/fonts',
                        src: ['*'],
                        dest: 'Shields.PCG.Web/App/fonts/',
                        filter: 'isFile',
                        flatten: true
                    },
                    {
                        expand: true,
                        cwd: 'Shields.PCG.Web.Client/bower_components/bootstrap-css-only/fonts',
                        src: ['*'],
                        dest: 'Shields.PCG.Web/App/fonts/',
                        filter: 'isFile',
                        flatten: true
                    },
                    {
                        expand: true,
                        cwd: 'Shields.PCG.Web.Client/bower_components/angular-ui-grid',
                        src: ['*.eot', '*.ttf', '*.svg', '*.woff'],
                        dest: 'Shields.PCG.Web/App/css/',
                        filter: 'isFile',
                        flatten: true
                    }
                ]
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                background: true,
                autoWatch: false,
                singleRun: false
            }
        },
        watch: {
            nodes: {
                files: ['Shields.PCG.Import.MailReader.Tests/specs/**/*.js', 'Shields.PCG.Listener.Tests/specs**/*.js', 'Shields.PCG.Listener/**/*.js', 'Shields.PCG.Import.MailReader/**/*.js'],
                tasks: ['jasmine_node']
            },
            tpls: {
                files: ['bladeUx/BladeUx/tpls/**/*.html'],
                tasks: ['ngtemplates']
            },
            less: {
                files: ['Shields.PCG.Web.Client/app/less/*.less', 'bladeUx/BladeUx/less/*.less'],
                tasks: ['less']
            },
            css: {
                files: ['Shields.PCG.Web.Client/app/css/*.css'],
                tasks: ['cssmin']
            },
            scripts: {
                files: ['Shields.PCG.Web.Client/app/js/**/*.js', 
                    'bladeUx/BladeUx/js/angular/**/*.js'],
                tasks: ['uglify']
            },
            assets: {
                files: ['Shields.PCG.Web.Client/app/fonts/*.*', 'Shields.PCG.Web.Client/app/css/images/*.*'],
                tasks: ['copy']
            },
            karma: {
                files: [
                    'karma.conf.js',
                    'Shields.PCG.Web.Client/app/js/**/*.js',
                    'Shields.PCG.Web.Client.Tests/**/*.js',
                    'bladeUx/BladeUx/js/angular/**/*.js',
                    'bladeUx/BladeUx.Specs/specs/**/*.js'
                ],
                tasks: ['karma:unit:run']
            },
            grunt: {
                files: ['gruntfile.js']
            }
        }
    });
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    grunt.registerTask('default', ['ngtemplates', 'uglify', 'less', 'cssmin', 'copy', 'karma', 'jasmine_node', 'watch']);
};