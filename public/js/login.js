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

var fullyAutomateSelectedStokes = () => {
    ajaxGETCall('/api/intraday/fullyAutomateSelectedStokes', fullyAutomateSelectedStokesCallback);
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

var fullyAutomateSelectedStokesCallback = (res) => {
    if (res && res.length) {
        constants.selectedStokesList = res;
        var html = '';
        var totalInvested = 0;
        var currentValue = 0;
        $.each(res, function (index, obj) {
            html += `<tr><td>${index}</td>
                    <td width="160px">${htmlReturn('open', obj, obj.open)}</td>
                    <td width="650px"><div><canvas id="${'test' + index}"></canvas></div></td>
                    <td width="140px">${obj.history[0] ? obj.history[0] : ''}</td>
                    <td>Percentage: ${obj.percentChange ? obj.percentChange + '%' : ''}<br/>
                        Volume: ${obj.history[1] ? obj.history[1] : ''}<br/>
                        Buy Price: ${obj.buyPrice ? obj.buyPrice : ''} <br/>
                        Buy Quantity: ${obj.buyQuantity ? obj.buyQuantity : ''} <br/>
                        Order ID: ${obj.orderId ? obj.orderId : ''}<br/>
                        Total Invested : ${obj.buyPrice && obj.buyQuantity ? (parseFloat(obj.buyPrice) * parseInt(obj.buyQuantity)).toFixed(2) : ''}<br/>
                        Last Traded Price : ${obj.ltp[obj.ltp.length - 1] ? obj.ltp[obj.ltp.length - 1] : ''}<br/>
                        Current Price : ${obj.ltp[obj.ltp.length - 1] && obj.buyQuantity ? (parseFloat(obj.ltp[obj.ltp.length - 1]) * parseInt(obj.buyQuantity)).toFixed(2) : ''}
                            <br/></td>
                    </tr>`;
            totalInvested += obj.buyPrice && obj.buyQuantity ? (parseFloat(obj.buyPrice) * parseInt(obj.buyQuantity)) : 0;
            currentValue += obj.ltp[obj.ltp.length - 1] && obj.buyQuantity ? (parseFloat(obj.ltp[obj.ltp.length - 1]) * parseInt(obj.buyQuantity)) : 0;

             document.getElementById("totalInvested").innerHTML = totalInvested.toFixed(2);
             document.getElementById("currentValue").innerHTML = currentValue.toFixed(2);
                     
            setTimeout(() => {
                var ctx = document.getElementById('test' + index).getContext('2d');
                var chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: obj.ltpTime,
                        datasets: [{
                            label: obj.name,
                            backgroundColor: 'rgb(255, 99, 132)',
                            borderColor: 'rgb(255, 99, 132)',
                            data: obj.ltpPercentage,
                            fill: true,
                        }]
                    },
                    options: {
                        responsive: true,
                        title: {
                            display: true,
                            text: 'LTP over Time'
                        },
                        tooltips: {
                            mode: 'index',
                            intersect: false,
                        },
                        hover: {
                            mode: 'nearest',
                            intersect: true
                        },
                        scales: {
                            x: {
                                display: true,
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Time'
                                }
                            },
                            y: {
                                display: true,
                                scaleLabel: {
                                    display: true,
                                    labelString: 'LTP Percentage'
                                }
                            }
                        }
                    },
                });
            }, 500);
        });
        html += '';
        document.getElementById("fullyAutoMateSelectedStokes").innerHTML = html;
        document.getElementById("stokeSelectedCount").innerHTML = constants.selectedStokesList.length;

    } else {
        alert('zero selected stokes found');
    }
}
//${htmlReturn('ltp', obj, obj.ltp)}
var fullyAutomateLoginCallback = (res) => {
    if (res && res.length) {
        constants.stokesList = res;
        $('#updates').show();
        $('#generateSession').hide();
        localStorage.setItem('setAutoLogin', 'true');
        var html = '';
        let response = res;
        // var percentChange = response.map(item => item.open).join(',').split(',').map(Number)
        // var percentChangeResult = percentChange.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        // var x = 0;
        $.each(res, function (index, obj) {
            //   x += parseFloat(obj.percentChange);
            html += `<tr><td>${index}</td>
                    <td>${obj.name}</td>
                    <td>${htmlReturn('open', obj, obj.open)}</td>
                    <td><div>${htmlReturn('ltp', obj, obj.ltp)}</div></td>
                    <td>${obj.history[0] ? obj.history[0] : ''}</td>
                    <td>${obj.history[1] ? obj.history[1] : ''}</td>
                    <td>${obj.percentChange ? obj.percentChange + '%' : ''}</td>
                    </tr>`;
        });
        html += '';
        document.getElementById("fullyAutoMateStokes").innerHTML = html;
        document.getElementById("stokeIntradayCount").innerHTML = constants.stokesList.length;
        // debugger
        // document.getElementById("percentChangeResult").innerHTML = percentChangeResult + '%';
    } else {
        alert('Intraday stokes not found');
        $('#updates').hide();
        $('#generateSession').show();
        localStorage.setItem('setAutoLogin', 'false');
    }
}

var htmlReturn = (identifier, obj, arrayElements, timer, ltpPercentage) => {
    //let ltpList = obj.split(',')
    let html = '';
    $.each(arrayElements, function (index, arrayElement) {
        console.log(obj.name, (obj.ltpPercentage && obj.ltpPercentage[index]) ? obj.ltpPercentage[index] : '');
        if (identifier === 'ltp') {
            html += `${obj.ltpPercentage[index]} - ${arrayElement} - ${obj.ltpTime[index]} <br/>`;
        }

        if (identifier === 'open') {
            html += `${arrayElement} - ${obj.openTime[index]} <br/>`;
        }

    });
    return html;
}

var sortTable = (tablename, column, stokeList, isAscending) => {

    var stokes = []
    if (column === "name") {
        if (isAscending) {
            stokes = stokeList.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            stokes = stokeList.sort((a, b) => b.name.localeCompare(a.name));
        }
    } else if (column === "history") {
        if (isAscending) {
            stokes = stokeList.sort((a, b) => (b.history[0].split(',')).at(-1) - (a.history[0].split(',')).at(-1));
        } else {
            stokes = stokeList.sort((a, b) => (a.history[0].split(',')).at(-1) - (b.history[0].split(',')).at(-1));
        }
    } else if (column === "volume") {
        if (isAscending) {
            stokes = stokeList.sort((a, b) => {
                return a.history[1] && b.history[1] ? (b.history[1]).localeCompare(a.history[1]) : 0;
            });
        } else {
            stokes = stokeList.sort((a, b) => {
                return a.history[1] && b.history[1] ? (a.history[1]).localeCompare(b.history[1]) : 0;
            });
        }
    } else {
        if (isAscending) {
            stokes = stokeList.sort((a, b) => a[column] - b[column]);
        } else {
            stokes = stokeList.sort((a, b) => b[column] - a[column]);
        }
    }
    if (tablename === 'fullyAutoMateStokes') {
        fullyAutomateLoginCallback(stokes);
        constants.stokesListIsAscending = !constants.stokesListIsAscending;
    } else {
        constants.selectedStokesListIsAscending = !constants.selectedStokesListIsAscending;
        fullyAutomateSelectedStokesCallback(stokes);
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

