(function () {
    'use strict';

    angular
        .module('kiosk')
        .controller('welcomeController', welcomeController);

    welcomeController.inject = ['$scope'];
    function welcomeController($scope) {
        var vm = this;
        $scope.kiosk.message = "Welcome to Reception! Please sign in or sign out below.";

    }
})();