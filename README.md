# Sentiment Trading

You need a file in mods/oanda~stream~1.0/conf called secret.json of the form:

```
{
  "accountId": <yourAccountId>,
  "apiKey": "<yourApiKey"
}
```

Run with:

```
./run.sh
```


# mongo

run using

```
mongod --dbfile=blah
```

use the ```mongo``` shell to access the data:

```
use sentiment_db
show collections
db.event.find()
db.event.remove( {} )
```
