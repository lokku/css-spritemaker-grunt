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
            files: {
                'tmp/sprite.png' : 'test/fixtures/nsti',
            }
        },
        with_source_images: {
            options : {
                createTargetPaths: false,
            },
            src: [
                'test/fixtures/nsti/homepage-bullet-orange.png', 
                'test/fixtures/nsti/cancel-feature.png'
            ],
            dest: 'tmp/withSourceImages.png'
        },
        with_layout_name: {
            options : {
                createTargetPaths: false,
                generateImage: {
                    layoutName: 'Packed'
                }
            },
            src: 'test/fixtures/nsti',
            dest: 'tmp/withPackedLayout.png',
        },
        with_extended_layout_definition: {
            options : {
                createTargetPaths: true,
                generateImage: {
                    layout: {
                        'name' : 'FixedDimension',
                        'options' : {
                            n : '2'
                        }
                    }
                }
            },
            src: 'test/fixtures/nsti',
            dest: 'tmp/withExtendedLayoutDefinition.png',
        },
        with_composite_layout: {
            options : {
                createTargetPaths: true,
                generateImage: {
                    //
                    // The 'glue' layout goes here
                    //
                    layout: {
                        'name' : 'FixedDimension',
                        'options' : {
                            n : '2'
                        }
                    }
                }
            },
            files: [
                { src: [
                    'test/fixtures/nsti/homepage-bullet-orange.png', 
                    'test/fixtures/nsti/cancel-feature.png'
                  ],
                  dest: 'tmp/withCompositeLayout.png', // NOTE: must be the same
                  options: {
                      // compact layout spec
                      layoutName: 'Packed'
                  }
                },
                { src: ['test/fixtures/nsti'],
                  dest: 'tmp/withCompositeLayout.png', // NOTE: must be the same
                  //
                  // options specific to one part follow
                  //
                  options: {
                      // 'extended' layout spec
                      layout : {
                          'name' : 'DirectoryBased'
                      },
                      includeInCss : 0,
                      removeSourcePadding : 1
                  }
                }
            ]
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
            src: 'test/fixtures/nsti',
            dest: 'tmp/sprite.png'
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
            src: 'test/fixtures/nsti',
            dest: 'tmp/spriteWithPrefix.png'
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
            src: 'test/fixtures/nsti'
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
