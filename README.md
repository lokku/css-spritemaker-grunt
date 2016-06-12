# grunt-css-spritemaker

> Combine multiple images into CSS Sprites using advanced layouts from CSS::SpriteMaker Perl module.

## Getting Started

The requirements of this plugin are:

- Grunt `>=0.4.0`

- Perl 5 installed and compiled with -fPIC and -Duseshrplib. Normally, linux distribution's system perl works.

- CSS::SpriteMaker module `0.10+` installed from CPAN (`cpan install CSS::SpriteMaker`). You should be able to run `perldoc CSS::SpriteMaker`.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-css-spritemaker --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-css-spritemaker');
```

## The "css_spritemaker" task

### Overview
In your project's Gruntfile, add a section named `css_spritemaker` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  css_spritemaker: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      options: {
          // Target-specific options go here.
      },
      // Target-specific settings follow here ...
    }
  }
});
```

### Options

#### options.createTargetPaths
Type: `Boolean`
Default value: `false`

If true, the path to dest will be created

#### options.generateCss
Type: `Object`
Default value: `undefined`

An object used for CSS (or LESS) spritesheet file. **If** specified, a .css/.less
spritesheet will be also generated, therefore the targetCssPath attribute is
required.

Other options for `generateCss` are:

- `renameSpriteImagePath`: an alternative name that points to the image sprite.  This can be useful if the spritesheet is to be moved elsewhere with other tasks that stem from grunt-css-spritemaker.

- `cssClassPrefix`: a prefix to be added to each css class name


In summary, this is the kind of object expected:

```js
generateCss: {
    // required
    targetCssPath : "tmp/sprite.css",
    // optional
    renameSpriteImagePath : "somewhere/over/the/rainbow.png"
    // optional
    cssClassPrefix: "icon-"
}
```

### options.generateImage
Type: `Object`
Default value: `undefined`

Used to specify options related to image generation. At the moment you can specify layouts in this section. For example this is a structure like:
    
```js
generateImage: {
    layout: {
        'name' : 'FixedDimension',
        'options' : {
            n : '2'   // see CSS::SpriteMaker Docs!
        }
    }
}
```

### Usage Examples

#### Generate a sprite from a directory containing images 

In this example, the default options are used to generate the sprite image. All the images in src will be combined into a single image into tmp/sprite.png.

```js
grunt.initConfig({
  css_spritemaker: {
    options : {
        createTargetPaths: true,
    },
    src: 'test/fixtures/nsti/',
    dest: 'tmp/sprite.png'
  },
});
```

#### You can specify individual images and directories too!

In this example, src is an array of files and directories.

```js
grunt.initConfig({
  css_spritemaker: {
    options : {
        createTargetPaths: false,
    },
    src: [
        'images/bullet-orange.png', 
        'images/iconsdir/'              // a directory, ends with '/'
    ],
    dest: 'tmp/withSourceImages.png',
  },
});
```
#### Use specific layouts

In this example, a Packed layout is used to compose the images.

