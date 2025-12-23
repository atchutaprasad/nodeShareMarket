const { exec } = require('child_process');
const axiosClient = require('../axiosInterceptor');


const execAsync = (cmd) => new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
        if (error) return reject(error.message);
        if (stderr) return reject(stderr);
        resolve(stdout);
    });
});

const restartPM2Server = async (req, res) => {
    //res.json({ status: true, message: `PM2 server restarted successfully: get` });

    try {
        const output = await execAsync('pm2 restart server.js');
        res.json({ success: true, output });
    } catch (err) {
        res.status(500).json({ success: false, error: err });
    }


    // await exec('pm2 restart server.js', (error, stdout, stderr) => {
    //     if (error) {
    //         console.error(`Error: ${error.message}`);
    //         return res.json({ status: false, message: `Error restarting PM2 server: ${error.message}` });
    //     }
    //     if (stderr) {
    //         console.error(`Stderr: ${stderr}`);
    //         return res.json({ status: false, message: `PM2 stderr: ${stderr}` });
    //     }
    //     console.log(`Stdout: ${stdout}`);
    //     res.json({ status: true, message: `PM2 server restarted successfully: ${stdout}` });
    // });
}
const startPM2Server = (req, res) => {
    res.json({ status: true, message: `PM2 server started successfully: ----` });
    // exec('pm2 start server.js -f', (error, stdout, stderr) => {

    //     exec('pm2 startup', (errorstartup, stdoutstartup, stderrstartup) => {
    //         exec('pm2 save', (errorsave, stdoutsave, stderrsave) => {
    //             if (error) {
    //                 return res.json({ status: false, message: `Error starting PM2 server: ${error.message}` });
    //             }
    //             if (stderr) {
    //                 return res.json({ status: false, message: `PM2 stderr: ${stderr}` });
    //             }
    //             res.json({ status: true, message: `PM2 server started successfully: ${stdout}` });

    //         })

    //     })

    // });

}
const stopPM2Server = (req, res) => {
    res.json({ status: true, message: `PM2 server stopped successfully: ----` });
    // exec('pm2 stop server', (error, stdout, stderr) => {
    //     if (error) {
    //         return res.json({ status: false, message: `Error stopping PM2 server: ${error.message}` });
    //     }
    //     if (stderr) {
    //         return res.json({ status: false, message: `PM2 stderr: ${stderr}` });
    //     }
    //     res.json({ status: true, message: `PM2 server stopped successfully: ${stdout}` });
    // });
}
const getRefreshMetrics = (req, res) => {
    try {
        res.json({ success: true, metrics: axiosClient.metrics });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message || err });
    }
}
module.exports = {
    restartPM2Server, startPM2Server, stopPM2Server, getRefreshMetrics
};