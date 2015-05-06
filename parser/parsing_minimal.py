import events
from pprint import pprint
from pattern.en import sentiment, positive

LIVE = True



def parse(items, threshold):
    for item in items:

        if item['sentiment'][0] > 0:
            item['type'] = 'buy'
            item['confidence'] = item['sentiment'][0] * 100

        if item['sentiment'][0] < 0:
            item['type'] = 'sell'
            item['confidence'] = item['sentiment'][0] * -100

        if item['sentiment'][0] == 0:
            item['confidence'] = 0

        print(item['timestamp'],item['source'],item['type'],item['confidence'],item['description'])
        if item['confidence'] > threshold:
            print('POSTED')
            #print(item['timestamp'],item['source'],item['type'],item['confidence'],item['description'])
            if LIVE:
                events.post(**item)

if __name__ == '__main__':
    print('Parsing USA Today')
    parse(events.usa_today('jobs','2015-01-01','2015-04-02'),60)
    print('Parsing Xignite')
    parse(events.xignite('1/1/2015','4/2/2015'),60)
