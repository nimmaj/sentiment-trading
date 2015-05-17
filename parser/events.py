import requests
import pyGTrends
import csv
import urllib
from pattern.en import sentiment
from pattern.web import Element
from datetime import datetime
from textblob import TextBlob
from textblob.sentiments import NaiveBayesAnalyzer
from textblob.classifiers import NaiveBayesClassifier

def NaiveBayesAnalyzerParser(text):
    
    train =[('creates jobs', 'pos'),
            ('create jobs', 'pos'),
            ('created jobs', 'pos'),
            ('new jobs', 'pos'),
            ('jobs wanted', 'pos'),
            ('jobs needed', 'pos'),
            ('jobs call by', 'pos'),
            ('unemployment falls', 'pos'),
            ('bring jobs', 'pos'),
            ('jobs comming', 'pos'),
            ('unemployment drops', 'pos'),
            ('cut jobs', 'neg'),
            ('cutting jobs', 'neg'),
            ('cuts jobs', 'neg'),
            ('lost jobs', 'neg'),
            ('job loss', 'neg'),
            ('losing jobs', 'neg'),
            ('lose jobs', 'neg'),
            ('jobs not kept', 'neg'),
            ('jobs trim', 'neg'),
            ('unemployment rises', 'neg'),
            ('drops', 'neg'),
            ('drop', 'neg'),
            ('dollar falls', 'neg'),
        ]
    cl = NaiveBayesClassifier(train)
    sentiment = TextBlob(text, analyzer=NaiveBayesAnalyzer()).sentiment
    #Sentiment(classification='pos', p_pos=0.6023632501327671, p_neg=0.3976367498672331)
    #print(sentiment)
    subjectivity = 1 - (max(sentiment.p_pos,sentiment.p_neg) - min(sentiment.p_pos,sentiment.p_neg))
    if cl.classify(text) == 'pos':
        return (sentiment.p_pos, subjectivity)
    else:
        return (sentiment.p_neg*-1, subjectivity)

def post(**kwargs):
    # Post sentiment event to Sentiment Engine
    # Returns True if successful
    # dict containing - author, source, type, confidence, description, timestamp
    #print kwargs
    required = ['author','source','type','confidence','description','timestamp']
    if not all(x in kwargs.keys() for x in required):
        raise Exception('missing required parameter')

    if kwargs['type'] not in ['buy','sell']:
        raise Exception('type is not buy or sell')

    if not (0 < kwargs['confidence'] < 100):
        raise Exception('confidence is not between 1-99')

    url = 'http://52.17.232.186:8080/postSentiment'

    r = requests.post(url, json=kwargs, verify=False)
    return r.status_code == 200

def oanda(instrument,period='31536000'):
    # returns list of events for instrument and period (defaults to a year)
    # https://api-fxtrade.oanda.com/labs/v1/calendar?instrument=EUR_USD&period=2592000
        
    token = '6e41d334e0350a46d42e065fd9f176e9-fd22bf52914c9c2d78ad9ccc62cffb70'
    url = 'https://api-fxpractice.oanda.com/labs/v1/calendar'
    payload = {'instrument':instrument,'period':period}
    headers = {'Authorization' : 'Bearer ' + token}
    r = requests.get(url, params=payload, headers=headers, verify=False)
    if r.status_code != 200:
        raise Exception('request failed')

    return r.json()

def xignite(start, end):
    # returns a list of headlines from xignite 
    url = 'http://globalnews.xignite.com/xGlobalNews.json/GetHistoricalMarketHeadlines'
    payload = {
        'StartDate': start,
        'EndDate': end,
        '_Token': 'D9A522C905EF4B38A7F55B74DB9A59F9'
    }
    r = requests.get(url, params=payload, verify=False)
    if r.status_code != 200:
        raise Exception('request failed')
    headlines = r.json()['Headlines']
    response = []
    for headline in headlines:
        #print(headline)
        date = datetime.strptime(headline['Date'] + ' ' + headline['Time'], '%m/%d/%Y %I:%M %p')
        text = headline['Title']
        response += [{
            'timestamp': date.isoformat(' '),
            'description': text,
            'source': 'xignite-' + headline['Source'],
            'author':'rick-xignite', 
            'sentiment': NaiveBayesAnalyzerParser(text)
        }]
    return response 

def usa_today(keyword, start, end, section='money'):
    # returns a list of headlines from USA Today
    url = 'http://api.usatoday.com/open/articles'
    payload = {
        'section': section,
        'count': 200,
        'keyword': keyword,
        'fromdate' : start,
        'todate': end,
        'encoding': 'json',
        'api_key' : '67z9txdcqh6z3rpn2y2u527d'
    }
    r = requests.get(url, params=payload, verify=False)
    if r.status_code != 200:
        raise Exception('request failed')
    headlines = r.json()['stories']
    response = []
    for headline in headlines:
        date = datetime.strptime(headline['pubDate'], '%a, %d %b %Y %I:%M:%S GMT') #Thu, 14 May 2015 09:23:24 GMT
        text = headline['title']
        response += [{
            'timestamp': date.isoformat(' '),
            'description': text,
            'source':'usa_today',
            'author':'rick', 
            'sentiment': NaiveBayesAnalyzerParser(text)
        }]
    return response

