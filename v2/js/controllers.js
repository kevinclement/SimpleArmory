'use strict';

/* Controllers */
var simpleArmoryControllers = angular.module('simpleArmoryControllers', []);

simpleArmoryControllers.controller('LoginCtrl', ['$scope', '$modal', 'LoginService', function ($scope, $modal, loginService) {

  var modalInstance = $modal.open({
    templateUrl: 'ModelLogin.html',
    controller: 'ModalInstanceCtrl',
    backdrop: 'static',
  });

  modalInstance.result.then(function (loginObj) {
    loginService.setUser(loginObj);
  });
}]);

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.
simpleArmoryControllers.controller('ModalInstanceCtrl', function ($scope, $modalInstance) {
  
  $scope.ok = function () {
    $modalInstance.close({
      'region': 'us',
      'realm': 'proudmoore',
      'character': 'marko'
    });
  };
});


simpleArmoryControllers.controller('OverviewCtrl', ['$scope', 'LoginService', '$routeParams', function ($scope, loginService, $routeParams) {

  $scope.character = loginService.getCharacter($routeParams);
}]);

simpleArmoryControllers.controller('HeaderCtrl', ['$scope', 'LoginService', function ($scope, loginService) {
    
    $scope.loginService = loginService;
    
    $scope.$watch('loginService.isLoggedIn()', function(newVal) {
        $scope.isLoggedIn = newVal;
    });
}]);

simpleArmoryControllers.controller('ErrorCtrl', ['$scope', function ($scope) {
}]);

/*
simpleArmoryControllers.controller('PhoneListCtrl', ['$scope', 'Phone',
  function($scope, Phone) {
    $scope.phones = Phone.query();
    $scope.orderProp = 'age';
  }]);

phonecatControllers.controller('PhoneDetailCtrl', ['$scope', '$routeParams', 'Phone',
  function($scope, $routeParams, Phone) {
    $scope.phone = Phone.get({phoneId: $routeParams.phoneId}, function(phone) {
      $scope.mainImageUrl = phone.images[0];
    });

    $scope.setImage = function(imageUrl) {
      $scope.mainImageUrl = imageUrl;
    }
  }]);
*/