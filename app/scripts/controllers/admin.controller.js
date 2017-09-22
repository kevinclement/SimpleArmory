'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('AdminCtrl', AdminCtrl);

    function AdminCtrl($scope, AdminService, $routeParams, $window) {

        // Analytics for page
        $window.ga('send', 'pageview', 'Admin');

    	// $scope.character = $routeParams.character;
    	// $scope.realm = $routeParams.realm;
    }

})();