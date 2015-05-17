#!/bin/bash
echo Dumping event collection to cache directory
mongoexport --db sentiment_db --collection event --out /home/ubuntu/sentiment-trading/cache/event.json
