(function(){
    'use strict';

    var safeRedirectDdo = {
        controller   : 'safeRedirectController',
        controllerAs : 'safeRedirectCtrl',
        templateUrl  : './angular-app/safeRedirect/safeRedirect.partial.html',
        $inject      : ['$location', '$window', '$timeout', 'googleSafeBrowsingService'],
        bindings     : {}
    };

    function safeRedirectController($location, $window, $timeout, googleSafeBrowsingService) {
        var safeRedirectCtrl = this;
        safeRedirectCtrl.notSafe = false;
        safeRedirectCtrl.networkError = false;

        var destination = $location.search().destination;
        googleSafeBrowsingService.isSafeUrl(destination)
        .then(function success(response) {
            if (response.url == destination && response.isSafe === true) {
                // Delay the final redirection to allow the fast-reader end user a chance to read
                // the notification on the UI.
                $timeout(function() {
                    $window.open(destination, "_self");
                }, 300);
            } else if (response.url == destination && response.isSafe === false) {
                safeRedirectCtrl.notSafe = true;
            } else /* if (response.data.url != destination) */ {
            	// This should never happen.
            	safeRedirectCtrl.networkError = true;
            	console.log("Unexpected error happened: reply from googleSafeBrowsingService does not match the requested targetUrl.");
            }
        }, function failure(error) {
            safeRedirectCtrl.networkError = true;
        });

    }

    var safeRedirectModule = angular.module("safeRedirect");
    safeRedirectModule.component('safeRedirect', safeRedirectDdo);
    safeRedirectModule.controller('safeRedirectController', safeRedirectController);

})();