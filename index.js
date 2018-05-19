const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const config = require('./config.json');

// the format of the config.json
// {
//   "dev" : {
//     "MONGODB_URI" : "mongoURLhere",
//     "DB_NAME"     : "dbNameHere"
//   },
// ...
// }

const environment = 'prod';

MongoClient.connect(config[environment].MONGODB_URI, function (err, client) {
  if (err) {
    console.log(err);
  }
  let db = client.db(config[environment].DB_NAME);

  app.use(express.json());
  app.use(express.urlencoded({extended: true}));

  app.get('/appointments', function (request, response) {
    db.collection('appointments').find({})
      .toArray((error, appointments) => {
        response.send(appointments);
      })
  });

  app.get('/appointments/search/:param', function (request, response) {
    let param = request.params.param;
    db.collection('appointments').find({ description: new RegExp(param, "i") })
      .toArray((error, appointments) => {
        response.send(appointments);
      })
  });

  app.post('/appointments/create', function (request, response) {
    const {dateTime, description} = request.body;
    db.collection('appointments').insertOne({dateTime: dateTime, description: description}, function (error, insertedDocument) {
      if (error) {
        response.send('Error occured when creating appointment.');
      } else {
        response.send(insertedDocument.ops[0]);
      }
    })
  });

  const port = 8085;
  app.listen(port);
  console.log('listening on port' + port);
})
