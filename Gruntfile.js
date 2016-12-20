var webui_static = [ 'index.html', 'images/**'];

var externalModules = [
  'jquery',
  'leaflet',
  'leaflet-bing-layer',
  'leaflet.markercluster',
  'backbone',
  'underscore',
  'bootstrap',
  'couchmap-common',
  'libremap-common'
];


module.exports = function(grunt) {
  // read couch.json if it exists
  var couchconfig = grunt.file.exists('couch.json') ?
        grunt.file.readJSON('couch.json') : null;
  var couchpushopts = null;
  if (couchconfig) {
    var couch = grunt.option('couch') || 'localhost';
    if (couch) {
      couchpushopts = {
        options: {
          user: couchconfig.couches[couch].user,
          pass: couchconfig.couches[couch].pass
        }
      };
      couchpushopts[couch] = {};
      var files = {};
      files[couchconfig.couches[couch].database] = 'tmp/libremap-webui.json';
      couchpushopts[couch] = { files: files};
    }
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // lint js files
    jshint: {
      files: ['Gruntfile.js', 'src/js/**/*.js']
    },
    connect: {
      webui: {
        options: {
          port: 9000,
          hostname: '*',
          base: 'build',
          livereload: 31337
        }
      }
    },
    // minify js files
    uglify: {
      libremap: {
          options: {
            sourceMap: true,
            mangle: true,
            banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
       '<%= grunt.template.today("yyyy-mm-dd") %> */'
          },
         files: {
           'build/js/libremap.min.js': ['build/js/libremap.js']
         }
       },
       vendor: {
           options: {
             sourceMap: false,
           },
          files: {
            'build/vendor/vendor.min.js': ['build/vendor/vendor.js']
          }
        }
    },
    // copy static files
    copy: {
      build: {
        files: [
          {
            expand: true,
            cwd: 'src',
            src: webui_static,
            dest: 'build/'
          },
          {
            expand: true,
            cwd: 'node_modules/bootstrap/dist',
            src: 'fonts/*',
            dest: 'build/'
          },
          {
            expand: true,
            cwd: 'node_modules/font-awesome',
            src: 'fonts/*',
            dest: 'build/'
          },
          {
            expand: true,
            cwd: 'node_modules/leaflet/dist/images',
            src: '**/*',
            dest: 'build/images/vendor/leaflet'
          }
        ]
      },
      'build-ddoc': {
        files: [
          {
            expand: true,
            cwd: 'template_ddoc',
            src: '**/*',
            dest: 'build-ddoc/'
          },
          {
            expand: true,
            cwd: 'build',
            src: '**/*',
            dest: 'build-ddoc/_attachments/'
          }
        ]
      }
    },
    less: {
      libremap: {
        files: {
          'build/css/libremap.css': 'src/less/libremap.less'
        }
      }
    },
    concat: {
      // concat vendor css files
      vendorcss: {
        files: {
          'build-css/vendor.less': [
            'node_modules/leaflet/dist/leaflet.css',
            'node_modules/leaflet.markercluster/dist/MarkerCluster.css',
            'node_modules/leaflet.markercluster/dist/MarkerCluster.Default.css',
            'node_modules/couchmap-leaflet/css/couchmap-leaflet.css'
          ]
        }
      }
    },

    'browserify-jst': {
      compile: {
        options: {
            processName: function(filepath) {
                return filepath.replace(/src\/templates\/(.*)\.html/, '$1');
            }
        },
        src : 'src/templates/**/*.html',
        dest : 'build-jst/templates.js'
      }
    },
    browserify: {
      vendors: {
        src: ['.'],
        dest: 'build/vendor/vendor.js',
        options: {
          debug: true,
          alias: externalModules.map(function(module) {
            return module + ':';
          }),
          external: null
        }
      },
      // browserify libremap.js -> bundle.js
      libremap: {
        dest: 'build/js/libremap.js',
        src: [ 'src/js/libremap.js' ],
        options: {
          debug: true,
          transform: ['uglifyify'],
          external: externalModules,
          alias: {
            'templates': './build-jst/templates.js'
          },
        }
      }
    },
    watch: {
      options: {
        livereload: 31337
      },
      webui_config: {
        files: ['config.json'],
        tasks: ['build']
      },
      webui_static: {
        files: webui_static,
        tasks: ['copy'],
        options: {
          cwd: 'src'
        }
      },
      webui_jst: {
        files: ['src/templates/**/*.html'],
        tasks: ['browserify-jst', 'browserify:libremap']
      },
      webui_js: {
        files: ['src/**/*.js'],
        tasks: ['browserify:libremap']
      },
      webui_less: {
        files: ['src/**/*.less', 'src/**/*.css'],
        tasks: ['less']
      }
    },
    'couch-compile': {
      'libremap-webui': {
        files: {
          'tmp/libremap-webui.json': 'build-ddoc'
        }
      }
    },
    'couch-push': couchpushopts
  });
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browserify-jst');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-couch');

  grunt.registerTask('build-plugins', function() {
    var config = grunt.file.readJSON('config.json');
    var _ = require('underscore');
    var js = 'module.exports = {\n';
    if (config.plugins) {
      _.each(config.plugins, function(val, key) {
        js += '  "'+key+'": require("'+val+'"),\n';
      });
    }
    js += '};';
    grunt.file.write('src/js/plugins.js', js);
  });

  grunt.registerTask('build', ['build-plugins', 'jshint', 'copy:build', 'concat', 'less', 'browserify-jst', 'browserify', 'uglify']);
  grunt.registerTask('push', ['build', 'copy:build-ddoc', 'couch']);

  // Default task(s).
  grunt.registerTask('default', ['build', 'connect', 'watch']);
};
