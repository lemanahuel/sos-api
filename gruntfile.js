'use strict';

const defaultAssets = ['gruntfile.js', 'server/*.js', 'server/**/*.js'];

module.exports = function (grunt) {
  grunt.initConfig({
    nodemon: {
      dev: {
        script: 'server/server.js',
        options: {
          ext: 'js',
          watch: defaultAssets,
          ignore: ['node_modules/*', '.idea/*', '.bower-tmp/*', '.bower-registry/*', '.bower-cache/*'],
          delay: 1000,
          env: {
            NODE_ENV: 'development',
            CLOUDINARY_URL: 'cloudinary://426493212437358:MPavPr4AZ36m9dZWkxXMumNfJgg@hdqt6satc'
          }
        }
      }
    },

    concurrent: {
      options: {
        logConcurrentOutput: true,
        limit: 2
      },
      default: ['nodemon:dev']
    },

    esformatter: {
      src: defaultAssets
    },

    jshint: {
      all: {
        src: defaultAssets,
        options: {
          jshintrc: true,
          reporter: require('jshint-stylish')
        }
      }
    },

    eslint: {
      options: {
        force: false,
        quiet: true,
        configFile: '.eslintrc',
        globals: [
          'Mercadopago',
          'require',
          'module',
          'exports',
          'process',
          '__dirname',
          'console'
        ]
      },
      src: defaultAssets
    },

    sloc: {
      all: {
        files: {
          'server': [
            '**/*.html',
            '**/*.css',
            '**/*.less',
            '**/*.scss',
            '**/*.js'
          ]
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('lint', [
    'jshint',
    'eslint'
  ]);

  grunt.registerTask('build-qa', ['lint']);

  grunt.registerTask('build-prod', ['lint']);

  grunt.registerTask('default', ['concurrent']);

  grunt.registerTask('heroku:development', 'build-qa');
  grunt.registerTask('heroku:qa', 'build-qa');
  grunt.registerTask('heroku:production', process.env.ENV_QA ? 'build-qa' : 'build-prod');
};
