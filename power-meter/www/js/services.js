/**
 * Created by tm on 01/11/14.
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


