describe("Testing module googleSafeBrowsingClient", function() {

    // Work in progress, tests do not yet work !!!

    var googleSafeBrowsingService = null;

    beforeEach(function() {
        module('googleSafeBrowsingClient');
        inject(function($injector) {
            googleSafeBrowsingService = $injector.get('googleSafeBrowsingService');
        });

    });

    it("malicious URL is flagged", function() {
        var maliciousURL = "http://malware.testing.google.test/testing/malware/";
        var promiseResult = googleSafeBrowsingService.isSafeUrl(maliciousURL);
    });

    it("safe URL is cleared", function() {
        var safeURL = "http://www.cnn.com/";
        var promiseResult = googleSafeBrowsingService.isSafeUrl(safeURL);
    });

});

