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


