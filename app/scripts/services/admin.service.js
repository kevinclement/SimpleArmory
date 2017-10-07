'use strict';

(function() {
  angular
  .module('simpleArmoryApp')
  .service('AdminService', AdminService);

  // Keyed off of spellId
  var knownMissing = {
    '17458':true,  // Fluorescent Green Mechanostrider - only give to one player on accident
    '147595':true, // Stormcrow - unknown origin yet in game
    '127178':true, // Jungle Riding Crane - mop mounts never available
    '127180':true, // Albino Riding Crane - mop mounts never available
    '127213':true, // Black Riding Yak - mop mounts never available
    '123160':true, // Brown Riding Yak - mop mounts never available
    '127272':true, // Orange Water Strider - mop mounts never available
    '127274':true, // Jade Water Strider - mop mounts never available
    '123182':true, // White Riding Yak - mop mounts never available
    '127278':true, // Golden Water Strider - mop mounts never available
    '127209':true, // Black Riding Yak - mop mounts never available
    '215545':true, // Fel Bat (Test)
    '10788':true,  // Leopard - Alpha only mount
    '10790':true,  // Tiger - Alpha only mount
    '171618':true, // Ancient Leatherhide - unknown
    '48954':true,  // Old Swift Zhevra 
    '242896':true, // Vicious War Fox (added in 7.3 but not available yet)
    '242897':true  // Vicious War Fox (added in 7.3 but not available yet)
  };

  function AdminService($http, $log, SettingsService, $q) {
    return {
      getMissingMounts: function() {
        var defer = $q.defer();

        $q
          .all([
            $http.get(SettingsService.jsonFiles.mounts, { isArray: true }).then(function(data) {
              
              var myMounts = data.data;
              var allMounts = {};
              for (var key in myMounts) {
                var cat = myMounts[key];
                for (var k2 in cat.subcats) {
                  var subcat = cat.subcats[k2];
                  for (var i in cat.subcats[k2].items) {
                    var mount = subcat.items[i];
                    allMounts[mount.spellid] = mount;
                  }
                }
              }

              return allMounts;
            }),
            $http
              .jsonp(
                'https://us.api.battle.net/wow/mount/?locale=en_US&apikey=kwptv272nvrashj83xtxcdysghbkw6ep&jsonp=JSON_CALLBACK',
                { cache: true }
              )
              .then(function(data) {



                return data;
              })
          ])
          .then(function(data) {

            var missingMounts = [];
            var allMounts = data[0];
            var blizzardMounts = data[1].data.mounts;

            for (var key in blizzardMounts) {
              var mount = blizzardMounts[key];

              if (!allMounts[mount.spellId] && !knownMissing[mount.spellId])
              {
                  // Mount obj
                  //  creatureId
                  //  icon
                  //  isAquatic
                  //  isFlying
                  //  isGround
                  //  isJumping
                  //  itemId
                  //  name
                  //  qualityId
                  //  spellId

                  // check to make sure mount has stuff we require
                  if (!mount.spellId) {
                      console.log('ERROR: mount doesn\'t have spellId: ' + mount.name);
                  }
                  if (!mount.itemId) {
                      console.log('ERROR: mount doesn\'t have itemId: ' + mount.name);
                  }
                  if (!mount.icon) {
                      console.log('ERROR: mount doesn\'t have icon: ' + mount.name);
                  }

                  // format it properly for me
                  var myMount = {
                      'spellid': mount.spellId,
                      'allianceId': null,
                      'hordeId': null,
                      'itemId': mount.itemId,
                      'icon': mount.icon,
                      'obtainable': true,
                      'allowableRaces': [],
                      'allowableClasses': null,
                      'name': mount.name
                  };

                  missingMounts.push(myMount);
              }
            }

            defer.resolve(missingMounts);
          });

        return defer.promise;
      },

      getMountData: function() {
        return $http.get(SettingsService.jsonFiles.mounts, { cache: true, isArray: true }).then(function(data) {
          return data.data;
        });
      },

      getAchievementData: function() {
        return $http.get(SettingsService.jsonFiles.achievements, { cache: true }).then(function(data) {
          return data.data;
        });
      }
    };
  }
})();
