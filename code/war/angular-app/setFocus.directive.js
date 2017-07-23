(function(){
    'use strict';

    var setFocusModule = angular.module('setFocus', []);
    
    setFocusModule.directive('setFocus', function(){
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.focus();
            }
        };
    });
})();