exports.config = {
    useAllAngular2AppRoots: true,
    getPageTimeout: 30000,
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['src/tests/**/EE/*.spec.js'],
    jasmineNodeOpts: {
        defaultTimeoutInterval: 60000
    },

    capabilities: {
          'browserName': 'chrome',
        //   'browserName': 'phantomjs',
        //   'maxInstances': 2,
        //   'shardTestFiles': true
        //   'phantomjs.binary.path': require('phantomjs-prebuilt').path,
        //   'phantomjs.cli.args': ['--webdriver-loglevel=ERROR', '--local-storage-path=/tmp/phantom_' + Math.random()]

    }
};

