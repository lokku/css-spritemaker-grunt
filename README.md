# grunt-css-spritemaker

> Combine multiple images into CSS Sprites using advanced layouts from CSS::SpriteMaker Perl module.

## Getting Started

The requirements of this plugin are:

- Grunt `~0.4.4`

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

If true, the path to targetImage will be created

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

    generateCss: {
        // required
        targetCssPath : "tmp/sprite.css",
        // optional
        renameSpriteImagePath : "somewhere/over/the/rainbow.png"
        // optional
        cssClassPrefix: "icon-"
    }
    

### Usage Examples

#### Generate a sprite from a directory containing images 

In this example, the default options are used to generate the sprite image. All the images in sourceDir will be combined into a single image into tmp/sprite.png.

```js
grunt.initConfig({
  css_spritemaker: {
    options : {
        createTargetPaths: true,
    },
    sourceDir: 'test/fixtures/nsti',
    targetImage: 'tmp/sprite.png',
  },
});
```

#### You can specify individual images and directories too!

In this example, sourceImages is an array of files and directories.

```js
grunt.initConfig({
  css_spritemaker: {
    options : {
        createTargetPaths: false,
    },
    sourceImages: [
        'images/bullet-orange.png', 
        'images/iconsdir/'
    ],
    targetImage: 'tmp/withSourceImages.png',
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
    },
    sourceDir: 'test/fixtures/nsti',
    targetImage: 'tmp/withPackedLayout.png',
    layoutName: 'Packed'
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
});
```

You can consult CSS::SpriteMaker documentation to know about the options for the various layouts. For example, you can get the documentation of the FixedDimention layout by running `perldoc CSS::SpriteMaker::Layout::FixedDimension`.

#### Create sprite image using layouts of layouts

In this example, the resulting sprite image (tmp/withCompositeLayout.png) is made up of two parts, which are in turn layouted through a 'glue' layout.

```js
grunt.initConfig({
  css_spritemaker: {
    options : {
        createTargetPaths: true,
        generateCss: {
            // required
            targetCssPath : "tmp/sprite.css",
        }
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
          // optional
          includeInCss : false,
          // optional
          removeSourcePadding : true
        }
    ],
    // glue the parts together with this layout:
    layout: {
        'name' : 'FixedDimension',
        'options' : {
            n : '2'
        }
    }
  },
});
```

As you can see each part can be independently specified. Two options can be specified for each part:

- includeInCss: if set to false, the resulting `sprite.css` stylesheet will not include the images from the layout part in which the option is specified;

- removeSourcePadding: if set to false, will leave the padding found in source images untouched. Otherwise each image in the part will have the surrounding padding (transparent color) removed.

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
      sourceDir: 'test/fixtures/nsti'

      // NOTE: in fake css mode, no image or layout related parameter must be specified!
  },
});
```
IMPORTANT NOTE: turning fakeCss on will not generate any sprite image, and ignore any options related to image sprite generation. grunt-css-spritemaker will warn about this.


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

* 0.1.0 -  Wed May 14 01:58:44 CEST 2014

    - First release

* 0.1.1 -  Wed May 14 11:30:28 CEST 2014

    - Update dependencies

* 0.1.2 -  Thu May 15 00:01:24 CEST 2014

    - added fakeCss option to generate fake CSS spritesheets (requires CSS::SpriteMaker 0.10+)
