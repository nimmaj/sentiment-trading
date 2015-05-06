import requests

def post(**kwargs):
    # Post sentiment event to Sentiment Engine
    # Returns True if successful
    # dict containing - author, source, type, confidence, description, timestamp
    required = ['author','source','type','confidence','description','timestamp']
    if not all(x in required for x in kwargs):
        raise Exception('missing required parameters')

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
        'StartDate': '4/16/2015',
        'EndDate': '5/15/2015',
        '_Token': 'D9A522C905EF4B38A7F55B74DB9A59F9'
    }
    r = requests.get(url, params=payload, verify=False)
    if r.status_code != 200:
        raise Exception('request failed')
    return r.json()['Headlines']

def usa_today(keyword, start, end, section='money'):
    # returns a list of headlines from USA Today
    url = 'http://api.usatoday.com/open/articles'
    payload = {
        'section': section,
        'keyword': 'job',
        'fromdate' : '2015-05-13',
        'todate': '2015-05-14',
        'encoding': 'json',
        'api_key' : '67z9txdcqh6z3rpn2y2u527d'
    }
    r = requests.get(url, params=payload, verify=False)
    if r.status_code != 200:
        raise Exception('request failed')
    return r.json()['stories']


if __name__ == '__main__':
    from datetime import datetime
    now = datetime.now().isoformat(' ')

    requests.packages.urllib3.disable_warnings()

    assert post(author='rick',source='test_source',type='buy',confidence='50',description='unit test post',timestamp=now)
    assert oanda('EUR_USD')
    assert xignite('4/16/2015','4/15/2015')
    assert usa_today('job','2015-05-13','2015-05-14')

