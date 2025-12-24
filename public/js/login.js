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

var fullyAutomateLTP = () => {
    ajaxGETCall('/api/intraday/fullyAutomateLTP', (function () { console.log('fully automate LTP') }));
}

var stopFullyAutomateLTP = () => {
    ajaxGETCall('/api/intraday/stopFullyAutomateLTP', (function () { console.log('stop fully automate LTP') }));
}


var getHistory = () => {
    ajaxGETCall('/api/lucky/history?fromDate=' + $('#fromDate').val() + '&toDate=' + $('#toDate').val(), fullyAutomateLoginCallback); 
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
                    <td>${htmlReturn(obj, obj.open, obj.openTime)}</td>
                    <td><div>${htmlReturn(obj, obj.ltp, obj.ltpTime, obj.ltpPercentage)}</div></td>
                    <td>${obj.history[0] ? obj.history[0] : ''}</td>
                    <td>${obj.history[1] ? obj.history[1] : ''}</td>
                    <td>${obj.percentChange ? obj.percentChange.toFixed(2) + '%' : ''}</td>
                    </tr>`;
        });
        html += '';
        document.getElementById("fullyAutoMateStokes").innerHTML = html;
        // debugger
        document.getElementById("percentChangeResult").innerHTML = percentChangeResult + '%';
    } else {
        alert('login failed  - intraday stokes not found');
        $('#updates').hide();
        $('#generateSession').show();
        localStorage.setItem('setAutoLogin', 'false');
    }
}

var htmlReturn = (obj, arrayElements, timer, ltpPercentage) => {
    //let ltpList = obj.split(',')
    let html = '';
    $.each(arrayElements, function (index, arrayElement) {
        console.log(obj.name, ltpPercentage)
        html += `${ltpPercentage && ltpPercentage[index] ? ltpPercentage[index].toFixed(2) + ' - ' : ''} ${arrayElement} - ${timer[index]} <br/>`;
    });
    return html;
}

var sortTable = (column) => {
    var stokes = []
    if (column === "name") {
        if (constants.stokesListIsAscending) {
            constants.stokesListIsAscending = false;
            stokes = constants.stokesList.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            constants.stokesListIsAscending = true;
            stokes = constants.stokesList.sort((a, b) => b.name.localeCompare(a.name));
        }
    } else if (column === "history") {
        if (constants.stokesListIsAscending) {
            constants.stokesListIsAscending = false;
          //  console.log('column - ' + column);
            stokes = constants.stokesList.sort((a, b) => (b.history[0].split(',')).at(-1) - (a.history[0].split(',')).at(-1));
        } else {
            constants.stokesListIsAscending = true;
            stokes = constants.stokesList.sort((a, b) => (a.history[0].split(',')).at(-1) - (b.history[0].split(',')).at(-1));
        }
    } else if (column === "volume") {
        if (constants.stokesListIsAscending) {
            constants.stokesListIsAscending = false;
            //console.log('column - ' + column);
            stokes = constants.stokesList.sort((a, b) => {
              //  console.log('a.history[1] - ' + a.history[1]);
             //   console.log('b.history[1] - ' + b.history[1]);

                return a.history[1] && b.history[1] ? (b.history[1]).localeCompare(a.history[1]) : 0;
            });
        } else {
            constants.stokesListIsAscending = true;
            stokes = constants.stokesList.sort((a, b) => {
                return a.history[1] && b.history[1] ? (a.history[1]).localeCompare(b.history[1]) : 0;
            });
        }
    } else {
        if (constants.stokesListIsAscending) {
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

