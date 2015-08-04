module.exports = {
    dev: {
        NODE_ENV: 'dev'
    },
    coverage: {
        NODE_ENV: 'dev',
        PROJECT_ROOT: 'app-cov'
    },
    test: {
        NODE_ENV: 'dev',
        PROJECT_ROOT: 'app'
    },
    notTest: {
        NODE_ENV: ''
    }
};
