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
        var currentTranslation = {};

        var getSupportedLanguages = function() {
            return supportedLanguages;
        },

        getLanguage = function() {
            return currentLanguage;
        },

        getTranslationData = function() {
            return currentTranslation;
        },

        updateScope = function($scope) {
            $scope.i18n = {
                translation: currentTranslation,
                selectedLanguage: currentLanguage
            };
        },

        setLanguage = function($scope, language) {
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

                // Store the chosen language
                currentLanguage = language;
                currentTranslation = data;

                // $scope.i18n = {
                    // translation: currentTranslation,
                    // selectedLanguage: currentLanguage
                // };
                updateScope($scope);

                $cookies.put('language', currentLanguage);

                $log.log('Loaded i18n data for language ' + currentLanguage);
            }).
            error(function(data, status, headers, config) {
                // handle error
                $log.error('Failed to load i18n data for language ' + language);
            });
        };

        return {
            getSupportedLanguages: getSupportedLanguages,
            getLanguage: getLanguage,
            getTranslationData: getTranslationData,
            updateScope: updateScope,
            setLanguage: setLanguage
        };
    }

})();