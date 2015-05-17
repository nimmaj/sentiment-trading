# Sentiment Trading

Static web content is hosted on GitHub Pages - (http://nimmaj.github.io/sentiment-trading/)
note that the demo isn't static so doesn't do much unless you run the app...

Having won the Deloitte Gone Hacking Hackathon last November, there's basically
no chance of us getting any prize this time, so we tipped up to have some fun!

Our plan was to investigate whether we could use social media, and any media,
to give early indication of job changes and whether we could use that to then
trade.

Our strategy was threefold:

* Investigate whether there was any statistical link between the step functions
on non farm payroll days and the difference between the expected and actual
numbers (Mark)
* Scan social media, and media, for job related events/sentiment that we could
grade with a confidence and directionality to drive position taking events.
(Yongzhi and Richard)
* Build a platform that could take live events and trade, but which could also
be used to store and run historic back testing so that we could tune our data
gathering and trading stragegies (Ben)

We used various technologies:

* Vert.x - we love vert.x because it's lightweight, polyglot and has an eventbus;
all of which helps us to componentise work which helps us not step on each other's
toes during the very short hack
* R - mark made extensive use of R to understand the times around the non-farm
payroll events
* OANDA - awesome streaming rates and fx trading
* Bootstrap - a huge time saver when knocking up websites
* Streaming graphs from Smoothie.js - I'm a huge fan of the awesome Joe Walnes
and Drew Noakes - thanks for these fun components!
* Python - Richard has this strange fascination with his python - we're hoping
counselling might help... ;-)
* NLTK - Standing on the broad shoudlers of all the great work that has gone into the [Natural Language Toolkit] (http://www.nltk.org/)
* The Dovetail - one of the finest purveyors of ludicrously strong Belgian beer
in London!

Huge thanks to the Deloitte Digital/Capital Markets GoneHacking team who have
once again made this a fantastic, and fun, event.  

# Overview
![architecture](https://github.com/nimmaj/sentiment-trading/blob/master/mods/web~server~1.0/webroot/images/NLPprocessing.png  "Sentiment Trdaing Architecture")


# To run...

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

```
db.event.aggregate(
   { $group: { _id: { $week: "$timestamp"},
               click: { $sum: 1 } } }
   )
```

# Parsing scripts
For backtesting and historic event parsing you need Python2.7
```
python /parser/parsing.py
```
