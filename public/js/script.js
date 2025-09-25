var constants = {
    profileDetailsLoaded :false,
    rawStokeDetailsLoaded :false,
    rmsDetailsLoaded :false,
    intradayDetailsLoaded :false,
    intradayStokesLoaded: false
}
var ajaxPOSTCall = (api, postData, callback) => {
    $('.preloader-overlay').show();
    let xhr = new XMLHttpRequest();
    xhr.open('POST', api, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    if (localStorage.getItem('auth')) {
        xhr.setRequestHeader('Authorization', `Bearer ${getAuthenticator()}`);
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let data = JSON.parse(xhr.responseText);
            console.log(data);
            if (data.message === "Invalid Token") {
                localStorage.clear();
                $('#angleOneCode').hide();
                $('#generateSession').show();
                alert('In valid token, Please login to start');
            } else {
                callback(data);
            }
        } else if (xhr.readyState === 4 && xhr.status !== 200) {
            alert('Ajax POST call failed');
            console.error('AJAX POST call failed! Status:', xhr.status);
        }
        $('.preloader-overlay').hide();
    };
    xhr.send(JSON.stringify(postData));
    return false;
}
var ajaxGETCall = (api, callback) => {
    $('.preloader-overlay').show();
    let xhr = new XMLHttpRequest();
    xhr.open('GET', api, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    if (localStorage.getItem('auth')) {
        xhr.setRequestHeader('Authorization', `Bearer ${getAuthenticator()}`);
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let data = JSON.parse(xhr.responseText);
            console.log(data);
            if (data.message === "Invalid Token") {
                localStorage.clear();
                $('#angleOneCode').hide();
                $('#generateSession').show();
                alert('In valid token, Please login to start');
            } else {
                callback(data);
            }
        } else if (xhr.readyState === 4 && xhr.status !== 200) {
            alert('Ajax GET call failed');
            console.error('AJAX GET call failed! Status:', xhr.status);
        }
        $('.preloader-overlay').hide();
    };
    xhr.send();
    return false;
}

var includeJS = (src, cb) => {
    var script = document.createElement("SCRIPT");
    script.src = src;
    script.async = true;
    script.type = 'text/javascript';
    script.onload = function () {
        if (cb) cb()
    }
    document.getElementsByTagName("head")[0].appendChild(script);
}


var hideUnwantedTags = () => {
    if ($('.hideUnwantedTag').is(":visible")) {
        $('.hideUnwantedTag').hide();
    } else {
        $('.hideUnwantedTag').show();
    }
}

var enableTabs = (event) => {
    $('.tabsHide').hide();
    $('#'+ $(event.target).attr("data-tag")).show();
}

includeJS("/js/login.js");
includeJS("/js/session.js");

