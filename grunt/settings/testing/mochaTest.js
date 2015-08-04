var allTestFiles = ['test/**/*.js'];
var allCovTestFiles = ['coverage/test/**/*.js'];

module.exports = {
    test: {
        options: {
            reporter: 'spec',
            recursive: true
        },
        src: allTestFiles
    },
    coverageSpec: {
        options: {
            reporter: 'spec',
            recursive: true
        },
        src: allCovTestFiles
    },
    coverage: {
        options: {
            reporter: 'html-cov',
            recursive: true,
            quiet: true,
            captureFile: './artefacts/coverage.html'
        },
        src: allCovTestFiles
    },
    coverageCheck: {
        options: {
            reporter: 'travis-cov'
        },
        src: allCovTestFiles
    }
};
