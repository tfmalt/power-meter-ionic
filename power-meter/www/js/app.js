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

var app = angular.module('power', ['ionic', 'powerServices', 'fbServices']);

app.run(['$ionicPlatform', '$interval', 'PowerWatts', 'PowerKwh',
    function ($ionicPlatform, $interval, PowerWatts, PowerKwh) {
    $ionicPlatform.ready(function () {
        console.log("Got platform ready in run");
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
        }, 1000);

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

app.controller('OptionsCtrl', [
    '$scope','$ionicPlatform', '$ionicBackdrop', '$timeout', 'FBs',
    function ($scope, $ionicPlatform, $ionicBackdrop, $timeout, FBs) {

        $scope.fbSignInStatus = "Sign in with Facebook";
        $scope.loginStatus = "You're not signed in";

        $ionicPlatform.ready(function () {
            console.log("Got platform ready in options controller");

            FBs.getLoginStatus().then(
                function (res) {
                    console.log("got getLoginStatus promise: ", res);
                    meter.fb.login = res;
                    if (res.status === "connected") {
                        $scope.fbSignInStatus = "Log out from Facebook";
                        console.log("got 'connected' from getLoginStatus");
                    }
                },
                function (err) {
                    console.log("got error from getloginstatus: ", err);
                }
            ).then(
                function () {
                    if (meter.fb.login.status !== "connected") return;
                    if (meter.fb.user !== null) return;

                    console.log("after status need to get user info.");
                }
            );
        });

        $scope.handleLogin = function () {
            console.log("got call to handle login.");
            gplus.login();
        };

        $scope.handleFacebookLogin = function () {
            console.log("got call to facebook login");
            $ionicBackdrop.retain();
            $timeout(function () {
                $ionicBackdrop.release();
            }, 2000);

            // facebookConnectPlugin.api('/me/picture?redirect=false', [],
            if (meter.fb.login.status === "connected") {
                console.log("Initiating logout...");
                FBs.logout().then(
                    function (res) {
                        console.log("got logout promise: ", res);
                        meter.fb.login.status = "unknown";
                        return FBs.getLoginStatus();
                    },
                    function (err) {
                        console.log("got logout error: ", err);
                    }
                ).then(
                    function (res) {
                        console.log("Did I get a status object: ", res);
                        meter.fb.login = res;
                        if (res.status !== "connected") {
                            $scope.fbSignInStatus = "Sign in with Facebook";
                        }
                    }
                );

            } else {
                console.log("initiating login...");
                FBs.login().then(
                    function (res) {
                        console.log("got login result from promise: ", res);
                        meter.fb.login = res;
                        if (res.status === "connected") {
                            $scope.fbSignInStatus = "Log out from Facebook";
                        }
                    }
                ).then(
                    function () {
                        if (meter.fb.login.status !== "connected") return;
                        console.log("After successful login fetching info");
                        return FBs.getUserProfile();
                    }
                ).then(
                    function (res) {
                        console.log("got user profile: ", res);
                    }
                ).catch(
                    function (error) {
                        console.log("got login error from promise: ", error);
                    }
                );
            }
        };
    }
]);

app.directive('powerUserItem', ['$interval', function ($interval) {
   return {
       restrict: 'E',
       template: '<ion-item class="item-thumbnail-left item-dark power-user-item">' +
            '<img src="{{userImageUrl}}">' +
            '<h2>{{loginStatus}}</h2>' +
            '<span id="user-status">{{userStatus}}</span> ' +
            '<span id="user-role">{{userRole}}</span>'
       ,
       link: function (scope, element, attrs) {
           console.log("link got called:");

           scope.userImageUrl = "img/person_128.png";
           scope.userStatus = "Please sign in with";
           scope.userRole = "Google+ or Facebook";

           $interval(function() {
                console.log("inside directive timeout: ", meter.fb);
           }, 1000);
       }
   };
}]);
