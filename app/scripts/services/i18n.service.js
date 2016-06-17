'use strict';

(function() {

    angular
        .module('simpleArmoryApp')
        .factory('i18nService', i18nService);

    function i18nService($log, $http, $locale, $cookies) {

        var supportedLanguages = { 
            'en' : 'English', 
            'de' : 'Deutsch', 
            'ru' : 'Русский', 
            'es' : 'Español', 
            'fr' : 'Français', 
            };
        var currentLanguage = $cookies.get('language') || $locale.id.replace(/-\w+/, '');
    
        return {
            
            getSupportedLanguages: function() {
                return supportedLanguages;
            },
            
            getLanguage: function() {
                return currentLanguage;
            },
            
            setLanguage: function($scope, language) {
                // In case passed in locale format, e.g. en-us
                language = language.replace(/-\w+/, '');
                
                if ( !(language in supportedLanguages) ) {
                    $log.warn("Unsupported language: " + language);
                    return;
                }
                
                $log.log("Switching language: " + language);
                
                // Load the translation data
                var languageFilePath = 'translation.' + language + '.json';
                
                $http({
                    method: 'GET',
                    url: '/data/' + languageFilePath,
                    cache: true
                }).
                success(function(data, status, headers, config) {
                    $scope.translation = data;
                    $scope.selectedLanguage = language;
                    
                    $log.log('Loaded i18n data for language ' + language);
                    
                    // Store the chosen language
                    currentLanguage = language;
                    
                    $cookies.put('language', language);
                }).
                error(function(data, status, headers, config) {
                    // handle error
                    $log.error('Failed to load i18n data for language ' + language);
                });
            },
        };
    }

})();