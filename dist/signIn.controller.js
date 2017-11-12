(function () {
    'use strict';

    angular
        .module('kiosk')
        .controller('signInController', signInController);

    signInController.inject = ['$scope', '$uibModal', '$location', '$http', '$log', 'sp', '$rootScope', '$timeout'];
    function signInController($scope, $uibModal, $location, $http, $log, sp, $rootScope, $timeout) {
        var vm = this;
        $scope.kiosk.message = "Welcome to Reception! Please sign in below.";
        $scope.kiosk.getUsers();
        vm.Reasons = ['Meeting', 'Training', 'Other'];

        vm.toggleUser = function (user) {
            $log.debug(user);
            user.selected = !user.selected;

            if (user.selected) {
                $('.square-right').removeClass('glow-error')
            }
        }

        vm.modals = {};
        vm.modals.options = {
            backdrop: 'static',
            animation: true,
            resolve: {
                payload: function () {
                    return {
                        message: "The hosts were notified"
                    }
                }
            },
            controller: 'modalController',
            template: $rootScope.data.modalViewTemplate
        };

        vm.modals.open = function () {
            var selectedEmails = [];

            for (var i = 0; i < $scope.kiosk.users.length; i++) {
                if ($scope.kiosk.users[i].selected) {
                    selectedEmails.push($scope.kiosk.users[i].Email);
                }
            }

            var mailContent =
                "<h3>Visitor(s): " + vm.FullName + "</h3>" +
                "<p>Email:" + vm.Email + "</p>" +
                "<p>Purpose of the visit:" + vm.Reason + "</p>";
            var subject = vm.FullName + " signed in";
            sp.sendEmail(selectedEmails, null, subject, mailContent).then(function (data) {
                $log.debug('message sent');
                $log.debug(data);

                var signInsStorage = sp.getListStorage('Signins');
                //signInsStorage.ensureStorage();
                var today = new Date();
                var shortDate = today.toLocaleDateString();
                var time = today.toLocaleTimeString();
                var title = shortDate + " - " + vm.Email.toLowerCase();
                var hosts = [];
                $scope.kiosk.users.forEach(function(host){
                    if (host.selected){
                        hosts.push(host.DisplayName);
                    }
                });
 
                hosts = hosts.join('\n');
                var values = { 
                    FullNames:vm.FullName,
                    Purpose: vm.Reason,
                    "SignInTime": shortDate + " " + time,
                    Email: vm.Email.toLowerCase(),
                    Hosts:  hosts                 
                };
                signInsStorage.put(title, values).then(function (data) {
                    $log.debug(data);
                });
            });


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
        }

        vm.trySendEmail = function () {
            $('.ng-invalid').addClass('ng-touched');


            var selectedUsers = false;
            for (var i = 0; i < $scope.kiosk.users.length; i++) {
                if ($scope.kiosk.users[i].selected) {
                    selectedUsers = true;
                    break;
                }
            }
            if ($scope.form.$valid == false) {
                return;
            }

            if (selectedUsers == false) {
                //TODO: show message:
                $('.square-right').addClass('glow-error');
                return;
            }

            vm.modals.open();

        }

        $timeout(function(){
            $location.path('#!/Welcome');
        }, 90000)
    }
})();