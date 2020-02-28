const MongoClient = require('mongodb').MongoClient;

const MONGO_URL = 'mongodb://USER-NAME:PASSWORD@PROJECT-ID.mlab.com:37922/smart-data-center';

MongoClient.connect(MONGO_URL, (err, db) => {
    if (err) {
        return console.log(err);
    }

    // Do something with db here, like inserting a record
    db.collection('notes').update(
        {},
        {
            $set: {
                title: 'Hello MongoDB',
                text: 'Hopefully this works!'
            }
        },
        { upsert: true },
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
