/**
 * A directive That creates a facebook login status overview.
 */
app.directive('powerUserItem', ['$interval', function ($interval) {
    return {
        restrict: 'E',
        template: '<ion-item class="item-thumbnail-left item-dark power-user-item">' +
        '<img src="{{userImageUrl}}">' +
        '<h2>{{loginStatus}}</h2>' +
        '<span id="user-status">{{userStatus}}</span> ' +
        '<span id="user-role">{{userRole}}</span>',
        link: function (scope) {
            function updateLoginStatus() {
                if (
                    meter.fb.login !== null &&
                    meter.fb.user !== null &&
                    meter.fb.login.status === "connected"
                ) {
                    scope.loginStatus = meter.fb.user.name;
                    scope.userStatus = "Signed in as";
                    scope.userRole = "Administrator";
                    scope.userImageUrl = meter.fb.user.pictureUrl;
                } else {
                    scope.loginStatus = "You're not signed in";
                    scope.userStatus = "Please sign in with";
                    scope.userRole = "Google+ or Facebook";
                    scope.userImageUrl = "img/person_128.png";
                }
            }

            updateLoginStatus();

            $interval(function () {
                updateLoginStatus();
            }, 1000);
        }
    };
}]);

