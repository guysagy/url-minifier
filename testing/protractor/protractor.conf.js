// protractor.conf.js

exports.config = {
  framework: 'jasmine',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['minifier.test.spec.js'],
  multiCapabilities: [
      //{
      //  browserName: 'firefox'
      //}
      //,
      {
        browserName: 'chrome'
      }
  ],
  jasmineNodeOpts: {
    showColors: true, // Use colors in the command line report.
    defaultTimeoutInterval: 10000
  }
};