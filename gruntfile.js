module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		bumpup: {
			files: ['jsSubstitute-bower/bower.json', 'jsSubstitute-npm/package.json']
		},
		nugetpack: {
			dist: {
				src: 'package.nuspec',
				dest: './'
			}
		},
		nugetpush: {
			dist: {
				src: './*.nupkg',
				options: {
					apiKey: '2781783d-6886-43bd-91a7-5c2809e62661'
				}
			}
		},
		clean: {
			nuget: './*.nupkg'
		},
		jasmine_nodejs: {
			options: {
				forceExit: false
			},
			nodemodule: ['specs']
		},
		uglify: {
			options: {
				compress: {},
				mangle: true,
				beautify: false
			},
			lib: {
				src: ['src/index.js'],
				dest: 'jsSubstitute-bower/jsSubstitute.min.js'
			}
		},
		copy: {
			main: {
				files: [
					{
						expand: true,
						cwd: 'src',
						src: ['index.js'],
						dest: 'jsSubstitute-bower/',
						filter: 'isFile',
						flatten: true,
						rename: function (dest, src) {
							return dest + 'jsSubstitute.js';
						}
					},
					{
						expand: true,
						cwd: 'src',
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
					'specs/**/*.js',
					'src/index.js'
				],
				tasks: ['karma:browser:run', 'jasmine_nodejs', 'uglify', 'copy']
			},
			grunt: {
				files: ['gruntfile.js']
			}
		}
	});
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
	grunt.registerTask('default', ['karma', 'jasmine_nodejs', 'uglify', 'copy', 'watch']);
	grunt.registerTask('test', ['karma', 'jasmine_nodejs']);
	grunt.registerTask('nuget', ['clean:nuget', 'nugetpack', 'nugetpush']);
};