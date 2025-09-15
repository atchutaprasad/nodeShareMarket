var angleOneLoginBefore = localStorage.getItem('loginResponse');


var logOutAngleOneSession = () => {
    ajaxGETCall('/api/logOut', logOutAngleOneSessionCallback);
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

var selectedStokeSubmit = () => {
    ajaxPOSTCall('/api/stokeSelected', { selectedStoke: $('#stokeSelected').val() }, selectedStokeSubmitCallback);
}

var profileDetails = () => {
    ajaxGETCall('/api/profileDetails', profileDetailsCallback);
}

var profileDetailsCallback = (res) => {
    var html = '<div>'
    $.each(res.data, function (key, value) {
        html += '<div><label style="width:200px">' + key + '</label>: ' + value + '</div>';
    });
    html += '<div>'
    document.getElementById("profiledetails").innerHTML = html;
}

var rmsDetails = () => {
    ajaxGETCall('/api/rmsDetails', rmsDetailsCallback);
}

var rmsDetailsCallback = (res) => {
    var html = '<div>'
    $.each(res.data, function (key, value) {
        html += '<div><label style="width:200px">' + key + '</label>: ' + value + '</div>';
    });
    html += '<div>'
    document.getElementById("rmsdetails").innerHTML = html;
}


var selectedStokeSubmitCallback = (response) => {
    document.getElementById('result').innerHTML = `Title: ${response.message}`;
}


var onLoadEvents = () => {
    if (localStorage.getItem('auth')) {
        $('#angleOneCode').show();
        $('#generateSession').hide();
    }
}

window.addEventListener('load', function () {
    onLoadEvents();
});


