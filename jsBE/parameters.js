
var loginParams = (totp) => {
    var data = JSON.stringify({
        "clientcode": "V112910",
        "password": "1984",
        "totp": totp,
        "state": 'live' + new Date().getTime()
    });
    var config = {
        method: 'post',
        url: 'https://apiconnect.angelone.in/rest/auth/angelbroking/user/v1/loginByPassword',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-UserType': 'USER',
            'X-SourceID': 'WEB',
            'X-ClientLocalIP': '192.168.0.108',
            'X-ClientPublicIP': '192.168.0.1',
            'X-MACAddress': 'E4-B9-7A-08-0D-2B',
            'X-PrivateKey': 'jkFNrQQQ'
        },
        data: data
    };
    return config;
}

var generateToken = (authorization, REFRESH_TOKEN) => {
    var data = JSON.stringify({
        "refreshToken": REFRESH_TOKEN
    });
    var config = {
        method: 'post',
        url: 'https://apiconnect.angelone.in/rest/auth/angelbroking/jwt/v1/generateTokens',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authorization,
            'Accept': 'application/json',
            'X-UserType': 'USER',
            'X-SourceID': 'WEB',
            'X-ClientLocalIP': '192.168.0.108',
            'X-ClientPublicIP': '192.168.0.1',
            'X-MACAddress': 'E4-B9-7A-08-0D-2B',
            'X-PrivateKey': 'jkFNrQQQ'
        },
        data: data
    };
    return config;
}

var profileDetailsParams = (authorization) => {
    var config = {
        method: 'get',
        url: 'https://apiconnect.angelone.in/rest/secure/angelbroking/user/v1/getProfile',
        headers: {
            'Authorization': authorization,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-UserType': 'USER',
            'X-SourceID': 'WEB',
            'X-ClientLocalIP': '192.168.0.108',
            'X-ClientPublicIP': '192.168.0.1',
            'X-MACAddress': 'E4-B9-7A-08-0D-2B',
            'X-PrivateKey': 'jkFNrQQQ'
        }
    };
    return config;
}

var rmsDetailsParams = (authorization) => {
    var config = {
        method: 'get',
        url: 'https://apiconnect.angelone.in/rest/secure/angelbroking/user/v1/getRMS',
        headers: {
            'Authorization': authorization,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-UserType': 'USER',
            'X-SourceID': 'WEB',
            'X-ClientLocalIP': '192.168.0.108',
            'X-ClientPublicIP': '192.168.0.1',
            'X-MACAddress': 'E4-B9-7A-08-0D-2B',
            'X-PrivateKey': 'jkFNrQQQ'
        }
    };
    return config;
}

var loadRawStokesParams = (authorization) => {
    var config = {
        method: 'get',
        url: 'https://margincalculator.angelone.in/OpenAPI_File/files/OpenAPIScripMaster.json',
        headers: {
            'Authorization': authorization,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-UserType': 'USER',
            'X-SourceID': 'WEB',
            'X-ClientLocalIP': '192.168.0.108',
            'X-ClientPublicIP': '192.168.0.1',
            'X-MACAddress': 'E4-B9-7A-08-0D-2B',
            'X-PrivateKey': 'jkFNrQQQ'
        }
    };
    return config;
}

var intradayStokesParams = (authorization) => {
    var config = {
        method: 'get',
        url: 'https://apiconnect.angelone.in/rest/secure/angelbroking/marketData/v1/nseIntraday',
        headers: {
            'Authorization': authorization,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-UserType': 'USER',
            'X-SourceID': 'WEB',
            'X-ClientLocalIP': '192.168.0.108',
            'X-ClientPublicIP': '192.168.0.1',
            'X-MACAddress': 'E4-B9-7A-08-0D-2B',
            'X-PrivateKey': 'jkFNrQQQ'
        }
    };
    return config;
}

var logOutParams = (authorization) => {
    var data = { clientcode: "V112910" }
    var config = {
        method: 'post',
        url: 'https://apiconnect.angelone.in/rest/secure/angelbroking/user/v1/logout',
        headers: {
            'Authorization': authorization,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-UserType': 'USER',
            'X-SourceID': 'WEB',
            'X-ClientLocalIP': '192.168.0.108',
            'X-ClientPublicIP': '192.168.0.1',
            'X-MACAddress': 'E4-B9-7A-08-0D-2B',
            'X-PrivateKey': 'jkFNrQQQ'
        },
        data: data
    };
    return config;
}



module.exports = { loginParams, generateToken, profileDetailsParams, rmsDetailsParams, loadRawStokesParams, intradayStokesParams, logOutParams };

/*

app.post("/data", function (req, res) {
   res.send("We have got the post request on /data route");
})

app.get('/api/generateSession', async (req, res) => {
   res.json(angleOneJS.generateSession(req));
});


app.get('/api/data', (req, res) => {
   res.json({ message: nodeJS.greet('World') });
});
*/