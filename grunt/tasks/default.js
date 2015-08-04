module.exports = function (grunt) {
    grunt.registerTask('default', ['jshint', 'jscs', 'clean:coverage', 'copy:coverage', 'blanket:coverage', 'env:coverage', 'mochaTest:coverageSpec', 'mochaTest:coverage', 'mochaTest:coverageCheck', 'clean:coverage']);
};
