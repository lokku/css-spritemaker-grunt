/*
 * grunt-css-spritemaker
 * https://github.com/lokku/css-spritemaker-grunt
 *
 * Copyright (c) 2014 Lokku ltd.
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    css_spritemaker: {
        simple_sprite: {
            options : {
                createTargetPaths: true,
            },
            sourceDir: 'test/fixtures/nsti',
            targetImage: 'tmp/sprite.png',
        },
        with_source_images: {
            options : {
                createTargetPaths: false,
            },
            sourceImages: [
                'test/fixtures/nsti/homepage-bullet-orange.png', 
                'test/fixtures/nsti/cancel-feature.png'
            ],
            targetImage: 'tmp/withSourceImages.png',
        },
        with_layout_name: {
            options : {
                createTargetPaths: false,
            },
            sourceDir: 'test/fixtures/nsti',
            targetImage: 'tmp/withPackedLayout.png',
            layoutName: 'Packed'
        },
        with_extended_layout_definition: {
            options : {
                createTargetPaths: true,
            },
            sourceDir: 'test/fixtures/nsti',
            targetImage: 'tmp/withExtendedLayoutDefinition.png',
            layout: {
                'name' : 'FixedDimension',
                'options' : {
                    n : '2'
                }
            }
        },
        with_composite_layout: {
            options : {
                createTargetPaths: true,
            },
            targetImage: 'tmp/withCompositeLayout.png',
            parts : [
                { sourceImages: [
                      'test/fixtures/nsti/homepage-bullet-orange.png', 
                      'test/fixtures/nsti/cancel-feature.png'
                  ],
                  layoutName : 'Packed'
                },
                { sourceImages : ['test/fixtures/nsti'],
                  layout : {
                      name : 'DirectoryBased'
                  },
                  includeInCss : 0,
                  removeSourcePadding : 1
                }
            ],
            layout: {
                'name' : 'FixedDimension',
                'options' : {
                    n : '2'
                }
            }
        },
        with_css_stylesheet: {
            options : {
                createTargetPaths: false,
                generateCss: {
                    targetCssPath : "tmp/sprite.css",
                    // optional
                    renameSpriteImagePath : "somewhere/over/the/rainbow.png"
                }
            },
            sourceDir: 'test/fixtures/nsti',
            targetImage: 'tmp/sprite.png'
        },
        with_prefix_stylesheet: {
            options : {
                createTargetPaths: true,
                generateCss: {
                    targetCssPath : "tmp/spriteWithPrefix.css",
                    // optional
                    cssClassPrefix: 'icon-'
                }
            },
            sourceDir: 'test/fixtures/nsti',
            targetImage: 'tmp/spriteWithPrefix.png'
        },
        fake_css: {
            options : {
                generateCss: {
                    //
                    // note: turning fakeCss on will not generate any sprite
                    // image, and ignore any options related to image sprite
                    // generation.
                    //
                    fakeCss: true,
                    targetCssPath : "tmp/fakeCss.css",
                    cssClassPrefix: 'icon-'
                }
            },
            sourceDir: 'test/fixtures/nsti'
        }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'css_spritemaker', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
