(function(){
    'use strict';

    function miniUrlService($http) {
        var service = this;
        this.minifyUrl = function(longUrl){
            var data = JSON.stringify({longUrl: longUrl});
            return $http.post('/minify', data);
        };
    }
    miniUrlService.$inject = ['$http'];

    var miniUrlModule = angular.module("miniUrl");
    miniUrlModule.service('miniUrlService', miniUrlService);
})();