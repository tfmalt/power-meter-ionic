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

var hourChart = {};

var app = angular.module('power', ['ionic', 'powerServices']);

app.run(function($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the
        // accessory bar above the keyboard
        // for form inputs)
        // console.log("Running app.run");
        // if (window.cordova && window.cordova.plugins.Keyboard) {
        //     cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        // }

        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

        meter.initialize();
    });
});

app.controller('PowerCtrl', ['$scope', 'PowerWatts', 'PowerMeterTotal', 'PowerKwh', '$interval',
    '$ionicSlideBoxDelegate', '$ionicSideMenuDelegate',
    function(
        $scope, PowerWatts, PowerMeterTotal, PowerKwh,
        $interval, $ionicSlideBoxDelegate, $ionicSideMenuDelegate
        ) {
        // meter.initialize();
        $scope.toggleLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };

        PowerKwh.get({type: 'day', count: 1}, function (d) {
            $scope.kwhYesterday = d.items[0].kwh.toFixed(2);
        });

        PowerMeterTotal.get({}, function (d) {
            var total = (d.value + parseFloat(d.delta));
            $scope.meterTotal = Math.floor(total);
            $scope.meterDecimal = Math.floor(((total - $scope.meterTotal) * 10));
        });

        PowerKwh.get({type: 'today'}, function (d) {
            $scope.kwhToday = d.kwh.toFixed(2);
        });

        $interval(function () {
            PowerKwh.get({type: 'today'}, function (d) {
                $scope.kwhToday = d.kwh.toFixed(2);
            });
        }, 60000);

        hourChart = c3.generate({
            bindto: '#hourChart',
            size: { height: 100 },
            legend: { show: false },
            point: { show: false },
            axis: {
                x: {
                    show: true,
                    tick: {
                        count: 4
                    }
                }
            },
            data: {
                x: 'x',
                types: {
                    data1: 'area'
                },
                colors: {
                    data1: '#43cee6'
                }
            }
        });

        PowerWatts.get({interval: 'hour'}, function (d) {
            console.log("got watts hour: ", d.items);
            var values = d.items.map(function(item) { return item[1]; });
            values.unshift('data1');
            console.log("values:" , values);
            hourChart.load({
                columns: [
                    values
                ]
            })
        });

        PowerWatts.get({interval: 10}, function(p) {
            meter.gauge.refresh(p.watt);
        });

        $interval(function () {
            PowerWatts.get({interval: 10}).$promise.then(function(p) {
                meter.gauge.refresh(p.watt);
            });
        }, 2000);

        $interval(function () {
            PowerMeterTotal.get({}, function (d) {
                var total = (d.value + parseFloat(d.delta));
                $scope.meterTotal = Math.floor(total);
                $scope.meterDecimal = Math.floor(((total - $scope.meterTotal) * 10));
            });
        }, 60000);


    }
]);

