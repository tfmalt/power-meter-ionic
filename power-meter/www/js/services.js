/**
 * Created by tm on 01/11/14.
 */

var powerServices = angular.module('powerServices', ['ngResource']);

powerServices.factory('Power', ['$resource',
    function($resource) {
        return $resource('https://api.malt.no/power/:service/:interval');
    }
]);