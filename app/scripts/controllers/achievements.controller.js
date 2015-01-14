'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('AchievementsCtrl' , AchievementsCtrl);

      function AchievementsCtrl($scope, AchievementsService, $routeParams, $window) {

        $scope.superCat = prettySuperCategory($routeParams.category);

        // Analytics for page
        $window.ga('send', 'pageview', 'Achievements/' + $routeParams.category);

        AchievementsService.getAchievements().then(function(achievements){
            $scope.achievements = achievements[$scope.superCat];
        });

        $scope.getImageSrc = function(achievement) {

            if (achievement.id === '8468') {
                // special case galakras since its busted on wowhead
                return 'images/galakras.png';
            } else if (achievement.id === '9552') {
                // special case falling down since its busted on wowhead
                return 'images/spell_fel_incinerate.jpg';
            } else if (achievement.completed) {
                // wowhead img
                return 'http://wow.zamimg.com/images/wow/icons/medium/' + achievement.icon.toLowerCase() + '.jpg';
            } else {
                // 1x1 gif   
                return 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
            }
        };

        $scope.border = function(achievement){
            if (achievement.completed) {
                return 'borderOff';
            }
            else {
                return 'borderOn';
            }
          };

        // Maps url simplified name into the pretty name and the name we hash off of in the json
        function prettySuperCategory(supercat) {

            var prettyCatName = supercat;

             switch(supercat) {
                case 'general':
                    prettyCatName = 'General';
                    break;
                case 'quests':
                    prettyCatName = 'Quests';
                    break;
                case 'exploration':
                    prettyCatName = 'Exploration';
                    break;
                case 'pvp':
                    prettyCatName = 'Player vs. Player';
                    break;          
                case 'dungeons':
                    prettyCatName = 'Dungeons & Raids';
                    break;          
                case 'professions':
                    prettyCatName = 'Professions';
                    break;
                case 'reputation':
                    prettyCatName = 'Reputation';
                    break;
                case 'scenarios':
                    prettyCatName = 'Scenarios';
                    break;
                case 'events':
                    prettyCatName = 'World Events';
                    break;
                case 'pets':
                    prettyCatName = 'Pet Battles';
                    break;
                case 'collections':
                    prettyCatName = 'Collections';
                    break;
                case 'garrisons':
                    prettyCatName = 'Garrisons';
                    break;             
                case 'legacy':
                    prettyCatName = 'Legacy';
                    break;                       
                case 'feats':
                    prettyCatName = 'Feats of Strength';
                    break;                    
            }

            return prettyCatName;
        }
  }

})();