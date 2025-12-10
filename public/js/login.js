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
        constants.stokesList = res;
        $('#updates').show();
        $('#generateSession').hide();
        localStorage.setItem('setAutoLogin', 'true');
        var html = '';
        let response = res;
        var percentChange = response.map(item => item.open).join(',').split(',').map(Number)
        var percentChangeResult = percentChange.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        var x = 0;
        $.each(res, function (index, obj) {
            x += parseFloat(obj.percentChange);
            html += `<tr><td>${index}</td>
                    <td>${obj.name}</td>
                    <td>${obj.open}</td>
                    <td><div>${obj.ltp}</div></td>
                    <td>${obj.percentChange}</td>
                    </tr>`;
        });
        html += '';
        document.getElementById("fullyAutoMateStokes").innerHTML = html;
       // debugger
        document.getElementById("percentChangeResult").innerHTML = percentChangeResult + '%';
    } else {
        alert('login failed');
        $('#updates').hide();
        $('#generateSession').show();
        localStorage.setItem('setAutoLogin', 'false');
    }
}

var sortTable = (column) => {
    var stokes = []
    if(column === "name"){
        if(constants.stokesListIsAscending){
            constants.stokesListIsAscending = false;
            stokes = constants.stokesList.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            constants.stokesListIsAscending = true;
            stokes = constants.stokesList.sort((a, b) => b.name.localeCompare(a.name));
        }
    } else {
        if(constants.stokesListIsAscending){
            constants.stokesListIsAscending = false;
            stokes = constants.stokesList.sort((a, b) => b[column] - a[column]);
        } else {
            constants.stokesListIsAscending = true;
            stokes = constants.stokesList.sort((a, b) => a[column] - b[column]);
        }
    }
    fullyAutomateLoginCallback(stokes);
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

