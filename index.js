const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const { getAuth } = require("firebase-admin/auth");
const { MongoClient } = require('mongodb');
require('dotenv').config();
// const { initializeApp } = require('firebase-admin/app');

// console.log(process.env.DB_PASS)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xkz3z.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const port = 5000


const app = express()

app.use(cors());
app.use(bodyParser.json());



const admin = require("firebase-admin");

const serviceAccount = require("./configs/burj-al-arab-b87cf-firebase-adminsdk-sop3n-55ae64245f.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});









const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");

  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
      .then(result => {
        //   res.send(result.acknowledged)
        // console.log(result)
      })
    // console.log(newBooking)
  }) 

  app.get('/bookings', (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
      // console.log({ idToken })
      getAuth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          if (tokenEmail == queryEmail) {
            bookings.find({ email: queryEmail })
              .toArray((err, documents) => {
                res.status(200).send(documents)
              })
          }
          else{
            res.status(401).send('un-authorized access')
          }
        })
        .catch((error) => {
          res.status(401).send('un-authorized access')
        });
    }
    else{
      res.status(401).send('un-authorized access')
    }

  })

});




app.get('/', function (req, res) {
  res.send('hello world')
})


app.listen(port);