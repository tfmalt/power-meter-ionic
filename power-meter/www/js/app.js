/**
 * App file for the
 * @type {{}}
 */

var meter = {};
meter.initialize = {};
meter.initialize.gauge = function (PowerWatts) {
    PowerWatts.get({interval: 10}, function(p) {
        meter.gauge = c3.generate({
            bindto: '#meter',
            size: {
                width: 320,
                height: 300
            },
            data: {
                columns: [
                    ['data', p.watt]
                ],
                type: 'gauge'
            },
            gauge: {
                label: {
                    format: function (value, ratio) {
                        return '';
                    },
                    show: true
                },
                min: 0,
                max: 12000,
                units: '',
                width: 42
            },
            color: {
                pattern: ['#43cee6', '#f0b840', '#ef4e3a'],
                threshold: {
                    unit: 'value',
                    max: 12000,
                    values: [6000, 9000, 12000]
                }
            }
        });
    });
};

meter.initialize.hourChart = function (PowerWatts) {
    PowerWatts.get({interval: 'hour'}, function (d) {
        var values = d.items.map(function(item) { return item[1]; });
        var times  = d.items.map(function(item) { return item[0]; });

        values.unshift('data1');
        times.unshift('x');
        meter.hourChart = c3.generate({
            bindto: '#hourChart',
            size: { height: 148 },
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
                        {value: 2000, text: '2000 W'},
                        {value: 4000, text: '4000 W'},
                        {value: 6000, text: '6000 W'},
                        {value: 8000, text: '8000 W'},
                        {value: 10000, text: '10000 W'}
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
};


var hourChart = {};

var app = angular.module('power', ['ionic', 'powerServices']);

app.run(['$ionicPlatform', 'PowerWatts',
    function ($ionicPlatform, PowerWatts) {
    $ionicPlatform.ready(function () {
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

        meter.initialize.gauge(PowerWatts);
        meter.initialize.hourChart(PowerWatts);

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
            var total = (d.value + parseFloat(d.delta)).toFixed(2);
            $scope.meterTotal = total;
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

                meter.hourChart.load({
                    columns: [
                        times,
                        values
                    ]
                })
            });
        }, 60000);

        $scope.watts = 0000;
        $interval(function () {
            PowerWatts.get({interval: 10}, function(p) {
                $scope.watts = p.watt;
                meter.gauge.load({
                    columns: [['data', p.watt]]
                });
            });
        }, 2000);

        $interval(function () {
            PowerMeterTotal.get({}, function (d) {
                var total = (d.value + parseFloat(d.delta)).toFixed(2);
                $scope.meterTotal = total;
            });
        }, 60000);


    }
]);

