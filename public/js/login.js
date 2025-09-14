var loginAngleOneSession = () => {
    ajaxGETCall('/api/login?totp=' + $('#totp').val(), angleOneLoginSessionCallback);
}

var angleOneLoginSessionCallback = (response) => {
    if (response.status) {
        setAuthenticator(response);
        $('#angleOneCode').show();
        $('#generateSession').hide();
    } else {
        alert('failed ' + response.message)
    }
}

var generateSession = () => {
    ajaxGETCall('/api/generateToken?refreshToken='+getRefreshToken(), generateSessionCallback);
}

var generateSessionCallback = () => {}


var setAuthenticator = (response) => {
    localStorage.setItem('auth', response.data.jwtToken);
    localStorage.setItem('loginResponse', JSON.stringify(response.data));
}

var getAuthenticator = () => {
    return localStorage.getItem('auth');
}
var getRefreshToken = () => {
    return JSON.parse(localStorage.getItem('loginResponse')).refreshToken;
}