```js
grunt.initConfig({
  css_spritemaker: {
    options : {
        createTargetPaths: false,
        generateImage: {
            layoutName: 'Packed'
        }
    },
    src: 'test/fixtures/nsti',
    dest: 'tmp/withPackedLayout.png'
  },
});
```
The layouts available depend on the version of CSS::SpriteMaker you have currently installed.  You can have a look at [http://search.cpan.org/~darksmo/CSS-SpriteMaker/](http://search.cpan.org/~darksmo/CSS-SpriteMaker/) for a list of available layouts. At the moment, the following layouts are available:

- `DirectoryBased`

- `FixedDimension`

- `Packed`

#### Specify names and options of layouts

Some layouts have options. To specify options you need to use the following 'extended' form, using the `layout` key instead of `layoutName`:

```js
grunt.initConfig({
  css_spritemaker: {
    options : {
        createTargetPaths: true,
        generateImage: {
            layout: {
                'name' : 'FixedDimension',
                'options' : {
                    n : '2'   // see CSS::SpriteMaker Docs!
                }
            }
        }
    },
    src: 'test/fixtures/nsti/',
    dest: 'tmp/withExtendedLayoutDefinition.png'
  },
});
```

You can consult CSS::SpriteMaker documentation to know about the options for the various layouts. For example, you can get the documentation of the FixedDimention layout by running `perldoc CSS::SpriteMaker::Layout::FixedDimension`.

#### Create sprite image using layouts of layouts

In this example, the resulting sprite image (tmp/withCompositeLayout.png) is made up of two parts, which are in turn lay out through a 'glue' layout.

Note the dest argument is the same across the various parts of the sprite.

```js
grunt.initConfig({
  css_spritemaker: {
    options : {
        createTargetPaths: true,
        generateCss: {
            // required
            targetCssPath : "tmp/sprite.css",
        },
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
        //
        // Parts of this sprite follow
        //
        { src: [
            'test/fixtures/nsti/homepage-bullet-orange.png', 
            'test/fixtures/nsti/cancel-feature.png'
          ],
          dest: 'tmp/withCompositeLayout.png', // NOTE: is the same in the next file definition
          options: {
              layoutName: 'Packed'             // compact layout spec
          }
        },
        { src: ['test/fixtures/nsti'],
          dest: 'tmp/withCompositeLayout.png', // See NOTE above
          //
          // options specific to one part follow
          //
          options: {
              // 'extended' layout spec
              layout : {
                  'name' : 'DirectoryBased'
              },
              includeInCss : 0,
              removeSourcePadding : 1, // first remove padding from source images
              addExtraPadding: 5       // then add extra 5px padding
          }
        }
    ]
  },
});
```

As you can see each part can be independently specified. Two options can be specified for each part:

- includeInCss: if set to false, the resulting `sprite.css` stylesheet will not include the images from the layout part in which the option is specified;

- removeSourcePadding: if set to false, won't touch the padding in source images. Otherwise each image in the part will have the surrounding padding (transparent color) removed.

- addExtraPadding: amount of pixel of padding to add to each image. 

#### Fake CSS

Sometimes you don't want to wait for the layout to be computed and just need a css without the sprite image. This css will be including images using a url attribute. Rules will look like:

    .icon-zoom- { url('test/fixtures/nsti/zoom--.png'); width: 32px; height: 32px; }

To generate a fake css just specify `fakeCss = true` among the options:

```js
grunt.initConfig({
  css_spritemaker: {
      options : {
          generateCss: {
              fakeCss: true, // activate fake css mode
              targetCssPath : "tmp/fakeCss.css", // required
              cssClassPrefix: 'icon-'            // optional
          }
      },
      // where to find the source images (also sourceImages is fine here)
      src: 'test/fixtures/nsti/'

      // NOTE: in fake css mode, no image or layout related parameter must be specified!
  },
});
```
IMPORTANT NOTE: turning fakeCss on will not generate any sprite image, and ignore any options related to image sprite generation. grunt-css-spritemaker will warn about this.


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

* 0.2.2 - Sun Jun 12 11:11:31 CEST 2016
    - update peerDependencies to be compatible with grunt 1.0

* 0.2.1 - Fri May 30 12:06:49 CEST 2014

    - allow addExtraPadding option introduced in CSS::SpriteMaker v0.14

* 0.2.0 -  Mon May 19 11:17:57 CEST 2014

    - IMPORTANT: change of interface. Now css_spritemaker complies with grunt standard interface.

* 0.1.0 -  Wed May 14 01:58:44 CEST 2014

    - First release

* 0.1.1 -  Wed May 14 11:30:28 CEST 2014

    - Update dependencies

* 0.1.2 -  Thu May 15 00:01:24 CEST 2014

    - added fakeCss option to generate fake CSS spritesheets (requires CSS::SpriteMaker 0.10+)
