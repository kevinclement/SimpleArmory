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
simpleArmoryControllers.controller('ModalInstanceCtrl', ['$scope', '$modalInstance', 'BlizzardRealmService', function ($scope, $modalInstance, $brService) {

  // initialize with just a loading realms message
  $scope.realms = [
      {name:'Loading realms...'},
  ]

  // wait for promises to finish and then populate with servers
  $brService.getRealms().then(function(data) {
    $scope.realms = [];

    // First add the us servers
    angular.forEach(data[0].realms, function(value, key) {   
      this.push({value:{realm:value.slug, region:'us'}, text:value.name + " US"});
    }, $scope.realms);

    // Then the eu servers
    angular.forEach(data[1].realms, function(value, key) {
      this.push({value:{realm:value.slug, region:'eu'}, text:value.name + " EU"});
    }, $scope.realms);    
  });
  
  $scope.ok = function () {
    $modalInstance.close({
      'region': $scope.selectedRealm.region,
      'realm': $scope.selectedRealm.realm,
      'character': $scope.characterName
    });
  };

  // TMP just to make it easier for me to test, to remove before we go live
  $scope.marko = function () {

    $modalInstance.close({
      'region': 'us',
      'realm': 'proudmoore',
      'character': 'marko'
    });
  };
}]);

simpleArmoryControllers.controller('OverviewCtrl', ['$scope', 'LoginService', '$routeParams', function ($scope, loginService, $routeParams) {

  $scope.character = loginService.getCharacter($routeParams);
}]);

simpleArmoryControllers.controller('HeaderCtrl', ['$scope', 'LoginService', function ($scope, loginService) {
    
    $scope.loginService = loginService;
    
    $scope.$watch('loginService.isLoggedIn()', function(newVal) {
        $scope.isLoggedIn = newVal;
    });

    $scope.getUrl = function(subSite) {
      if (!$scope.loginService || !$scope.loginService.character)
      {
        return "#";
      }

      var url = "#/" + 
        $scope.loginService.character.region.toLowerCase() + "/" + 
        $scope.loginService.character.realm.toLowerCase()  + "/" + 
        $scope.loginService.character.name.toLowerCase();

      if (subSite != "")
      {
        url += "/" + subSite;
      }

      return url;
    }

}]);

simpleArmoryControllers.controller('AchievementsCtrl', ['$scope', 'LoginService', function ($scope, loginService) {
  
}]);

simpleArmoryControllers.controller('MountsCtrl', ['$scope', 'LoginService', function ($scope, loginService) {
  
}]);

simpleArmoryControllers.controller('CompanionsCtrl', ['$scope', 'LoginService', function ($scope, loginService) {
  
}]);

simpleArmoryControllers.controller('BattlePetsCtrl', ['$scope', 'LoginService', function ($scope, loginService) {
  
}]);

simpleArmoryControllers.controller('CalendarCtrl', ['$scope', 'LoginService', function ($scope, loginService) {
  
}]);

simpleArmoryControllers.controller('ReputationCtrl', ['$scope', 'LoginService', function ($scope, loginService) {
  
}]);

simpleArmoryControllers.controller('ErrorCtrl', ['$scope', 'LoginService', function ($scope, loginService) {
  loginService.resetLoggedIn();
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