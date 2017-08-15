describe("googleSafeBrowsingClient", function() {

    var googleSafeBrowsingService = null;
    var $httpBackend = null;
    var API_KEY = "AIzaSyCTqD5_khGQyJeRmu6Utls8T6pyaRIzZgE";
    var googleSafeBrowsingApiUrl = "https://safebrowsing.googleapis.com/v4/threatMatches:find?key=" + API_KEY;

    function getGoogleSafeBrowsingRequestBody(targetUrl) {

        var googleSafeBrowsingRequestData = {
            client: {
                clientId      : "URLMinifier",
                clientVersion : "1.0"
            },
            threatInfo: {
                threatTypes      : ["MALWARE", "SOCIAL_ENGINEERING"],
                platformTypes    : ["ANY_PLATFORM"],
                threatEntryTypes : ["URL"],
                threatEntries    : [{url: targetUrl}]
            }
        };

        googleSafeBrowsingRequestData = JSON.stringify(googleSafeBrowsingRequestData);
        return googleSafeBrowsingRequestData;
    }

    beforeEach(function() {

        module('googleSafeBrowsingClient');
        inject(function($injector, _$httpBackend_) {
            googleSafeBrowsingService = $injector.get('googleSafeBrowsingService');
            $httpBackend = _$httpBackend_;
        });

    });

    it("reports a malicious URL as a malicious URL ...", function() {

        var maliciousURL = "http://malware.testing.google.test/testing/malware/";
        var googleSafeBrowsingRequestData = getGoogleSafeBrowsingRequestBody(maliciousURL);

        // For response structure, look @ https://developers.google.com/safe-browsing/v4/lookup-api
        $httpBackend.expectPOST(googleSafeBrowsingApiUrl, googleSafeBrowsingRequestData)
            .respond({matches:[{threat:{url:maliciousURL}}]});
        var retPromise = googleSafeBrowsingService.isSafeUrl(maliciousURL);
        retPromise.then(function(response) {
            expect(response.url).toBe(maliciousURL);
            expect(response.isSafe).toBe(false);
        });

        $httpBackend.flush();

    });

    it("reports a safe URL as a safe URL ...", function() {

        var safeURL = "http://www.cnn.com/";
        var googleSafeBrowsingRequestData = getGoogleSafeBrowsingRequestBody(safeURL);
        $httpBackend.expectPOST(googleSafeBrowsingApiUrl, googleSafeBrowsingRequestData).respond("{}");
        var retPromise = googleSafeBrowsingService.isSafeUrl(safeURL);
        retPromise.then(function(response) {
            expect(response.url).toBe(safeURL);
            expect(response.isSafe).toBe(true);
        });
 
        $httpBackend.flush();

    });

});

