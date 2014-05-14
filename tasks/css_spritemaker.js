/*
 * grunt-css-spritemaker
 * https://github.com/lokku/css-spritemaker-grunt
 *
 * Copyright (c) 2014 Lokku Ltd.
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('css_spritemaker', 'Combine multiple images into a CSS Sprite', function() {

    //
    // This one remaps keys of inputs specified via gruntfile into the ones
    // accepted by CSS::SpriteMaker. The difference is just about the naming.
    //
    // CSS::SpriteMaker snake_case, Gruntfile using camelCase
    //
    var remapObjectKeysDeep = function (obj) {
        var nameMapping = {
            sourceImages : 'source_images',
            layoutName : 'layout_name',
            includeInCss : 'include_in_css',
            removeSourcePadding : 'remove_source_padding'
        };

        var typeOfObj = grunt.util.kindOf(obj),
            result,
            key,
            renamedKey,
            i;

        if (typeOfObj === 'array') {
            result = [];

            // convert each element of the array
            for (i=0; i<obj.length; i++) {
                result.push(remapObjectKeysDeep(obj[i]));
            }
        }
        else if (typeOfObj === 'object') {
            result = {};
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    renamedKey = key;
                    if (nameMapping.hasOwnProperty(key)) {
                        renamedKey = nameMapping[key];
                    }
                    result[renamedKey] = remapObjectKeysDeep(obj[key]);
                }
            }
        }
        else {
            return obj;
        }

        return result;
    };


    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
        createTargetPaths: false,
        generateCss: undefined
    });

    var data = this.data,
        sourceDir = data.sourceDir,
        sourceImages = data.sourceImages,
        layoutName = data.layoutName,
        layout = data.layout,
        parts = remapObjectKeysDeep(data.parts),
        targetImage = data.targetImage;

    //
    // initialize Perl first
    //
    var Perl = require('perl').Perl;
    var perl = new Perl();

    // use CSS::SpriteMaker 
    perl.use('CSS::SpriteMaker');

    // new
    var SpriteMaker;
    try {
        if (typeof options.generateCss !== 'undefined' &&
            typeof options.generateCss.cssClassPrefix !== 'undefined') {

            SpriteMaker = perl.getClass('CSS::SpriteMaker').new(
                'css_class_prefix', options.generateCss.cssClassPrefix
            );
        }
        else {
            SpriteMaker = perl.getClass('CSS::SpriteMaker').new();
        }
    }
    catch (e) {
        grunt.log.error(e);
        return;
    }

    //
    // make sure target image is specified and deal with directory
    // creation.
    //
    if (typeof targetImage !== 'undefined') {
        if (options.createTargetPaths) {
            grunt.file.write(targetImage, '');
        }
    }
    else {
        grunt.log.error("the targetImage parameter must be specified. E.g., path/to/image.png");
        return;
    }

    // make the sprite image
    var that = this;
    try {
        if (typeof parts !== 'undefined') {
            //
            // We are dealing with composing layouts here ('parts' was specified)
            //

            if (typeof layout === 'undefined') {
                grunt.log.error("A layout is needed for composing layouts!");
                return;
            }

            SpriteMaker.compose_sprite(
                'target_file', targetImage,
                'parts', parts,
                'layout', layout
            );
        }
        else {
            if (typeof sourceDir !== 'undefined') {

                if (typeof layout !== 'undefined') {
                    SpriteMaker.make_sprite(
                        'source_dir', sourceDir,
                        'target_file', targetImage,
                        'layout', layout
                    );
                }
                else if (typeof layoutName !== 'undefined') {
                    SpriteMaker.make_sprite(
                        'source_dir', sourceDir,
                        'target_file', targetImage,
                        'layout_name', layoutName
                    );
                }
                else {
                    SpriteMaker.make_sprite(
                        'source_dir', sourceDir,
                        'target_file', targetImage
                    );
                }
            }
            else if (typeof sourceImages !== 'undefined') {

                if (typeof layout !== 'undefined') {
                    SpriteMaker.make_sprite(
                        'source_images', sourceImages,
                        'target_file', targetImage,
                        'layout', layout
                    );
                }
                else if (typeof layoutName !== 'undefined') {
                    SpriteMaker.make_sprite(
                        'source_images', sourceImages,
                        'target_file', targetImage,
                        'layout_name', layoutName
                    );
                }
                else {
                    SpriteMaker.make_sprite(
                        'source_images', sourceImages,
                        'target_file', targetImage
                    );
                }
            }
        }
    }
    catch (e) {
        grunt.log.error(e);
        return;
    }

    //
    // Write CSS
    //
    if (typeof options.generateCss !== 'undefined') {
        var cssOpts = options.generateCss;
        try {
            if (typeof cssOpts.renameSpriteImagePath === 'undefined') {
                SpriteMaker.print_css(
                    'filename', cssOpts.targetCssPath
                );
            }
            else {
                SpriteMaker.print_css(
                    'filename', cssOpts.targetCssPath,
                    'sprite_filename', cssOpts.renameSpriteImagePath
                );
            }
        }
        catch (e) {
            grunt.log.error(e);
            return;
        }
    }

    // Print a success message.
    grunt.log.writeln('Css created in ' + targetImage);
  });

};
