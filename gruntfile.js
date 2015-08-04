/*
 * Introduction
 * -----------
 *
 * This file sets up all our grunt task it is kinda awesome
 */

/*
 * Required node_modules
 * --------------------
 *
 * Extend
 */
var _ = require('lodash');

/*
 * Grunt Loader
 */
function loadConfig(path) {

    var glob = require('glob');
    var object = {};
    var key;

    glob.sync('**/*.js', {
        cwd: path
    }).forEach(function (option) {
        key = option.replace(/.*\/(\w+)/g, '$1').replace(/\.js$/, '');

        if (!object[key]) {
            object[key] = require(path + option);
        } else {
            object[key] = _.extend(object[key], require(path + option));
        }
    });

    return object;
}

module.exports = function (grunt) {
    'use strict';

    /*
     * This times our tasks so we can spot and optimize any bottlenecks
     */
    require('time-grunt')(grunt);

    /*
     * Load all the things but only as they are needed
     */
    require('jit-grunt')(grunt, {
        sprite: 'grunt-spritesmith',
        useminPrepare: 'grunt-usemin',
        jscs: 'grunt-jscs-checker',
        'validate-package': 'grunt-nsp-package',
        coverage: 'grunt-istanbul-coverage'
    });

    /*
     * Settings
     * -----------
     *
     * These are variables that can be used through out this file, they enable us to quickly change our directory structure
     */
    var filesToSkip = [
        '!<%= moonstick.app %>/<%= moonstick.assets %>/scripts/{templates,thirdparty}/**/*.js',
        '!{app-cov,dist}/**/*',
        '!newrelic.js'
    ];
    var allCustomFrontEndJavascript = [
        '<%= moonstick.app %>/<%= moonstick.assets %>/scripts/**/*.js',
        '<%= moonstick.app %>/components/**/scripts/*.js',
        '!<%= moonstick.app %>/components/**/test/server/*.js'
    ].concat(filesToSkip);
    var allCustomServerJavascript = [
        '<%= moonstick.app %>/**/*.js',
        '<%= moonstick.app %>/components/**/test/server/*.js',
        'grunt/**/*.js',
        '!<%= moonstick.app %>/components/**/scripts/*.js',
        '!<%= moonstick.app %>/assets/**/*.js'
    ].concat(filesToSkip);

    var allCustomJavascript = allCustomServerJavascript.slice(0);
    allCustomJavascript.push(allCustomFrontEndJavascript);

    var allButGruntfiles = allCustomServerJavascript.slice();
    allButGruntfiles.push('!grunt/**/*', 'grunt/index.js');

    var config = {
        moonstick: {
            app: 'app',
            dist: 'dist',
            assets: 'assets',
            allButGruntfiles: allButGruntfiles,
            allCustomJavascript: allCustomJavascript,
            allCustomServerJavascript: allCustomServerJavascript,
            version: grunt.option('artefact-tag') || 'dev-build',
            allCustomFrontEndJavascript: allCustomFrontEndJavascript
        },
        pkg: grunt.file.readJSON('./package.json'),
        artefactPullLocation: grunt.option('artefacts-directory') || '../moonstick-artefacts',
        artefactGitUrl: grunt.option('artefacts-git-url') || 'git@git.laterooms.com:moonstick/moonstick-artefacts.git',
        artefactTag: grunt.option('artefact-tag') || 'dev-build',
        commitHash: process.env.CIRCLE_SHA1 || 'test',
        accessKeyId: grunt.option('access-key-id') || process.env.accessKeyId,
        secretAccessKey: grunt.option('secret-access-key') || process.env.secretAccessKey,
        goAuthUser: grunt.option('go-auth-user') || process.env.goAuthUser,
        goAuthPassword: grunt.option('go-auth-password') || process.env.goAuthPassword,
        developPipeline: grunt.option('develop-pipeline') || process.env.developPipeline,
        masterPipeline: grunt.option('master-pipeline') || process.env.masterPipeline
    };

    config = _.extend(config, loadConfig('./grunt/settings/'));

    grunt.initConfig(config);
    grunt.loadTasks('./grunt/tasks');
};
