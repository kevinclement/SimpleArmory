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

simpleArmoryControllers.controller('HeaderCtrl', ['$scope', 'LoginService', '$location', function ($scope, loginService, $location) {
    
    $scope.loginService = loginService;
  
    $scope.$watch('loginService.isLoggedIn()', function(newVal) {
        $scope.isLoggedIn = newVal;
    });

    $scope.getUrl = function(subSite) {
      if (!$scope.loginService || !$scope.loginService.character) {
        return "#";
      }

      var url = "#" + getBaseUrl($scope.loginService);
      if (subSite != "") {
        url += "/" + subSite;
      }

      return url;
    }

    $scope.isActive = function (viewLocation, subMenu) {

      // if its a submenu search, then just look for the location in the url
      // and call it good      
      if (subMenu) {
        return $location.path().indexOf(viewLocation) > 0;
      }

      // otherwise, lets try to match it directly
      var combinedUrl = getBaseUrl($scope.loginService);
      if (viewLocation != "") {
        combinedUrl += "/" + viewLocation;
      } 

      return $location.path() == combinedUrl;
    };

    $scope.guildName = function() {
        if ($scope.loginService && $scope.loginService.character && $scope.loginService.character.guild) {
          return "<" + $scope.loginService.character.guild.name + ">";
        }

        return "";
    }

    $scope.imgUrl = function() {
      if ($scope.loginService && $scope.loginService.character) {
        var c = $scope.loginService.character;
        return "http://" + c.region + ".battle.net/static-render/" + c.region + "/" + c.thumbnail;
      }

      return "";   
    }

    function getBaseUrl(loginService) {
      
      if(!loginService || !loginService.character) {
        return "#";
      }

      return "/" + loginService.character.region.toLowerCase() + "/" + 
                   loginService.character.realm.toLowerCase()  + "/" + 
                   loginService.character.name.toLowerCase();
    }

}]);

simpleArmoryControllers.controller('AchievementsCtrl', ['$scope', 'LoginService', '$routeParams', function ($scope, loginService, $routeParams) {

    $scope.character = loginService.getCharacter($routeParams);
}]);

simpleArmoryControllers.controller('MountsCtrl', ['$scope', 'LoginService', '$routeParams', function ($scope, loginService, $routeParams) {

    $scope.character = loginService.getCharacter($routeParams);
}]);

simpleArmoryControllers.controller('CompanionsCtrl', ['$scope', 'LoginService', '$routeParams', function ($scope, loginService, $routeParams) {

    $scope.character = loginService.getCharacter($routeParams);
}]);

simpleArmoryControllers.controller('BattlePetsCtrl', ['$scope', 'LoginService', '$routeParams', function ($scope, loginService, $routeParams) {
    $scope.character = loginService.getCharacter($routeParams);
}]);

simpleArmoryControllers.controller('CalendarCtrl', ['$scope', 'LoginService', '$routeParams', function ($scope, loginService, $routeParams) {

  $scope.character = loginService.getCharacter($routeParams);
}]);

simpleArmoryControllers.controller('ReputationCtrl', ['$scope', 'LoginService', '$routeParams', function ($scope, loginService, $routeParams) {

  $scope.character = loginService.getCharacter($routeParams);  
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