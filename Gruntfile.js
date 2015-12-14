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
                    reporter: 'progress'
                },
                src: ['test/**/*_test.js']
            }
        },

        assemble: {
            options: {
                plugins: ['lib/grunt-assemble-kss.js']
            },
            test: {
                options: {
                    kss: {
                        src: "test/fixtures/scss",
                        src_mask: "*.scss",
                        overviewMarkdownFile:"styleguide.md",
                        dest: "test/actual",
                        template: "test/fixtures/layouts/style-guide-layout.hbs"
                    }
                }
            }
        },

        // Before generating new files, remove any files from previous build.
        clean: {
            actual: ['test/actual/**'],
        }
    });

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'clean', 'assemble']);

    // Tests to be run.
    grunt.registerTask('test', ['default', 'mochaTest']);
};