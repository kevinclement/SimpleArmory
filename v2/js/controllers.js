'use strict';

/* Controllers */
var simpleArmoryControllers = angular.module('simpleArmoryControllers', []);


simpleArmoryControllers.controller('ApplicationController', ['$scope', 'LoginService', '$location', '$filter', function ($scope, loginService, $location, $filter) {

    // default to not logged in
    $scope.isLoggedIn = false;

    // Listen for path changed and then parse and fetch the character
    $scope.$on("$locationChangeSuccess",function(event, next, current){

      // If there was an error we need to reset everything
      if ($location.$$path == "/error") {
          $scope.character = null;
          $scope.isLoggedIn = false;
      } else if ($location.$$path != "" && $location.$$path != "/") {
        // "us/proudmoore/marko"
        // [0]: us/proudmoore/marko
        // [1]: spirestone
        // [2]: marko
        // [3]: location part
        var rgr = new RegExp('([^\/]+)/([^\/]+)/([^\/]+)/?([^\/]+)?').exec($location.$$path);
        rgr = rgr ? rgr : {};

        loginService.getCharacter({'region': rgr[1], 'realm':rgr[2], 'character':rgr[3]}).then(function(character) {
          $scope.character = character[0];
          $scope.isLoggedIn = true;
        });
      }
    });  

    // Helper function for percentage numbers.  Used in a lot of screens
    $scope.percent = function(n, d) {
      return $filter('number')(((n / d) * 100), 0);
    }
}]);

simpleArmoryControllers.controller('LoginCtrl', ['$scope', '$modal', '$location', function ($scope, $modal, $location) {

  var modalInstance = $modal.open({
    templateUrl: 'ModelLogin.html',
    controller: 'ModalInstanceCtrl',
    backdrop: 'static',
  });

  modalInstance.result.then(function (loginObj) {
    $location.url(loginObj.region + "/" + loginObj.realm + "/" + loginObj.character);
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

simpleArmoryControllers.controller('OverviewCtrl', ['$scope', 'AchievementsService', function ($scope, achievementsService) {
  
  achievementsService.getAchievements().then(function(achievements){
    $scope.achievements = achievements;
  });
}]);

simpleArmoryControllers.controller('HeaderCtrl', ['$scope', '$location', function ($scope, $location) {
 
    $scope.getUrl = function(subSite) {
      var url = "#" + getBaseUrl($scope.character);
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
      var combinedUrl = getBaseUrl($scope.character);
      if (viewLocation != "") {
        combinedUrl += "/" + viewLocation;
      } 

      return $location.path() == combinedUrl;
    };

    $scope.guildName = function() {
        if ($scope.character && $scope.character.guild) {
          return "<" + $scope.character.guild.name + ">";
        }

        return "";
    }

    $scope.imgUrl = function() {
      if ($scope.character) {
        var c = $scope.character;
        return "http://" + c.region + ".battle.net/static-render/" + c.region + "/" + c.thumbnail;
      }

      return "";   
    }

    $scope.armoryUrl = function() {
      if ($scope.character) {
        var c = $scope.character;
        return "http://" + c.region + ".battle.net/wow/en/character/" + c.realm + "/" + c.name.toLowerCase() + "/advanced";
      }

      return "#";   
    }

    function getBaseUrl(character) {    
      if (!character) {
        return "#";
      }

      return "/" + character.region.toLowerCase() + "/" + 
                   character.realm.toLowerCase()  + "/" + 
                   character.name.toLowerCase();
    }
}]);

simpleArmoryControllers.controller('AchievementsCtrl', ['$scope', 'AchievementsService', '$routeParams', function ($scope, achievementsService, $routeParams) {
  
  $scope.superCat = prettySuperCategory($routeParams.category);

  achievementsService.getAchievements().then(function(achievements){
    $scope.achievements = achievements[$scope.superCat];
  });

  $scope.getImageSrc = function(achievement) {

    if (achievement.id == 8468) {
      // special case galakras since its busted on wowhead
      return "images/galakras.png";
    } else if (achievement.completed) {
      // wowhead img
      return "http://wow.zamimg.com/images/wow/icons/medium/" + achievement.icon.toLowerCase() + ".jpg";
    } else {
      // 1x1 gif   
      return "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
    }
  }

  $scope.border = function(achievement){
      if (achievement.completed) {
        return "borderOff";
      }
      else {
        return "borderOn";
      }
    };

  // Maps url simplified name into the pretty name and the name we hash off of in the json
  function prettySuperCategory(supercat) {

    var prettyCatName = supercat;

    switch(supercat) {
      case 'general':
          prettyCatName = "General";
          break;
      case 'quests':
          prettyCatName = "Quests";
          break;
      case 'exploration':
          prettyCatName = "Exploration";
          break;
      case 'pvp':
          prettyCatName = "Player vs. Player";
          break;          
      case 'dungeons':
          prettyCatName = "Dungeons & Raids";
          break;          
      case 'professions':
          prettyCatName = "Professions";
          break;
      case 'reputation':
          prettyCatName = "Reputation";
          break;
      case 'scenarios':
          prettyCatName = "Scenarios";
          break;
      case 'events':
          prettyCatName = "World Events";
          break;
      case 'pets':
          prettyCatName = "Pet Battles";
          break;
      case 'feats':
          prettyCatName = "Feats of Strength";
          break;                    
    }

    return prettyCatName;
  }
}]);

simpleArmoryControllers.controller('MountsCtrl', ['$scope', 'MountsAndPetsService', function ($scope, mountsService) {
  mountsService.getItems("mounts").then(function(items){
      $scope.items = items;
  });

  $scope.getImageSrc = function(item) {

    if (item.collected) {
      // wowhead img
      return "http://wow.zamimg.com/images/wow/icons/medium/" + item.icon.toLowerCase() + ".jpg";
    } else {
      // 1x1 gif   
      return "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
    }
  }
}]);

simpleArmoryControllers.controller('CompanionsCtrl', ['$scope', '$routeParams', function ($scope, $routeParams) {

}]);

simpleArmoryControllers.controller('BattlePetsCtrl', ['$scope', '$routeParams', function ($scope, $routeParams) {

}]);

simpleArmoryControllers.controller('CalendarCtrl', ['$scope', '$routeParams', function ($scope, $routeParams) {

}]);

simpleArmoryControllers.controller('ReputationCtrl', ['$scope', '$routeParams', function ($scope, $routeParams) {

}]);

simpleArmoryControllers.controller('ErrorCtrl', ['$scope', function ($scope) {

}]);
