'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .controller('AdminMounts', AdminMounts);

    function AdminMounts($scope, AdminService) {

        AdminService.getMountData().then(function(data){
            // store the data in the scope so that we can build out forms from it
            // var categories = [];
            // for(var i=0; i<data.length; i++) {
            //     var cat = data[i];
            //     var name = cat.name;
            //     categories.push(cat);
            // }

            // $scope.categories = categories;
            // $scope.selectedCat = $scope.categories[0];

            // $scope.selectionChanged(true);
        });
    }
})();