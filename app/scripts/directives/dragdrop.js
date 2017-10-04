'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .directive('ngDrag', ngDrag)
        .directive('ngDrop', ngDrop);

    function ngDrag() {
        return function (scope, element, attrs) {
            element.attr("draggable", true);
            element.bind("dragstart", function (e) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngDrag);
                });
            });
        };
    }

    function ngDrop() {
        return function (scope, element, attrs) {
            element.bind("dragover", function(e) {
                if (e.preventDefault) {
                    e.preventDefault();
                }

                e.originalEvent.dataTransfer.dropEffect = 'move';
                return false;
            });

            element.bind("drop", function (e) {
                 scope.$apply(function (){
                     scope.$eval(attrs.ngDrop);
                 });

                 e.target.classList.remove(attrs.ngDropClass);
            });

            /* Add/Remove css class on enter/exit if specified*/
            if (attrs.ngDropClass) {
                element.bind("dragenter", function (e) {
                    e.target.classList.add(attrs.ngDropClass);
                });

                element.bind("dragleave", function (e) {
                    e.target.classList.remove(attrs.ngDropClass);
                });
            }
        };
    }
    
})();