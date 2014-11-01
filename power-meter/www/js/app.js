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
        max: 12500,
        title: "Power Usage Now",
        label: "Watts"
    });
};

var app = angular.module('power', ['ionic']);

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

app.controller('PowerCtrl', function ($scope, $http, $interval, $ionicSlideBoxDelegate, $ionicSideMenuDelegate) {
    $scope.toggleLeft = function() {
        $ionicSideMenuDelegate.toggleLeft();
    };

    $http.get('https://api.malt.no/power/watts/10').then(function (res) {
        meter.gauge.refresh(res.data.watt);
    });
    var stopWattNow = $interval(function () {
        $http.get('https://api.malt.no/power/watts/10').then(function (res) {
            // console.log("Got data:", res.data.watt);
            meter.gauge.refresh(res.data.watt);
        });
    }, 2000);

    var getUsageLastHour = $interval(function () {

    });
});
