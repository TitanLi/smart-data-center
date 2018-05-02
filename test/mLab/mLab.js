const MongoClient = require('mongodb').MongoClient;

const MONGO_URL = 'mongodb://nutc.iot:nutciot5891@ds161041.mlab.com:61041/smart-factory';

MongoClient.connect(MONGO_URL, (err, db) => {
  if (err) {
    return console.log(err);
  }

  // Do something with db here, like inserting a record
  db.collection('notes').update(
    {},
    {
      $set :{
        title: 'Hello MongoDB',
        text: 'Hopefully this works!'
      }
    },
    {upsert:true },
    function (err, res) {
      if (err) {
        db.close();
        return console.log(err);
      }
      // Success
      db.close();
    }
  )
});
