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
            removeSourcePadding : 'remove_source_padding',
            sourceDir : 'source_dir'
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
        generateCss: undefined,
        generateImage: undefined
    });

    var data = this.data;
    var parts;
    var part;

    //
    // some options re-mapping going on here
    //

    var layoutName;
    var layout;
    if (typeof options.generateImage === 'object') {
        var oGi = options.generateImage;
        if (oGi.hasOwnProperty('layoutName')) { layoutName = oGi.layoutName; }
        if (oGi.hasOwnProperty('layout'))     { layout = oGi.layout;         }
    }


    var src = this.filesSrc;

    var destsUnique = [];
    var totalDestCount = 0;
    var dest;

    this.files.sort().forEach(function (e) {
        if (typeof e.dest !== 'undefined') {
            // count original destinations
            totalDestCount++;

            if (destsUnique[destsUnique.length - 1 ] !== e.dest) {
                // keep unique destinations
                destsUnique.push(e.dest);
            }
        }
    });

    if (destsUnique.length === 1) {
        dest = destsUnique[0];
    }
    else if (destsUnique.length > 1) {
        grunt.log.error('Found multiple destinations. Only a single "dest" must be specified!');
        grunt.log.error('Have found the following dests: ' + grunt.util.linefeed + destsUnique.join(grunt.util.linefeed));
        return;
    }

    //
    // if multiple same destinations were specified, then it means we are
    // dealing with a composite sprite.
    //
    if (totalDestCount > 1) {
        parts = [];

        this.files.forEach(function (f) {
            part = {};
            for (var key in f) {
                if (f.hasOwnProperty(key) && key !== 'src' && key !== 'dest' && key !== 'orig') {
                    part[key] = f[key];
                }
            }
            // also add src
            part.sourceImages = f.src;

            parts.push(part);
        });

        // re-map parts
        parts = remapObjectKeysDeep(parts);
    }

    //
    // -- done dealing with options remapping
    //

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
    // find out if user just wants to generate a fake css
    //
    var withFakeCss = false;
    if (typeof options.generateCss !== 'undefined') {
        if (options.generateCss.hasOwnProperty('fakeCss') && options.generateCss.fakeCss === true) {
            withFakeCss = true;
        }
    }

    //
    // We need to skip image sprite generation and generate just the fake css
    // instead!
    //
    if (withFakeCss) {
        // just perform a bunch of checks and warn about whatever will be ignored.
        if (typeof parts !== 'undefined') {
           grunt.log.error("WARNING: The parts parameter is ignored when generating a fake css");
        }
        if (typeof layout !== 'undefined') {
           grunt.log.error("WARNING: The layout parameter is ignored when generating a fake css");
        }
        if (typeof layoutName !== 'undefined') {
           grunt.log.error("WARNING: The layoutName parameter is ignored when generating a fake css");
        }
        if (typeof dest !== 'undefined') {
           grunt.log.error("WARNING: The dest parameter is ignored when generating a fake css");
        }
    }
    else {
        //
        // make sure target image is specified and deal with directory
        // creation.
        //
        if (typeof dest === 'undefined') {
            grunt.log.error("the dest parameter must be specified. E.g., path/to/image.png");
            return;
        }

        if (options.createTargetPaths) {
            grunt.file.write(dest, '');
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
                    'target_file', dest,
                    'parts', parts,
                    'layout', layout
                );

                grunt.log.writeln('Image Sprite created in ' + dest);
            }
            else {
                if (typeof layout !== 'undefined') {
                    SpriteMaker.make_sprite(
                        'source_images', src,
                        'target_file', dest,
                        'layout', layout
                    );
                }
                else if (typeof layoutName !== 'undefined') {
                    SpriteMaker.make_sprite(
                        'source_images', src,
                        'target_file', dest,
                        'layout_name', layoutName
                    );
                }
                else {
                    SpriteMaker.make_sprite(
                        'source_images', src,
                        'target_file', dest
                    );
                }

                grunt.log.writeln('Image Sprite created in ' + dest);
            }
        }
        catch (e) {
            grunt.log.error(e);
            return;
        }
    }

    //
    // Write CSS
    //
    if (typeof options.generateCss !== 'undefined') {
        var cssOpts = options.generateCss;

        if (withFakeCss) {

            try {
                if (!cssOpts.hasOwnProperty('targetCssPath')) {
                    grunt.log.error("you need to specify targetCssPath option otherwise I don't know where to create the fake css.");
                    return;
                }

                if (options.createTargetPaths) {
                    grunt.file.write(cssOpts.targetCssPath, '');
                }

                if (typeof src !== 'undefined') {

                    SpriteMaker.print_fake_css(
                        'filename', cssOpts.targetCssPath,
                        'source_images', src
                    );
                }
                else {
                    throw "please specify src with fakeCss = true!";
                }

                grunt.log.writeln('CSS Sprite sheet created in ' + 
                    cssOpts.targetCssPath);
            }
            catch (e) {
                grunt.log.error(e);
                return;
            }
        }
        else {
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

                grunt.log.writeln('CSS Sprite sheet created in ' + 
                    cssOpts.targetCssPath);
            }
            catch (e) {
                grunt.log.error(e);
                return;
            }
        }
        // Print a success message.
    }
  });

};
