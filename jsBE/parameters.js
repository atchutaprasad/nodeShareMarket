
var loginParams = (totp) => {
    var data = JSON.stringify({
        "clientcode": process.env.ANGEL_CLIENT_CODE || 'V112910',
        "password": process.env.ANGEL_PASSWORD || '1984',
        "totp": totp,
        "state": 'live-' + new Date().getTime()
    });
    //console.log('loginParams data - ', data);
    var config = {
        method: 'post',
        url: 'https://apiconnect.angelone.in/rest/auth/angelbroking/user/v1/loginByPassword',
        data: data
    };
   // console.log('loginParams config - ', config);
    return config;
}

var generateToken = (REFRESH_TOKEN) => {
    var data = JSON.stringify({
        "refreshToken": REFRESH_TOKEN
    });
    var config = {
        method: 'post',
        url: 'https://apiconnect.angelone.in/rest/auth/angelbroking/jwt/v1/generateTokens',
        data: data
    };
    return config;
}

var profileDetailsParams = () => {
    var config = {
        method: 'get',
        url: 'https://apiconnect.angelone.in/rest/secure/angelbroking/user/v1/getProfile',
    };
    return config;
}

var rmsDetailsParams = () => {
    var config = {
        method: 'get',
        url: 'https://apiconnect.angelone.in/rest/secure/angelbroking/user/v1/getRMS',
    };
    return config;
}

var loadRawStokesParams = () => {
    var config = {
        method: 'get',
        url: 'https://margincalculator.angelone.in/OpenAPI_File/files/OpenAPIScripMaster.json',
    };
    return config;
}

var intradayStokesParams = () => {
    var config = {
        method: 'get',
        url: 'https://apiconnect.angelone.in/rest/secure/angelbroking/marketData/v1/nseIntraday',
    };
    return config;
}

var intradayQuoatesParams = (data) => {
    var config = {
        method: 'post',
        url: 'https://apiconnect.angelone.in/rest/secure/angelbroking/market/v1/quote/',
        data: JSON.stringify(data)
    };
    return config;
}

var getCandleDataParams = (data) => {
    var config = {
        method: 'post',
        url: 'https://apiconnect.angelone.in/rest/secure/angelbroking/historical/v1/getCandleData',
        data: JSON.stringify(data)
    };
    return config;
}

var logOutParams = () => {
    var data = { clientcode: "V112910" }
    var config = {
        method: 'post',
        url: 'https://apiconnect.angelone.in/rest/secure/angelbroking/user/v1/logout',
        data: data
    };
    return config;
}



module.exports = { loginParams, generateToken, profileDetailsParams, rmsDetailsParams, loadRawStokesParams, intradayStokesParams, intradayQuoatesParams, logOutParams, getCandleDataParams };

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