/*
 * Assemble Plugin: KSS Style Guide
 * https://github.com/hariadi/assemble-sitemap
 *
 * Copyright (c) 2015 Ergosign GmbH, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt, {pattern: ['grunt-*', '@*/grunt-*', 'assemble']});

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                node: true
            },
            all: ['Gruntfile.js', 'lib/**/*.js']
        },

        /**
         * Run mocha tests.
         */
        mochaTest: {
            tests: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/**/*_test.js']
            }
        },

        watch: {
            js: {
                files: '**/*.js',
                tasks: ['default']
            }
        },

        assemble: {
            options: {
                plugins: ['lib/assembleKssPlugin.js'],
                partials:['test/fixtures/scss/**/*.hbs']
            },
            test: {
                options: {
                    kss: {
                        src: "test/fixtures/scss",
                        src_mask: "*.scss",
                        overviewMarkdownFile:"test/fixtures/scss/styleguide.md",
                        dest: "test/actual",
                        template: "test/fixtures/layouts/style-guide-layout.hbs"
                    }
                }
            }
        },

        // Before generating new files, remove any files from previous build.
        clean: {
            actual: ['test/actual/**']
        }
    });

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'clean', 'assemble','mochaTest']);

    // Tests to be run.
    grunt.registerTask('run-tests', ['default','watch']);
};