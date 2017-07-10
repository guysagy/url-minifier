(function() {
    'use strict';

    // Google Safe Browsing tool web page:
    // https://developers.google.com/safe-browsing/
    // Sample site that will be flagged as unsafe :
    // http://malware.testing.google.test/testing/malware/

    var googleSafeBrowsingClient = angular.module('googleSafeBrowsingClient');
    googleSafeBrowsingClient.service('googleSafeBrowsingService', googleSafeBrowsingService);

    function googleSafeBrowsingService($http) {

        var thisService = this;

        thisService.isSafeUrl = function(targetUrl) {

            var API_KEY = "AIzaSyCTqD5_khGQyJeRmu6Utls8T6pyaRIzZgE";
            var googleSafeBrowsingApiUrl = "https://safebrowsing.googleapis.com/v4/threatMatches:find?key=" + API_KEY;

            var requestBody = {
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

            var data = JSON.stringify(requestBody);

            /* https://developers.google.com/safe-browsing/v4/lookup-api :
             * If there are no matches (that is, if none of the URLs specified in the request are found on any of the lists specified in a request), 
             * the HTTP POST response simply returns an empty object in the response body.
             */
            return $http.post(googleSafeBrowsingApiUrl, data).then(function success(response){
            	 var isSafe = (response.data.matches === undefined) ? true : false ;
          		 var url = (isSafe === true) ? targetUrl : response.data.matches[0].threat.url;
            	 return {url: url, isSafe: isSafe};
            });
        };

    }
    googleSafeBrowsingService.$inject = ['$http'];
})();