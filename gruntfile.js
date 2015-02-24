module.exports = function(grunt){
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
		bumpup: {
			files: ['jsSubstitute-bower/bower.json', 'jsSubstitute-npm/package.json']
		},
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
                src: ['jsSubstitute/index.js'],
                dest: 'jsSubstitute-bower/jsSubstitute.min.js'
            }
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: 'jsSubstitute',
                        src: ['index.js'],
                        dest: 'jsSubstitute-bower/',
                        filter: 'isFile',
                        flatten: true,
                        rename: function(dest, src){
                            return dest + 'jsSubstitute.js';
                        }
                    },
                    {
                        expand: true,
                        cwd: 'jsSubstitute',
                        src: ['index.js'],
                        dest: 'jsSubstitute-npm/',
                        filter: 'isFile',
                        flatten: true
                    }
                ]
            }
        },
        karma: {
            browser: {
                configFile: 'karma.conf.js',
                background: true,
                autoWatch: false,
                singleRun: false
            }
        },
        watch: {
            all: {
                files: [
                    'jsSubstitute.Node.Tests/specs/**/*.js',
                    'jsSubstitute/index.js',
                    'jsSubstitute.Browser.Tests/specs/**/*.js'
                ],
                tasks: ['karma:browser:run', 'jasmine_node', 'uglify', 'copy']
            },
            grunt: {
                files: ['gruntfile.js']
            }
        }
    });
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    grunt.registerTask('default', ['karma', 'jasmine_node', 'uglify', 'copy', 'watch']);
};