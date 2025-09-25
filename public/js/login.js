var loginAngleOneSession = () => {
    ajaxGETCall('/api/log/login?totp=' + $('#totp').val(), angleOneLoginSessionCallback);
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

var fullyAutomateLogout = () => {
    ajaxGETCall('/api/log/fullyAutomateLogOut', fullyAutomateLogOutCallback);
}


var fullyAutomateLogOutCallback = (response) => {
    if (response.status) {
        localStorage.clear();
        $('#updates').hide();
        $('#generateSession').show();
    } else {
        alert('failed logout ' + response.message)
    }
}

var fullyAutomateLogin = () => {
    ajaxGETCall('/api/log/fullyAutomateLogin?totp=' + $('#totp').val(), fullyAutomateLoginCallback);
}

var fullyAutomateLoadStokes = () => {
    ajaxGETCall('/api/intraday/fullyAutomateLoadStokes', fullyAutomateLoginCallback);
}

var fullyAutomateLoginCallback = (res) => {
    if (res && res.length) {
        $('#updates').show();
        $('#generateSession').hide();
        localStorage.setItem('setAutoLogin', 'true');
        $('#updates').show();
        var html = '';
        $.each(res, function (index, obj) {
            html += `<tr><td>${index}</td><td>${obj.Exchange}</td><td>${obj.name}</td><td>${obj.Multiplier}</td><td>${obj.token}</td><td>${obj.symbol}</td><td>${obj.lotsize}</td><td>${obj.strike}</td></tr>`;
        });
        html += '';
        document.getElementById("fullyAutoMateStokes").innerHTML = html;
    } else {
        alert('login failed');
        $('#updates').hide();
        $('#generateSession').show();
        localStorage.setItem('setAutoLogin', 'false');
    }
}

var generateSession = () => {
    ajaxGETCall('/api/checker/generateToken?refreshToken=' + getRefreshToken(), generateSessionCallback);
}

var generateSessionCallback = () => { }


var setAuthenticator = (response) => {
    localStorage.setItem('auth', response.data.jwtToken);
    localStorage.setItem('loginResponse', JSON.stringify(response.data));
}


var setAutoLogin = (set) => {
    localStorage.setItem('setAutoLogin', set);
}

var getAutoLogin = () => {
    localStorage.getItem('setAutoLogin');
}

var getAuthenticator = () => {
    return localStorage.getItem('auth');
}
var getRefreshToken = () => {
    return JSON.parse(localStorage.getItem('loginResponse')).refreshToken;
}

