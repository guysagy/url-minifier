(function(){
    'use strict';

    function AppConfig($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider.state('home', {
            url : '/',
            template : '<mini-url></mini-url>'
        }).state('techInfo', {
            url : '/techInfo',
            templateUrl : './angular-app/miniUrl/miniUrlTechInfo.partial.html'
        }).state('miniUrlNotFound', {
            url : '/miniUrlNotFound',
            templateUrl : './angular-app/miniUrl/miniUrlNotFound.partial.html'
        }).state('safeRedirect', {
            url : '/safeRedirect',
            template : '<safe-redirect></safe-redirect>'
        });
    }
    AppConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

    var miniUrlApp = angular.module("miniUrl");
    miniUrlApp.config(AppConfig);

})();