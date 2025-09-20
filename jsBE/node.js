let { SmartAPI, WebSocket, WebSocketV2 } = require('smartapi-javascript');
var axios = require("axios");
const nodeJS = require('./jsBE/node');
const angleOneJS = require('./jsBE/parameters');
//const { default: mongoose } = require('mongoose');
//var bodyParser = require('body-parser');

const Intraday = require('./jsBE/scema/intradayStoke.model')

app.delete('/api/insertIntradayList', async (req, res) => {
   try {
      //delete All
      //const result = await Intraday.deleteMany({});
      //console.log(`${result.deletedCount} documents deleted.`);
      //res.status(200).json({})

      //Insert One Record
      //const iStoke = await Intraday.create(req.body);
      //res.status(200).json(iStoke)


      //find one Record - method GET
      // const iStoke = await Intraday.findById('68cd8d5a6cbd710c82caece4');
      // res.status(200).json(iStoke)

      //update one Record - method PUT
      // const iStoke = await Intraday.findByIdAndUpdate('68cd8d5a6cbd710c82caece4', req.body);
      // if(!iStoke){
      //    return res.status(404).json({message: "stoke not found"})
      // }
      // const updatedIstoke = await Intraday.findById('68cd8d5a6cbd710c82caece4')
      // res.status(200).json(updatedIstoke)


      //delete one Record - method delete
      //    const iStoke = await Intraday.findByIdAndDelete('68cd8d5a6cbd710c82caece4', req.body);
      //    if(!iStoke){
      //       return res.status(404).json({message: "stoke not found"})
      //    }
      //   res.status(200).json({message: "stoke deleted succesfully"})

   } catch (error) {
      res.status(500).json({ message: error.message })
   }
});


// app.get('/api/forLoopTest', (req, res) => {
//    const arr = Array(9999).fill(3);
//    var x = 0;
//     console.time('for loop');
//     for (let i = 0, len = arr.length; i < len; i++) {
//         x = x + arr[i]
//     }
//     console.timeEnd('for loop');
//    res.json({"x": x})
// });



// app.get('/api/forLoopTest', (req, res) => {
//    const arr = Array(9999).fill(3);
//    var x = 0;
//     console.time('for loop');
//     for (let i = 0, len = arr.length; i < len; i++) {
//         x = x + arr[i]
//     }
//     console.timeEnd('for loop');
//    res.json({"x": x})
// });