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
            
            var requestBody =  {
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
            
            return $http.post(googleSafeBrowsingApiUrl, data);
        };
        
    }
    googleSafeBrowsingService.$inject = ['$http'];
})();