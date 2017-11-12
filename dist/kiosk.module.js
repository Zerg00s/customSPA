
(function () {
    'use strict';

    angular.module('kiosk', ['ngRoute',
        'ui.bootstrap',
        'ngAnimate',
        'sp.service'
    ]);
 
    angular.module('kiosk').config(routeConfig);

      
    function routeConfig($routeProvider) {
        $routeProvider
            .when('/Welcome',
            {
                templateUrl: 'welcome-view.html',
                controller: 'welcomeController',
                controllerAs: 'welcome'
            })
            .when('/SignIn',
            {
                templateUrl: 'signIn-view.html',
                controller: 'signInController',
                controllerAs: 'signIn'
            })
            .when('/SignOut',
            {
                templateUrl: 'signOut-view.html',
                controller: 'signOutController',
                controllerAs: 'signOut'
            })
            .otherwise('/Welcome');
    }
})();