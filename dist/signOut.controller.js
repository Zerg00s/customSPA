(function () {
    'use strict';

    angular
        .module('kiosk')
        .controller('signOutController', signOutController);

    signOutController.inject = ['$scope', '$uibModal', '$location', '$log', 'sp', '$rootScope', '$timeout'];
    function signOutController($scope, $uibModal, $location, $log, sp, $rootScope, $timeout) {
        var vm = this;

        $scope.kiosk.message = "Sign out";
        vm.modals = {};
        vm.modals.options = {
            backdrop: 'static',
            animation: true,
            resolve: {
                payload: function () {
                    return {
                        message: "Successfully signed out"
                    }
                }
            },
            controller: 'modalController',
            //templateUrl: 'modal.view.html'
            template: $rootScope.data.modalViewTemplate
        };

        vm.modals.open = function () {

            var signInsStorage = sp.getListStorage('Signins');
            //signInsStorage.ensureStorage(); <-- Run this in a new environment to create a list
            var today = new Date();
            var shortDate = today.toLocaleDateString();
            var key = shortDate + " - " + vm.Email.toLowerCase();
            var today = new Date();
            var shortDate = today.toLocaleDateString();
            var time = today.toLocaleTimeString();

            signInsStorage.getByTitle(key).then(function (item) {

                if (item.Created) {
                    var values = {
                        SignOutTime: shortDate + " " + time
                    }
                    signInsStorage.put(key, values).then(function (data) {
                        vm.inProgress = false;
                        var modalInstance = $uibModal.open(vm.modals.options);
                        modalInstance.result.then(
                            //OK promise:
                            function (dialogResult) {
                                $location.path('#!/Welcome');
                            },
                            //cancel promise:
                            function (dialogResult) {
                                $log.debug(dialogResult);
                            });

                    });
                }
                else {
                    vm.inProgress = false;
                    vm.errorMessage = "Sign-in for " + vm.Email + " was not found. Please, try another email";
                    $log.debug('here is unexisting item...');
                    $log.debug(item);
                }
            });
        }

        vm.trySignOut = function () {
            if (vm.inProgress) {
                return;
            }
            vm.inProgress = true;
            $('.ng-invalid').addClass('ng-touched');
            if ($scope.form.$valid) {
                vm.modals.open();
            }
        }

        $timeout(function () {
            $location.path('#!/Welcome');
        }, 90000)
    }
})();