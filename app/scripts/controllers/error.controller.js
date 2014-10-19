'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('ErrorCtrl' , ErrorCtrl);

    function ErrorCtrl($scope, $routeParams) { 

    	$scope.character = $routeParams.character;
    	$scope.realm = $routeParams.realm;
    }

})();