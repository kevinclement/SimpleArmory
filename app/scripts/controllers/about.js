'use strict';

/**
 * @ngdoc function
 * @name simpleArmoryApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the simpleArmoryApp
 */
angular.module('simpleArmoryApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
