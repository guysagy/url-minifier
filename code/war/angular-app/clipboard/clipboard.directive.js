(function(){
    'use strict';

    // Implementation borrowed from : https://gist.github.com/JustMaier/6ef7788709d675bd8230

    var clipboardModule = angular.module('clipboard');

    clipboardModule.service('copyToClipboardService', ['$window', function ($window) {
        var body = angular.element($window.document.body);
        var textarea = angular.element('<textarea/>');
        textarea.css({
            position: 'fixed',
            opacity: '0'        // totally transparent
        });

        return function (toCopy) {
            textarea.val(toCopy);
            body.append(textarea);
            textarea[0].select();

            try {
                var successful = $window.document.execCommand('copy');
                if (!successful) throw successful;
            } catch (err) {
                $window.prompt("To copy your minified URL to the clipboard, please press Ctrl+C and Enter.", toCopy);
            }

            textarea.remove();
        }
    }]);


    clipboardModule.directive('copyToClipboard', ['copyToClipboardService', function (copyToClipboardService) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('click', function () {
                    copyToClipboardService(attrs.copyToClipboard);
                });
            }
        };
    }]);

})();