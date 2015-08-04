var allTestFiles = ['test/**/*.js', 'lib/**/*.js'];

module.exports = {
    server: {
        options: {
            config: '.jscs.json'
        },
        src: allTestFiles
    }
};
