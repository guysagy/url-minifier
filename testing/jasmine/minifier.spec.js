describe("googleSafeBrowsingClient", function() {

    var googleSafeBrowsingService = null;
    var $httpBackend = null;
    var API_KEY = "AIzaSyCTqD5_khGQyJeRmu6Utls8T6pyaRIzZgE";
    var googleSafeBrowsingApiUrl = "https://safebrowsing.googleapis.com/v4/threatMatches:find?key=" + API_KEY;

    beforeEach(function() {

        module('googleSafeBrowsingClient');
        inject(function($injector, _$httpBackend_) {
            googleSafeBrowsingService = $injector.get('googleSafeBrowsingService');
            $httpBackend = _$httpBackend_;
        });

    });

    /*
       Tests pass, but to be even better meaningfull testing conceptually, 
       the logic of dechipring google's service response needs
       to move into googleSafeBrowsingService.isSafeUrl(...) which should return true/false only. 
       To be done shortly ....
    */
    it("reports a malicious URL as a malicious URL ...", function() {

        var maliciousURL = "http://malware.testing.google.test/testing/malware/";
        var requestBody = {
            client: {
                clientId      : "URLMinifier",
                clientVersion : "1.0"
            },
            threatInfo: {
                threatTypes      : ["MALWARE", "SOCIAL_ENGINEERING"],
                platformTypes    : ["ANY_PLATFORM"],
                threatEntryTypes : ["URL"],
                threatEntries    : [{url: maliciousURL}]
            }
        };
        var data = JSON.stringify(requestBody);

        $httpBackend.expectPOST(googleSafeBrowsingApiUrl , data).respond({matches:maliciousURL});
        var retPromise = googleSafeBrowsingService.isSafeUrl(maliciousURL);
        retPromise.then(function(response) {
            expect(response.data.matches).toBe(maliciousURL);
        });
        $httpBackend.flush();

    });

    it("reports a safe URL as a safe URL ...", function() {

        var safeURL = "http://www.cnn.com/";
        var requestBody = {
            client: {
                clientId      : "URLMinifier",
                clientVersion : "1.0"
            },
            threatInfo: {
                threatTypes      : ["MALWARE", "SOCIAL_ENGINEERING"],
                platformTypes    : ["ANY_PLATFORM"],
                threatEntryTypes : ["URL"],
                threatEntries    : [{url: safeURL}]
            }
        };
        var data = JSON.stringify(requestBody);

        $httpBackend.expectPOST(googleSafeBrowsingApiUrl , data).respond({});
        var retPromise = googleSafeBrowsingService.isSafeUrl(safeURL);
        retPromise.then(function(response) {
            expect(response.data.matches).toBeUndefined();
        });
        $httpBackend.flush();

    });

});

