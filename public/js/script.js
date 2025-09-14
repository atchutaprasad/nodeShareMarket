var ajaxPOSTCall = (api, postData, callback) => {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', api, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let data = JSON.parse(xhr.responseText);
            console.log(data);
            callback(data);
        } else if (xhr.readyState === 4 && xhr.status !== 200) {
            alert('Ajax POST call failed');
            console.error('AJAX call failed! Status:', xhr.status);
        }
    };
    xhr.send(JSON.stringify(postData));
    return false;
}
var ajaxGETCall = (api, callback) => {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', api, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let data = JSON.parse(xhr.responseText);
            console.log(data);
            callback(data);
        } else if (xhr.readyState === 4 && xhr.status !== 200) {
            alert('Ajax Get call failed');
            console.error('AJAX call failed! Status:', xhr.status);
        }
    };
    xhr.send();
    return false;
}

var loginAngleOneSession = () => {
     ajaxGETCall('/api/loginAngleOne?totp='+$('#totp').val(), angleOneLoginSessionCallback);
}

var logOutAngleOneSession = () => {
    ajaxGETCall('/api/loginAngleOne?totp='+$('#totp').val(), angleOneLogOutSessionCallback);
}

var angleOneLoginSessionCallback = (response) => {
    $('#angleOneCode').show();
    $('#generateSession').hide();
}

var angleOneLogOutSessionCallback = (response) => {
    $('#angleOneCode').hide();
    $('#generateSession').show();
}

var selectedStokeSubmit = () => {
    document.querySelector('#stokeSelected').addEventListener('submit', function (event) {
        event.preventDefault();
        ajaxPOSTCall('/api/stokeSelected', { selectedStoke: this.elements.stockSelected.value }, selectedStokeSubmitCallback);
    });
}

var generateAngleOneSession = () => {
    ajaxGETCall('/api/generateSession', angleOneLoginSessionCallback);
}

var selectedStokeSubmitCallback = (response) => {
    document.getElementById('result').innerHTML = `Title: ${response.message}`;
}

window.addEventListener('load', function () {
    selectedStokeSubmit();
});