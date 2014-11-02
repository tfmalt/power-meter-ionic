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

app.run(['$ionicPlatform', 'PowerWatts',
    function ($ionicPlatform, PowerWatts) {
    $ionicPlatform.ready(function () {
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

        meter.initialize();

        PowerWatts.get({interval: 'hour'}, function (d) {
            console.log("got watts hour in app.run: ", d.items);
            var values = d.items.map(function(item) { return item[1]; });
            var times  = d.items.map(function(item) { return item[0]; });

            values.unshift('data1');
            times.unshift('x');
            console.log("values in app run:" , values);
            console.log("times in app run:", times);
            hourChart = c3.generate({
                bindto: '#hourChart',
                size: { height: 144 },
                padding: {
                    left: 20,
                    right: 20,
                    top: 0,
                    bottom: 0
                },
                legend: { show: false },
                point: { show: false },
                axis: {
                    x: {
                        show: true,
                        tick: {
                            count: 12
                        },
                        type: 'categorized'
                    },
                    y: {
                        show: false,
                        tick: {
                            count: 4
                        }
                    }
                },
                grid: {
                    y: {
                        lines: [
                            {value: 2000, text: '2000 Watts'},
                            {value: 4000, text: '4000 Watts'},
                            {value: 4000, text: '6000 Watts'},
                            {value: 4000, text: '8000 Watts'}
                        ]
                    }
                },
                data: {
                    x: 'x',
                    columns: [
                        times,
                        values
                    ],
                    types: {
                        data1: 'area'
                    },
                    colors: {
                        data1: '#43cee6'
                    }
                }
            });

        });
    });
}]);

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

        $interval(function () {
            PowerWatts.get({interval: 'hour'}, function (d) {
                var values = d.items.map(function(item) { return item[1]; });
                var times  = d.items.map(function(item) { return item[0]; });

                values.unshift('data1');
                times.unshift('x');
                console.log("Got watts hour: ", Date());

                hourChart.load({
                    columns: [
                        times,
                        values
                    ]
                })
            });
        }, 60000);

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

