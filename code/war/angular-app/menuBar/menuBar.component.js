(function(){
    'use strict';

    var menuBarModuleDdo = {
        controller   : 'menuBarController',
        controllerAs : "menuBarCtrl",
        templateUrl  : './angular-app/menuBar/menuBar.partial.html',
        $inject      : [],
        bindings     : {}
    };

    function menuBarController() {
        var menuBarCtrl = this;
        menuBarCtrl.appName = "URL Minifier";
    }

    var menuBarModule = angular.module('menuBar');
    menuBarModule.component('urlMinifierMainMenuBar', menuBarModuleDdo);
    menuBarModule.controller('menuBarController', menuBarController);
}());