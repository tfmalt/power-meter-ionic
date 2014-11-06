/**
 * Created by tm on 06/11/14.
 */

var gplus = {};
gplus.login = function() {
    console.log("google plus login called.");
    window.plugins.googleplus.login({
        'iOSApiKey': '230346417276-jut282tqmvcnnp7rumb11unjd8ar0qm8.apps.googleusercontent.com'
    },
        function (obj) {
            alert("Success: ", obj);
        },
        function (err) {
            console.log("Got error back: ", err);
            alert("Error: ", err);
        }
    );
};

/**
 * When the user comes back to your app and you're not sure if he needs
 * to log in, you can call trySilentLogin to try logging him in.
 *
 * If it succeeds you will get the same object as the login function gets,
 * but if it fails it will not show the authentication dialog to the user.
 *
 * The code is exactly the same a login, except for the function name.
 */
gplus.trySilentLogin = function() {
    console.log("before alert");
    console.log("after alert");
    window.plugins.googleplus.trySilentLogin(
        {
            'iOSApiKey': '230346417276-jut282tqmvcnnp7rumb11unjd8ar0qm8.apps.googleusercontent.com'
        },
        function (obj) {
            alert("Success: ", obj);
        },
        function (err) {
            console.log("got error back: ", err);
        }
    );
};

/**
 * This will clear the OAuth2 token.
 */
gplus.logout = function() {
    window.plugins.googleplus.logout(
        function (msg) {
            alert("Log out: ", msg);
        }
    );
};

/**
 * This will clear the OAuth2 token and forget which account was used to
 * login. On Android this will always force the user to authenticate the
 * app again, on iOS using logout seems to do the job already. Need to
 * investigate this a bit more..
 */
gplus.disconnect = function() {
    window.plugins.googleplus.disconnect(
        function (msg) {
           alert("Disconnect: ", msg);
        }
    );
};

window.onerror = function(what, line, file) {
    alert(what + '; ' + line + '; ' + file);
};

// function handleOpenURL (url) {
//     document.querySelector("#feedback").innerHTML = "App was opened by URL: " + url;
// }
