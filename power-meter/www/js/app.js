/**
 * App file for the
 * @type {{}}
 */

var meter = {};
meter.initialize = function() {
    meter.gauge = new JustGage({
        id: "meter",
        value: 0,
        min: 0,
        max: 12000,
        title: "Power Consumption",
        label: "Watts"
    });
};

var app = angular.module('power', ['ionic', 'powerServices']);

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the 
    // accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    meter.initialize();
  });
});

app.controller('PowerCtrl', ['$scope', 'Power', '$interval',
    '$ionicSlideBoxDelegate', '$ionicSideMenuDelegate',
    function($scope, Power, $interval, $ionicSlideBoxDelegate, $ionicSideMenuDelegate) {
        $scope.toggleLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };

        $interval(function () {
            Power.get({service: 'watts', interval: 10}).$promise.then(function(p) {
                meter.gauge.refresh(p.watt);
            });
        }, 2000);
    }
]);

