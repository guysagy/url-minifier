(function(){
    'use strict';

    var dependentAngularModules = ['ui.router', 'ngSanitize'];
    var dependentAppModules = ['setFocus', 'safeRedirect', 'menuBar', 'googleSafeBrowsingClient', 'clipboard'];

    var dependentModules = dependentAngularModules.concat(dependentAppModules);
    var miniUrlApp = angular.module("miniUrl", dependentModules);
})();