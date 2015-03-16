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
 * Copyright (c) 2013-2015 Thomas Malt <thomas@malt.no>
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


var powerServices = angular.module('powerServices', ['ngResource']);

powerServices.factory('PowerWatts', ['$resource',
    function($resource) {
        return $resource('https://api.malt.no/power/watts/:interval');
    }
]);

powerServices.factory('PowerMeterTotal', ['$resource',
    function($resource) {
        return $resource('https://api.malt.no/power/meter/total');
    }
]);

powerServices.factory('PowerKwh', ['$resource',
    function ($resource) {
        return $resource('https://api.malt.no/power/kwh/:type/:count');
    }
]);

/**
 * A services factory to wrap the cordova facebook api into a well behaved
 * angular service. returns an object, which is nice, and uses promises,
 * which is nice.
 */
var fbServices = angular.module('fbServices', ['ng']);
fbServices.factory('FBs', ['$q', function($q) {
    // console.log("here we are in the factory facebook login");
    var fbs = {};

    /**
     * Wrapper for the facebook login function tailored to my specific need.
     *
     * @returns promise
     */
    fbs.login = function () {
        var deferred = $q.defer();

        if (!window.facebookConnectPlugin) {
            deferred.reject('facebookConnectPlugin does not exist');
            return deferred.promise;
        }

        facebookConnectPlugin.login(["public_profile"],
            function (res) {
                if (res.authResponse) {
                    deferred.resolve(res);
                } else {
                    deferred.reject("user cancelled or did not authorize");
                }
            },
            function (error) {
                deferred.reject(error)
            }
        );

        return deferred.promise;
    };

    /**
     * Wraps the getLoginStatus call in a promise
     *
     * @returns promise
     */
    fbs.getLoginStatus = function () {
        var deferred = $q.defer();

        if (!window.facebookConnectPlugin) {
            deferred.reject('facebookConnectPlugin does not exist in scope.');
            return deferred.promise;
        }

        facebookConnectPlugin.getLoginStatus(function (res) {
            deferred.resolve(res);
        });

        return deferred.promise;
    };

    fbs.logout = function () {
        var deferred = $q.defer();

        if (!window.facebookConnectPlugin) {
            deferred.reject('facebookConnectPlugin does not exist in scope.');
            return deferred.promise;
        }

        facebookConnectPlugin.logout(
            function (res) {
                deferred.resolve(res);
            },
            function (err) {
                deferred.reject(err);
            }
        );

        return deferred.promise;
    };

    fbs.getUserProfile = function () {
        var deferred = $q.defer();

        if (!window.facebookConnectPlugin) {
            deferred.reject('facebookConnectPlugin does not exist in scope.');
            return deferred.promise;
        }

        facebookConnectPlugin.api('/me', ["public_profile"],
            function (res) {
                facebookConnectPlugin.api('/me/picture?type=large&redirect=false', [],
                    function (data) {
                        console.log("got data from /me/picture: ", data, res);
                        res.pictureUrl = data.data.url;
                        deferred.resolve(res);
                    },
                    function (err) {
                        deferred.reject(err);
                    }
                )
                deferred.resolve(res);
            },
            function (err) {
                deferred.reject(err);
            }
        );

        return deferred.promise;
    };

    return fbs;
}]);

