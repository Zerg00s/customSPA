(function () {
    'use strict';

    angular
        .module('kiosk')
        .controller('KioskController', KioskController);

    KioskController.inject = ['$scope', '$http', '$log', '$timeout', '$location', '$uibModal', '$uibModalStack', '$rootScope'];
    function KioskController($scope, $http, $log, $timeout, $location, $uibModal, $uibModalStack, $rootScope) {
        var vm = this;

        vm.location = $location;

        $http.get("modal.view.html")
            .then(function (response) {
                vm.modalViewTemplate = response.data;
                $rootScope.data = {
                    modalViewTemplate: response.data
                };

                vm.modals.options = {
                    backdrop: 'static',
                    animation: true,
                    resolve: {
                        payload: function () {
                            return {
                                message: "No internet connection. Please, check wi-fi settings",
                                isError: true
                            }
                        }
                    },
                    controller: 'modalController',
                    template: $rootScope.data.modalViewTemplate
                    //templateUrl: 'modal.view.html'
                };

            });

        $scope.$on('$routeChangeStart', function (next, current) {
            $('.circle').removeClass('animated');
            $timeout(function () {
                $('.circle').addClass('animated');
            }, 5);


            $(".hero-heading").removeClass('animated');
            $timeout(function () {
                $(".hero-heading").addClass('animated');
            }, 5);
        });  

        vm.getUsers = function () {
            vm.users = [];
            var hostsUrl = 
                "../../../_api/web/Lists/GetByTitle('Photos')/Items?$select=EncodedAbsUrl" +
                ",FullName" +
                ",Email" +
                "&$filter=Active eq 1";
                


            $http.get(hostsUrl).then(function (profileResults) {
                $log.debug(profileResults);

                for (var i = 0; i < profileResults.data.value.length; i++) {
                    var user = {
                        DisplayName: profileResults.data.value[i].FullName,
                        Email: profileResults.data.value[i].Email,
                        PictureUrl: profileResults.data.value[i].EncodedAbsUrl
                    }
                    vm.users.push(user);
                }
            });
        }

        vm.showError = function (message) {
            vm.errorModal = vm.modals.open();
        }

        vm.modals = {};


        vm.modals.open = function () {
            var modalInstance = $uibModal.open(vm.modals.options);
            modalInstance.result.then(
                //OK promise:
                function (dialogResult) {
                    $location.path('#!/Welcome');
                    $rootScope.data.connectionWarningVisible = false;
                },
                //cancel promise:
                function (dialogResult) {
                    $log.debug(dialogResult);
                    $rootScope.data.connectionWarningVisible = false;
                });

            return modalInstance;
        }

        vm.checkInternetConnection = function () {
            vm.timer = $timeout(function () {

                if (navigator.onLine) {
                    if (vm.errorModal) {
                        if ($rootScope.data.connectionWarningVisible) {
                            $rootScope.data.connectionWarningVisible = false;
                            $uibModalStack.dismissAll();
                            vm.errorModal = null;
                        }
                    }
                }

                if (!$rootScope.data.connectionWarningVisible) {
                    if (!navigator.onLine) {
                        $rootScope.data.connectionWarningVisible = true;
                        vm.showError();
                    }
                }
                vm.checkInternetConnection();
            }, 5000)
        }

        vm.checkInternetConnection();

        //Not used right now. The reason: Not all users have a photo in their profile
        function getUsesrProfileURL(email) {
            return _spPageContextInfo.webServerRelativeUrl + "/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v='i:0%23.f|membership|" + email + "'";
        }

    }
})();