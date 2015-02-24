module.exports = function(grunt){
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jasmine_node: {
            options: {
                forceExit: false
            },
            mailreader: ['Shields.PCG.Import.MailReader.Tests/specs'],
            listener: ['Shields.PCG.Listener.Tests/specs']
        },
        ngtemplates: {
            blduxTpls: {
                cwd: 'bladeUx/BladeUx',
                src: 'tpls/**/*.html',
                dest: 'bladeUx/BladeUx/js/angular/bladeUx.angular.tpls.js' 
            }
        },
        less: {
            bladeUx: {
                options: {
                    paths: ['bladeUx/BladeUx/less']
                },
                files: {
                    "bladeUx/BladeUx/css/bladeUx.css": 'bladeUx/BladeUx/less/bladeUx.less',
                    "bladeUx/BladeUx/css/bladeUx.theme.css": 'bladeUx/BladeUx/less/bladeUx.theme.less'
                }
            },
            pcg: {
                options: {
                    paths: ['Shields.PCG.Web.Client/app/less']
                },
                files: {
                    "Shields.PCG.Web.Client/app/css/app.css": 'Shields.PCG.Web.Client/app/less/app.less',
                    "Shields.PCG.Web.Client/app/css/bladeUx.theme.pcg.css": 'Shields.PCG.Web.Client/app/less/bladeUx.theme.pcg.less',
                    "Shields.PCG.Web.Client/app/css/bootstrap.theme.pcg.css": 'Shields.PCG.Web.Client/app/less/bootstrap.theme.pcg.less'
                }
            }
        },
        cssmin: {
            libcss: {
                options: { banner: '/* Minified by cssmin */' },
                files: {
                    'Shields.PCG.Web/App/css/lib.css': [
                        'Shields.PCG.Web.Client/bower_components/bootstrap-css-only/css/bootstrap.css',
                        'Shields.PCG.Web.Client/bower_components/bootstrap-css-only/css/bootstrap-theme.css',
                        'Shields.PCG.Web.Client/bower_components/font-awesome/css/font-awesome.css',
                        'Shields.PCG.Web.Client/bower_components/textAngular/src/textAngular.css',
                        'Shields.PCG.Web.Client/bower_components/angular-ui-grid/ui-grid.css',
                        'Shields.PCG.Web.Client/Shields.PCG.Web.Client/lib/css/abn_tree.css',
                        'Shields.PCG.Web.Client/lib/css/angular-ui-switch.css',
                        'bladeUx/BladeUx/css/bladeUx.css'
                    ]
                }
            },
            appcss: {
                options: { banner: '/* Minified by cssmin */' },
                files: {
                    'Shields.PCG.Web/App/css/app.css': [
                        'Shields.PCG.Web.Client/app/css/bladeUx.theme.pcg.css',
                        'Shields.PCG.Web.Client/app/css/bootstrap.theme.pcg.css',
                        'Shields.PCG.Web.Client/app/css/app.css'
                    ]
                }
            }
        },
        uglify: {
            options: {
                compress: false,
                mangle: false,
                beautify: true
            },
            bladeuxng: {
                src: ['bladeUx/BladeUx/js/angular/*.js', 'bladeUx/BladeUx/js/angular/services/**/*.js', 'bladeUx/BladeUx/js/angular/directives/**/*.js'],
                dest: 'bladeUx/BladeUx/js/bladeUx.angular.js'
            },
            lib: {
                src: [
                    'Shields.PCG.Web.Client/bower_components/jquery/dist/jquery.js',
                    'Shields.PCG.Web.Client/bower_components/lodash/dist/lodash.js',
                    'Shields.PCG.Web.Client/bower_components/angular/angular.js',
                    'Shields.PCG.Web.Client/bower_components/angular-sanitize/angular-sanitize.js',
                    'Shields.PCG.Web.Client/bower_components/angular-google-maps/dist/angular-google-maps.js',
                    'Shields.PCG.Web.Client/bower_components/angular-ui-router/release/angular-ui-router.js',
                    'Shields.PCG.Web.Client/bower_components/angular-ui-bootstrap-bower/ui-bootstrap-tpls.js',
                    'Shields.PCG.Web.Client/bower_components/angular-data/dist/angular-data.js',
                    'Shields.PCG.Web.Client/bower_components/angular-ui-grid/ui-grid.js',
                    'Shields.PCG.Web.Client/bower_components/textAngular/dist/textAngular-rangy.min.js',
                    'Shields.PCG.Web.Client/bower_components/textAngular/dist/textAngular-sanitize.min.js',
                    'Shields.PCG.Web.Client/bower_components/textAngular/dist/textAngular.min.js',
                    'Shields.PCG.Web.Client/bower_components/bootstrap-bower/js/bootstrap.js',
                    'Shields.PCG.Web.Client/lib/js/abn_tree.js',
                    'Shields.PCG.Web.Client/lib/js/angular-ui-switch.js',
                    'Shields.PCG.Web.Client/lib/js/bootstrap-editor.js',
                    'bladeUx/BladeUx/js/bladeUx.angular.js'
                ],
                dest: 'Shields.PCG.Web/App/js/lib.js'
            },
            app: {
                src: [
                    'Shields.PCG.Web.Client/app/js/app.js',
                    'Shields.PCG.Web.Client/app/js/services/**/*.js',
                    'Shields.PCG.Web.Client/app/js/filters/**/*.js',
                    'Shields.PCG.Web.Client/app/js/directives/**/*.js',
                    'Shields.PCG.Web.Client/app/js/controllers/**/*.js'
                ],
                dest: 'Shields.PCG.Web/App/js/app.js'
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