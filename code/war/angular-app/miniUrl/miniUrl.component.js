(function(){
    'use strict';

    var miniUrlDdo = {
        controller   : 'miniUrlController',
        controllerAs : 'miniUrlCtrl',
        templateUrl  : './angular-app/miniUrl/miniUrl.partial.html',
        $inject      : ['$q', 'miniUrlService', 'googleSafeBrowsingService'],
        bindings     : {}
    };

    function miniUrlController($q, miniUrlService, googleSafeBrowsingService) {
        var miniUrlCtrl = this;
        miniUrlCtrl.minifiedUrlsInSession = {};
        miniUrlCtrl.minifiedUrl = "";
        miniUrlCtrl.miniUrlLink = "";
        miniUrlCtrl.errorString = "";
        miniUrlCtrl.dataLoading = false; 

        miniUrlCtrl.getMiniUrlLink = function() {
            return "<a href=\"" + miniUrlCtrl.minifiedUrl + "?client=minifyApp" 
                    + "\" target=\"_blank\" title=\"Click to visit your long URL\"><span class=\"minifiedUrlSpan\">" 
                    + miniUrlCtrl.minifiedUrl + "</span></a>";
        };

        miniUrlCtrl.minifyLongUrl = function() {

            miniUrlCtrl.minifiedUrl = miniUrlCtrl.minifiedUrlsInSession[miniUrlCtrl.longUrl];
            if (miniUrlCtrl.minifiedUrl != undefined) {
                miniUrlCtrl.miniUrlLink = miniUrlCtrl.getMiniUrlLink();
                miniUrlCtrl.errorString = "";
                miniUrlCtrl.dataLoading = false;
                miniUrlCtrl.dataForm.$setPristine();
                miniUrlCtrl.dataForm.$setUntouched();
                return;
            }

            miniUrlCtrl.minifiedUrl = "";
            miniUrlCtrl.miniUrlLink = "";
            miniUrlCtrl.errorString = "";
            miniUrlCtrl.dataLoading = true;

            // Technically, $q service may handle the two operations in parallel, but we need them to be performed sequentially
            // (otherwise, the URLs will be handled by the backend even if it turns out that it is not safe).
            $q.all([googleSafeBrowsingService.isSafeUrl(miniUrlCtrl.longUrl)])
            .then( function success(allResponses) {

                var safeResult = allResponses[0];
                if (safeResult.isSafe === false) {

                    miniUrlCtrl.errorString = "Ouch. Your url is flagged by our systems as an online threat and therefore cannot be minified.";
                    miniUrlCtrl.miniUrlLink = "";
                    miniUrlCtrl.dataLoading = false;

                } else {

                    $q.all([miniUrlService.minifyUrl(miniUrlCtrl.longUrl)])
                    .then( function success(allResponses) {
                        var minifyResult = allResponses[0].data;
                        if (minifyResult.longUrl != miniUrlCtrl.longUrl) {
                            miniUrlCtrl.errorString = "Ouch. A server or network error has occured. Please try again.";
                        }
                        else {
                            // It is the service promise that response data will include always include 'errorString' and 'miniUrl',
                            // and at all times only one will be non-zero length.
                            var showMiniUrl = (typeof minifyResult.errorString == 'string' && minifyResult.errorString.length == 0
                                                && typeof minifyResult.minifiedUrl == 'string' && minifyResult.minifiedUrl.length != 0) ? true : false ;
                            if (showMiniUrl === true) {
                                miniUrlCtrl.errorString = "";
                                // Per http://google.github.io/guava/releases/22.0-android/api/docs/ , re Base32 encoding:
                                // The character '=' is used for padding, but can be omitted or replaced.
                                miniUrlCtrl.minifiedUrl = minifyResult.minifiedUrl.replace(/=*$/, "");
                                miniUrlCtrl.miniUrlLink = miniUrlCtrl.getMiniUrlLink();
                            } else if (typeof minifyResult.errorString == 'string' && minifyResult.errorString.length != 0) {
                                miniUrlCtrl.errorString = minifyResult.errorString;
                                miniUrlCtrl.miniUrlLink = "";
                            }
                        }
                        miniUrlCtrl.minifiedUrlsInSession[miniUrlCtrl.longUrl] = miniUrlCtrl.minifiedUrl;
                        miniUrlCtrl.dataLoading = false;
                        miniUrlCtrl.dataForm.$setPristine();
                        miniUrlCtrl.dataForm.$setUntouched();
                    })
                    .catch( function failure(error) {
                        miniUrlCtrl.errorString = "Ouch. A server or network error has occured. Please try again. The error details are logged into your browser's console.";
                        console.log(error);
                        miniUrlCtrl.dataLoading = false;
                    });

                }

            })
            .catch( function failure(error) {
                miniUrlCtrl.errorString = "Ouch. A server or network error has occured. Please try again. The error details are logged into your browser's console.";
                console.log(error);
                miniUrlCtrl.dataLoading = false;
            });
        };

        miniUrlCtrl.isFieldInErrorState = function(fieldName) {
            return (miniUrlCtrl.dataForm[fieldName].$dirty && miniUrlCtrl.dataForm[fieldName].$invalid) ? true : false ;
        };

        miniUrlCtrl.isOkToSubmit = function(fieldName) {
            var _isOkToSubmit = (miniUrlCtrl.dataForm['longUrl'].$dirty && miniUrlCtrl.dataForm.$valid && !miniUrlCtrl.dataLoading) ? true : false ;
            return _isOkToSubmit;
        };

        miniUrlCtrl.resetForm = function() {

            miniUrlCtrl.longUrl = "";
            miniUrlCtrl.miniUrlLink = "";
            miniUrlCtrl.errorString = "";
            miniUrlCtrl.dataLoading = false;

            if (miniUrlCtrl.dataForm) {
                miniUrlCtrl.dataForm.$setPristine();
                miniUrlCtrl.dataForm.$setUntouched();
            }

        };

        miniUrlCtrl.resetForm();
    }

    var miniUrlApp = angular.module("miniUrl");
    miniUrlApp.component('miniUrl', miniUrlDdo);
    miniUrlApp.controller('miniUrlController', miniUrlController);
})();