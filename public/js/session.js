var angleOneLoginBefore = localStorage.getItem('loginResponse');


/* logout scripts starts */
var logOutAngleOneSession = () => {
    ajaxGETCall('/api/log/logOut', logOutAngleOneSessionCallback);
}
var logOutAngleOneSessionCallback = (response) => {
    if (response.status) {
        localStorage.clear();
        $('#angleOneCode').hide();
        $('#generateSession').show();
    } else {
        alert('failed logout ' + response.message)
    }
}
/* logout scripts ends */


/* stoke selected starts */
var selectedStokeSubmit = () => {
    ajaxPOSTCall('/api/checker/stokeSelected', { selectedStoke: $('#stokeSelected').val() }, selectedStokeSubmitCallback);
}
var selectedStokeSubmitCallback = (response) => {
    document.getElementById('result').innerHTML = `Title: ${response.message}`;
}
/* stoke selected ends */


/* profile details starts */
var profileDetails = (event) => {
    enableTabs(event);
    if (!constants.profileDetailsLoaded) {
        constants.profileDetailsLoaded = true;
        ajaxGETCall('/api/checker/profileDetails', profileDetailsCallback);
    }

}
var profileDetailsCallback = (res) => {
    var html = '<div>'
    $.each(res.data, function (key, value) {
        html += '<div><label style="width:200px">' + key + '</label>: ' + value + '</div>';
    });
    html += '</div>'
    document.getElementById("profiledetails").innerHTML = html;
}
/* profile details ends */


/* RMS details starts */
var rmsDetails = (event) => {
    enableTabs(event);
    if (!constants.rmsDetailsLoaded) {
        constants.rmsDetailsLoaded = true;
        ajaxGETCall('/api/checker/rmsDetails', rmsDetailsCallback);
    }
}
var rmsDetailsCallback = (res) => {
    var html = '<div>'
    $.each(res.data, function (key, value) {
        html += '<div><label style="width:200px">' + key + '</label>: ' + value + '</div>';
    });
    html += '</div>'
    document.getElementById("rmsdetails").innerHTML = html;
}
/* RMS details ends */


/* Load Raw stokes starts */
var loadRawStokes = (event) => {
    enableTabs(event);
    if (!constants.rawStokeDetailsLoaded) {
        constants.rawStokeDetailsLoaded = true;
        ajaxGETCall('/api/intraday/insertRawStokes', loadRawStokesCallback);
    }
}
var loadRawStokesCallback = (res) => {
    var html = ''
    $.each(res, function (index, obj) {
        html += `<tr><td>${index}</td><td>${obj.token}</td><td>${obj.symbol}</td><td>${obj.name}</td><td>${obj.instrumenttype}</td><td>${obj.tick_size}</td><td>${obj.lotsize}</td><td>${obj.strike}</td></tr>`;
    });
    html += ''
    document.getElementById("loadRawStokesData").innerHTML = html;
}
/* Load Raw stokes ends */

/* Load Raw stokes starts */
var intradayStokes = (event) => {
    enableTabs(event);
    if (!constants.intradayStokesLoaded) {
        constants.intradayStokesLoaded = true;
        ajaxGETCall('/api/intraday/insertIntradayStokes', intradayStokesCallback);
    }
}
var intradayStokesCallback = (res) => {
    var html = ''
    $.each(res, function (index, obj) {
        html += `<tr><td>${index}</td><td>${obj.Exchange}</td><td>${obj.name}</td><td>${obj.Multiplier}</td><td>${obj.token}</td><td>${obj.symbol}</td><td>${obj.lotsize}</td><td>${obj.strike}</td></tr>`;
    });
    html += '';
    document.getElementById("intradayStokesData").innerHTML = html;
}
/* Load Raw stokes ends */

/* Load Raw stokes starts */
var intradayFetchStokes = (event) => {
    enableTabs(event);
    if (!constants.intradayFetchStokesLoaded) {
        constants.intradayFetchStokesLoaded = true;
        ajaxGETCall('/api/intraday/fetchIntradayStokes', intradayStokesCallback);
    }
}
// var intradayFetchStokesCallback = (res) => {
//     var html = ''
//     $.each(res, function (index, obj) {
//         html += `<tr><td>${index}</td><td>${obj.Exchange}</td><td>${obj.name}</td><td>${obj.Multiplier}</td><td>${obj.token}</td><td>${obj.symbol}</td><td>${obj.lotsize}</td><td>${obj.strike}</td></tr>`;
//     });
//     html += '';
//     document.getElementById("intradayStokesData").innerHTML = html;
// }
/* Load Raw stokes ends */

var checkSession = () => {
    ajaxGETCall('/api/checker/fullyAutomateProfileDetails', (res) => {
        if (res.status) {
            //alert('session active');
            $('#updates').show();
            $('#generateSession').hide();
            fullyAutomateLoadStokes();
        }
        else {
           // alert('session expired');
            $('#updates').hide();
            $('#generateSession').show();
        }
    });
}


var logOutAngleOneSession = () => {
    ajaxGETCall('/api/log/logOut', logOutAngleOneSessionCallback);
}
var logOutAngleOneSessionCallback = (response) => {
    if (response.status) {
        localStorage.clear();
        $('#angleOneCode').hide();
        $('#generateSession').show();
    } else {
        alert('failed logout ' + response.message)
    }
}

var onLoadEvents = () => {
    if (localStorage.getItem('setAutoLogin') && (localStorage.getItem('setAutoLogin') === 'true' || localStorage.getItem('setAutoLogin') === true)) {
        $('#updates').show();
        $('#generateSession').hide();
        checkSession();
    } else {
        $('#updates').hide();
        $('#generateSession').show();
    }
    if (localStorage.getItem('auth')) {
        $('#angleOneCode').show();
        $('#generateSession').hide();
    }

    // const socket = io();
    // socket.on('serverData', (data) => {
    //     const updatesDiv = document.getElementById('updates');
    //     const p = document.createElement('p');
    //     p.textContent = data.message;
    //     console.log(data.message);
    // });

}

window.addEventListener('load', function () {
    onLoadEvents();
});


