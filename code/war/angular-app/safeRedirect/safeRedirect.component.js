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
            if (response.data.matches == undefined) {
                // Delay the final redirection to allow the fast-reader end user a chance to read
                // the notification on the UI.
                $timeout(function() {
                    $window.open(destination, "_self");
                }, 300);
            } else {
                safeRedirectCtrl.notSafe = true;
            }
        }, function failure(error) {
            safeRedirectCtrl.networkError = true;
        });

    }

    var safeRedirectModule = angular.module("safeRedirect");
    safeRedirectModule.component('safeRedirect', safeRedirectDdo);
    safeRedirectModule.controller('safeRedirectController', safeRedirectController);

})();