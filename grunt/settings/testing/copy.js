module.exports = {
    coverage: {
        files: [{
            expand: true,
            dot: true,
            cwd: './',
            dest: 'coverage',
            src: ['test/**','lib/**/*.json']
        }]
    }
};
