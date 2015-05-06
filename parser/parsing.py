import events
from pprint import pprint
from pattern.en import sentiment, positive

#.oanda('EUR_USD')
#.usa_today('job','2015-05-13','2015-05-14')

#pprint(items[0])

def parse(items):
    posted = 0
    for item in items:
        if item['sentiment'][0] > 0:
            item['type'] = 'buy'
            item['confidence'] = item['sentiment'][0] * 100

        if item['sentiment'][0] < 0:
            item['type'] = 'sell'
            item['confidence'] = item['sentiment'][0] * -100

        if item['sentiment'][0] != 0:
            pprint(item)
            posted += 1
            events.post(**item)
    return posted

if __name__ == '__main__':
    #parse(events.xignite('4/15/2015','4/16/2015'))
    parse(events.usa_today('job','2015-05-13','2015-05-14'))