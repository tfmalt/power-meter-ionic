/*
 * Power meter app. An express frontend to reading a power meter with a
 * flashing led using a photo resistive sensor on an Arduino Uno board.
 *
 * This is most of all a toy experiment to get me up to speed on some of
 * the latest web technologies.
 *
 * @author Thomas Malt <thomas@malt.no>
 * @copyright Thomas Malt <thomas@malt.no>
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2013-2014 Thomas Malt <thomas@malt.no>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

/**
 * App file for the power meter ionic app.
 */

var app = angular.module('power', ['ionic', 'powerServices']);

app.run(['$ionicPlatform', '$interval', 'PowerWatts', 'PowerKwh',
    function ($ionicPlatform, $interval, PowerWatts, PowerKwh) {
    $ionicPlatform.ready(function () {
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

        meter.initialize.gauge(PowerWatts);
        meter.initialize.hourChart(PowerWatts);
        // Delaying loading graphs on page two to give first page
        // time to load.
        setTimeout(function () {
            meter.initialize.threeDaysChart(PowerKwh);
            meter.initialize.monthChart(PowerKwh);
            meter.initialize.weeklyChart(PowerKwh);
        }, 3000);

    });
}]);

app.controller('DailyCtrl', ['$scope', 'PowerWatts', 'PowerMeterTotal', 'PowerKwh', '$interval',
    '$ionicSlideBoxDelegate', '$ionicSideMenuDelegate',
    function(
        $scope, PowerWatts, PowerMeterTotal, PowerKwh,
        $interval, $ionicSlideBoxDelegate, $ionicSideMenuDelegate
        ) {
        // meter.initialize();
        $scope.toggleLeft = function() {
            console.log("toggle left in daily graphs");
            $ionicSideMenuDelegate.toggleLeft();
        };

        PowerKwh.get({type: 'day', count: 1}, function (d) {
            $scope.kwhYesterday = d.items[0].kwh.toFixed(2);
        });

        PowerMeterTotal.get({}, function (d) {
            $scope.meterTotal = (d.value + parseFloat(d.delta)).toFixed(2);
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

                meter.hourChart.load({
                    columns: [
                        times,
                        values
                    ]
                })
            });
        }, 60000);

        $scope.watts = 0;
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
                $scope.meterTotal = (d.value + parseFloat(d.delta)).toFixed(2);
            });
        }, 60000);


    }
]);

app.controller('WeeklyCtrl',
    ['$scope', '$interval', '$ionicSlideBoxDelegate', '$ionicSideMenuDelegate', 'PowerKwh',
    function (
        $scope, $interval, $ionicSlideBoxDelegate, $ionicSideMenuDelegate, PowerKwh
    ) {
        $scope.toggleLeft = function() {
            console.log("toggle left in weekly graphs");
            $ionicSideMenuDelegate.toggleLeft();
        };

        /**
         * Interval handling reloading of the three days chart.
         */
        $interval(function () {
            meter.load.threeDaysChart(PowerKwh);
        }, 180000);

        $interval(function () {
            meter.load.weeklyChart(PowerKwh);
        }, 360000);
    }
]);

app.controller('OptionsCtrl', ['$scope', function ($scope) {

    $scope.fbSignInStatus = "Sign in with Facebook";
    facebookConnectPlugin.getLoginStatus(function (res) {
        if (res.status === "connected") {
            $scope.fbSignInStatus = "Log out from Facebook";
        }
    });

    $scope.handleLogin = function() {
        console.log("got call to handle login.");
        gplus.login();
    };

    $scope.handleFacebookLogin = function () {
        console.log("got call to facebook login");
        facebookConnectPlugin.getLoginStatus(function (res) {
            console.log("facebook login status: ", res);
            if (res.status === 'connected') {
                console.log("connected");
                facebookConnectPlugin.api('/me', function (res) {
                    console.log("Got personal info: ", res);
                });
            }
            else if (res.status === 'not_authorized') {
                // the user is logged into facebook but has not authorized
                // the app.
            }
            else {
                // the user isn't logged in.
                console.log("initiating login...");
                facebookConnectPlugin.login(["public_profile"],
                    function (res) {
                        console.log("Got facebook login reply: ", res);
                        if (res.authResponse) {
                            facebookConnectPlugin.api('/me', function (res) {
                                console.log("Got personal info: ", res);
                            });
                        }
                        else {
                            console.log('user cancelled or did not authorize');
                        }
                    },
                    function (error) {
                        console.log("Got login error: ", error);
                    }
                );
            }
        });
    }
}]);

