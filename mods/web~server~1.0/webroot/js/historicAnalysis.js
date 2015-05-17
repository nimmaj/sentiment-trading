
var connection = new WebSocket('ws://' + location.hostname + ':' + location.port + '/historicAnalysis');
connection.onmessage = messageReceived;
console.log("created websocket on historicAnalysis");

var bid = new TimeSeries();
var ask = new TimeSeries();

var usd = new TimeSeries();
var gbp = new TimeSeries();

var pnl = new TimeSeries();

var bidAsk = new SmoothieChart({ grid: { strokeStyle: 'rgb(125, 0, 0)', fillStyle: 'rgb(60, 0, 0)', lineWidth: 1, millisPerLine: 1000, verticalSections: 6 },
  labels: { precision: 4} ,
  millisPerPixel:50});
bidAsk.addTimeSeries(bid, { strokeStyle: 'rgb(0, 255, 0)', fillStyle: 'rgba(0, 255, 0, 0.4)', lineWidth: 3 });
bidAsk.addTimeSeries(ask, { strokeStyle: 'rgb(255, 0, 255)', fillStyle: 'rgba(255, 0, 255, 0.3)', lineWidth: 3 });
bidAsk.streamTo(document.getElementById('bid_ask'), 1000);

var position = new SmoothieChart({ grid: { strokeStyle: 'rgb(125, 0, 0)', fillStyle: 'rgb(60, 0, 0)', lineWidth: 1, millisPerLine: 1000, verticalSections: 6 },
  labels: { precision: 4} ,
  millisPerPixel:50});
position.addTimeSeries(gbp, { strokeStyle: 'rgb(0, 255, 0)', fillStyle: 'rgba(0, 255, 0, 0.4)', lineWidth: 3 });
position.addTimeSeries(usd, { strokeStyle: 'rgb(255, 0, 255)', fillStyle: 'rgba(255, 0, 255, 0.3)', lineWidth: 3 });
position.streamTo(document.getElementById('gbp_usd_position'), 1000);

var pnl = new SmoothieChart({ grid: { strokeStyle: 'rgb(125, 0, 0)', fillStyle: 'rgb(60, 0, 0)', lineWidth: 1, millisPerLine: 1000, verticalSections: 6 },
  labels: { precision: 4} ,
  millisPerPixel:50});
pnl.addTimeSeries(pnl, { strokeStyle: 'rgb(0, 255, 0)', fillStyle: 'rgba(0, 255, 0, 0.4)', lineWidth: 3 });
pnl.streamTo(document.getElementById('pnl'), 1000);

function messageReceived(socketMessage) {
  var smo = JSON.parse(socketMessage.data);
  var topic = smo.topic;
  var message = smo.message;

  console.log("got eur usd tick: " + message.bid + ' ' + message.ask);

  bid.append(new Date().getTime(), message.bid);
  ask.append(new Date().getTime(), message.ask);

}
