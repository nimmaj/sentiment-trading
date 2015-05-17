#!/bin/bash
echo importing 
mongoimport --db sentiment_db --collection event --file ./cache/event.json
