'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('ErrorCtrl' , ErrorCtrl);

    function ErrorCtrl($scope, $routeParams, $window) { 

		// Analytics for page
        $window.ga('send', 'pageview', 'Error');

    	$scope.character = $routeParams.character;
    	$scope.realm = $routeParams.realm;
    }

})();