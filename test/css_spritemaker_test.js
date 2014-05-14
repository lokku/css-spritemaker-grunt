'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.css_spritemaker = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  simple_sprite: function(test) {
    test.expect(1);

    test.ok(grunt.file.exists('tmp/sprite.png'), "sprite file was generated");

    test.done();
  },
  with_source_images: function (test) {
    test.expect(1);

    test.ok(grunt.file.exists('tmp/withSourceImages.png'), "sprite file was generated from pattern");

    test.done();
  },
  with_layout_name: function (test) {
    test.expect(1);

    test.ok(grunt.file.exists('tmp/withPackedLayout.png'), "sprite file with packed layout was generated");

    test.done();
  },
  with_extended_layout_definition: function (test) {
    test.expect(1);

    test.ok(grunt.file.exists('tmp/withExtendedLayoutDefinition.png'), "sprite file with packed layout was generated");

    test.done();
  },
  with_composite_layout : function (test) {
    test.expect(1);

    test.ok(grunt.file.exists('tmp/withCompositeLayout.png'), "sprite file with complex layouts was generated");

    test.done();
  },
  with_css_stylesheet: function (test) {
    test.expect(3);

    test.ok(grunt.file.exists('tmp/sprite.css'), "sprite css file was generated");
    var fileContent = grunt.file.read('tmp/sprite.css');
    test.ok(fileContent.length > 1, "sprite css file is not empty");
    test.ok(fileContent.indexOf('somewhere/over/the/rainbow.png') > -1, "sprite filename was replaced in the css");

    test.done();
  },
  with_prefix_stylesheet: function (test) {
    test.expect(2);

    test.ok(grunt.file.exists('tmp/spriteWithPrefix.css'), "sprite with prefix css file was generated");
    var fileContent = grunt.file.read('tmp/spriteWithPrefix.css'),
        bad = 0,
        splittedFileContent = fileContent.split(grunt.util.linefeed);

    splittedFileContent.unshift();
    splittedFileContent.forEach(function (e) {
        if (e.indexOf('.icon-') !== 0) {
            bad++;
        }
    });

    test.equal(bad, 0, "All classes have 'icon-' prefix");
    test.done();
  }
};
