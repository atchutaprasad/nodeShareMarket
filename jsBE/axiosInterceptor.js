const axios = require('axios');
const axiosInstance = axios.create();
//const axiosNoAuth = axios.create();
const AutoLogin = require('./scema/loginDetails.model');
//const parameters = require('./parameters');

const DEFAULT_HEADERS = {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-UserType': process.env.X_USER_TYPE || 'USER',
    'X-SourceID': process.env.X_SOURCE_ID || 'WEB',
    'X-ClientLocalIP': process.env.X_CLIENT_LOCAL_IP || '192.168.0.108',
    'X-ClientPublicIP': process.env.X_CLIENT_PUBLIC_IP || '192.168.0.1',
    'X-MACAddress': process.env.X_MAC_ADDRESS || 'E4-B9-7A-08-0D-2B',
    'X-PrivateKey': process.env.X_PRIVATE_KEY || 'jkFNrQQQ'
};

// Request interceptor: attach default headers and Authorization (if available in DB)
axiosInstance.interceptors.request.use(async (config) => {
    //console.log('Axios Interceptor Invoked with config:', config.url || 'no url');
    try {
        
        if(DEFAULT_HEADERS.Authorization){
            delete DEFAULT_HEADERS.Authorization;
        }
        config.headers = DEFAULT_HEADERS;//Object.assign({}, DEFAULT_HEADERS, config.headers || {});
        
        const loginDetailsObj = await AutoLogin.findOne({});
        //console.log('Fetched login details for interceptor:', loginDetailsObj.session);
        // const authorization = 'Bearer ' + loginDetailsObj[0].session.data.jwtToken;

        if (loginDetailsObj && loginDetailsObj.session && loginDetailsObj.session.data && loginDetailsObj.session.data.jwtToken) {
            config.headers['Authorization'] = 'Bearer ' + loginDetailsObj.session.data.jwtToken;
            //console.log('Authorization header set in interceptor');
        }
        //console.log('Axios Interceptor Invoked with config:', config.headers);
    } catch (err) {
        console.error('axios request interceptor error:', err.message || err);
    }
    return config;
}, (error) => Promise.reject(error));

// Metrics for refresh attempts
const refreshMetrics = {
    attempts: 0,
    success: 0,
    failure: 0,
    lastAttempt: null
};

axiosInstance.interceptors.response.use((response) => {
    return response;
}, async (error) => {
    const originalRequest = error.config || {};
    try {
        console.log('Axios Response Interceptor Invoked for error:', error.message || originalRequest);
        // if (error && error.response && error.response.status === 401 && !originalRequest._retry) {
        //     originalRequest._retry = true;
        //     refreshMetrics.attempts += 1;
        //     refreshMetrics.lastAttempt = new Date();
        //     // Attempt to refresh token using stored login details
        //     const login = await AutoLogin.findOne({}).sort({ createdAt: -1 }).lean();
        //     if (!login || !login.session || !login.session.data || !login.session.data.refreshToken) {
        //         refreshMetrics.failure += 1;
        //         // clear stored login since refresh is impossible
        //         await AutoLogin.deleteMany({});
        //         return Promise.reject(error);
        //     }
        //     const authorization = 'Bearer ' + (login.session.data.jwtToken || '');
        //     const refreshToken = login.session.data.refreshToken;
        //     const tokenParams = parameters.generateToken(authorization, refreshToken);
        //     // Use axiosNoAuth to avoid triggering interceptors again
        //     let refreshResp;
        //     try {
        //         refreshResp = await axiosNoAuth(tokenParams);
        //     } catch (refreshErr) {
        //         console.error('Refresh request failed:', refreshErr && refreshErr.message ? refreshErr.message : refreshErr);
        //         refreshMetrics.failure += 1;
        //         // clear stored login on refresh failure
        //         await AutoLogin.deleteMany({});
        //         return Promise.reject(error);
        //     }
        //     if (refreshResp && refreshResp.data && refreshResp.data.data && refreshResp.data.data.jwtToken) {
        //         const newJwt = refreshResp.data.data.jwtToken;
        //         const newRefresh = refreshResp.data.data.refreshToken || refreshToken;
        //         // Update stored login details
        //         await AutoLogin.updateOne({ _id: login._id }, { $set: { 'session.data.jwtToken': newJwt, 'session.data.refreshToken': newRefresh } });
        //         refreshMetrics.success += 1;
        //         // Set Authorization header and retry original request
        //         originalRequest.headers = originalRequest.headers || {};
        //         originalRequest.headers['Authorization'] = 'Bearer ' + newJwt;
        //         return axiosInstance(originalRequest);
        //     } else {
        //         refreshMetrics.failure += 1;
        //         // clear stored login on refresh failure
        //         await AutoLogin.deleteMany({});
        //         return Promise.reject(error);
        //     }
        // }
    } catch (ex) {
        console.error('Token refresh failed:', ex && ex.message ? ex.message : ex);
        refreshMetrics.failure += 1;
        //try { await AutoLogin.deleteMany({}); } catch (e) { /* ignore */ }
    }
    return Promise.reject(error);
});

//module.exports = axiosInstance;
//module.exports.metrics = refreshMetrics;
//module.exports.clearStoredSessions = async () => { await AutoLogin.deleteMany({}); };

module.exports = axiosInstance;
