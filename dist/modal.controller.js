angular.module('kiosk').controller('modalController', modalController);

modalController.$inject = ['$uibModalInstance', 'payload', '$scope','$timeout'];
function modalController($uibModalInstance, payload, $scope, $timeout) {
  $scope.message = payload.message;

  $scope.isError = payload.isError;

  $scope.modals = { message: payload.message };
  $scope.ok = function () {
    $uibModalInstance.close('OK');
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
 
  if(!$scope.isError){
    $timeout(function(){
      $scope.ok();
    },3000);
  }

};
