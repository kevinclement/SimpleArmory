'use strict';

/**
 * @ngdoc function
 * @name simpleArmoryApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the simpleArmoryApp
 */
angular.module('simpleArmoryApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