def googletrends(keywords, start_month, start_year, duration=12, geo="US"):
    # Quta limit reached for 16/05 Don't call
    connector = pyGTrends.pyGTrends("rbshackathon@gmail.com", "RB$Hackathon" )
    querydate=str(start_month)+"/"+str(start_year)+" "+str(duration)+"m"
    #print querydate
    connector.download_report(keywords,geo=geo,date=querydate)
    result = []
    try:
        result = connector.csv().split("\n")
    except Exception as e:
        if  "Could not find requested section" in e.__str__():
            with open("data/googletrends.csv", 'rb') as f:
                reader = csv.reader(f)
                for row in reader:
                    result.append(row[0]+","+row[1])
                #print result
        
    del result[0]
    response = []
    previousnumber = 100
    for r in result:
        s = r.split(" ")
        date = datetime.strptime(s[0], '%Y-%m-%d')
        number = s[2].split(",")[1]
        diff = int(number) - previousnumber
        text=""
        if diff >= 0:
            text = "The search for " + keywords+ " has increased "+ str(diff) + "%" +" on Google this week"
        else:
            text = "The search for " + keywords+ " has decreased "+ str(diff) + "%" +" on Google this week"
        response += [{
            'timestamp': date.isoformat(' '),
            'description': text,
            'source':'google',
            'author':'zhuangy', 
            'sentiment': NaiveBayesAnalyzerParser(text)
        }]
        previousnumber = int(number)
    #print len(response)
    return response

def googlenewscomparor(title, previoustitle):
    x = set()
    y = set()
    for a in title:
        x.add(a.content)
    for b in previoustitle:
        y.add(b.content)
    return x==y
        

def googlenews(keyword, start, end):
    url = 'https://www.google.com/search?'
    searchdate = "cd_min:"+start+",cd_max:"+end
    continueindicator = True
    response = []
    pagenumber = 0
    previoustitle=[];
    while continueindicator:   
        payload = {
            'q': keyword,
            'hl': 'en',
            'tbs':'sbd:1,nsd:0,cdr:1,'+searchdate,
            'tbas':0,
            'tbm':'nws',
            'start':pagenumber,
            'source':'lnt'
        }
        realurl=url+urllib.urlencode(payload)
        r = requests.get(realurl, verify=False)
        print r.url
        if r.status_code != 200:
            raise Exception('request failed')
        root = Element(r.text)
        title=root('div[class="st"]')
        for a in title:
            for pa in previoustitle:
                if googlenewscomparor(title, previoustitle):
                    continueindicator = False
                    #print a.content
                    #print
                    #print pa.content
                    break
            if continueindicator == False:
                break
                
            else:
                md=Element(a.previous)
                metadata=md('span[class="f"]')[0].content.split(" - ")
                #Parse Date
                date=None
                if "ago" not in metadata[-1]:
                    date = datetime.strptime(metadata[-1], '%d %b %Y')
                else:
                    dates = metadata[-1].split(" ")
                    if dates[2] == "day":
                        date = datetime.today() - timedelta(days=int(dates[0]))
                    else:
                        date = datetime.today()
                #Parse Title
                text=a.content.replace("<b>","").replace("</b>","").replace("&nbsp;...","")
                
                response += [{
                    'timestamp': date.isoformat(' '),
                    'description': text,
                    'source': metadata[0],
                    'author':'zhuangy', 
                    'sentiment': NaiveBayesAnalyzerParser(text)
                     }]
        previoustitle = title
        pagenumber= pagenumber+10
        #print continueindicator, pagenumber
    
    return response


def newslookup(keyword, year):
    # returns a list of headlines from News Lookup
    url = 'http://www.newslookup.com/results?'
    continueindicator = True
    pagenumber = 0
    response = []
    while continueindicator:
        payload = {
            'q': keyword,
            'p': pagenumber,
            'ps' : 10,
            'hs' : 1,
            'tp' : "" ,
            'cat': 'gi100',
        }
        if int(year) != 2015:
            payload['s']="tY"+year
        r = requests.get(url, params=payload, verify=False)
        if r.status_code != 200:
            raise Exception('request failed')    
        #print r.url
        root = Element(r.text)
        title=root('a[class="title"]')
        if len(title) < 1:
            break
        datet = root('span[class="stime"]')
        for a in range(len(title)):
            text=title[a].content
            date= datetime.strptime(datet[a].content, ' | %a %b %d, %Y %H:%M UTC') # Sat Dec 04, 2010 15:40 UTC
            response += [{
                'timestamp': date.isoformat(' '),
                'description': text,
                'source':"newslookup",
                'author':'zhuangy', 
                'sentiment': NaiveBayesAnalyzerParser(text)
            }]

        pagenumber=pagenumber+1
        #print pagenumber, len(title), len(response)
    return response


if __name__ == '__main__':
    from datetime import datetime
    now = datetime.now().isoformat(' ')

    requests.packages.urllib3.disable_warnings()

    assert NaiveBayesAnalyzerParser('1000 jobs created') == (0.5621958115394713, 0.8756083769210568)
    assert NaiveBayesAnalyzerParser('1000 jobs lost') == (-0.5422292136758547, 0.9155415726482906)

    assert post(author='rick',source='test_source',type='buy',confidence=50,description='unit test post',timestamp=now)
    assert oanda('EUR_USD')
    assert xignite('4/15/2015','4/16/2015')
    assert usa_today('job','2015-05-13','2015-05-14')
    assert newslookup("jobs", "2015")
    assert googletrends("jobs","US","1/2004 120m") 
    #assert googlenews("us jobs", "01/01/2014", "02/04/2014")

