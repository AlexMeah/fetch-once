var allTestFiles = ['test/**/*.js', 'lib/**/*.js'];

module.exports = {
    all: {
        options: {
            jshintrc: true,
            reporter: require('jshint-stylish')
        },
        src: allTestFiles
    }
};
