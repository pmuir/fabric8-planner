exports.config = {
    useAllAngular2AppRoots: true,
    getPageTimeout: 30000,
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['src/tests/**/*.spec.js'],
    exclude: ['src/tests/**/EXCLUDED/*.spec.js','src/tests/**/EE/*.spec.js', 'src/tests/**/TBD/*.spec.js'],
    suites: {
    smokeTest: 'src/tests/**/smokeTest.spec.js'
    },
    jasmineNodeOpts: {
        defaultTimeoutInterval: 60000
    },
    capabilities: {
      'browserName': 'chrome',
      'chromeOptions': {
        'args': [ '--no-sandbox']
      }
    }
};
