'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('AdminCtrl', AdminCtrl);

    function AdminCtrl($scope, AdminService, $routeParams, $window) {

        // Analytics for page
        $window.ga('send', 'pageview', 'Admin');

        // TODO: change download url to be based on file we're working on
        $scope.downloadFile = 'mounts.json';

        // TODO: don't show save button unless we've made a change
        // TODO: service and stuff should be based on changes I made

        AdminService.getMountCategories().then(function(data){
            var jsonData = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data.data, null, 2));
            $scope.jsonUrl = 'data:' + jsonData;
        });

    }

})();