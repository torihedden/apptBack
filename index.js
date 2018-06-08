require('dotenv').config();
const express = require('express');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const app = express();

const corsOptions = {
  origin: '*'
};

MongoClient.connect(process.env.MONGODB_URI, function (err, client) {
  if (err) {
    console.log(err);
  }
  let db = client.db(process.env.DB_NAME);

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({extended: true}));

  app.get('/appointments', function (request, response) {
    db.collection('appointments').find({})
      .toArray((error, appointments) => {
        response.send(appointments);
      })
  });

  app.get('/appointments/search/:param?', function (request, response) {
    let searchOptions = {};
    let param = request.params.param;

    if (param) {
      searchOptions = { description: new RegExp(param, "i") };
    }

    db.collection('appointments').find(searchOptions)
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

  app.delete('/appointments', function (request, response) {
    const {id} = request.body;
    db.collection('appointments').deleteOne({_id: id}, function (error, response) {
      if (error) {
        response.send('Error occured when attempting to delete appointment.');
      } else {
        response.send('Successfully deleted');
      }
    })
  })

  app.listen(process.env.PORT);
  console.log('listening on port ' + process.env.PORT);
})
