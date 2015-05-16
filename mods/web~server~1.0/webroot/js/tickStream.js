var connection = new WebSocket('ws://' + location.hostname + ':' + location.port + '/liveStream');
connection.onmessage = tickReceived;
console.log("created websocket");

var graphs = new Map();

function tickReceived(tickMessage) {
  var tick = JSON.parse(tickMessage.data);

  if (!graphs.has(tick.instrument)) {
    console.log("adding new graph section for: "+tick.instrument);

    var graphElement = document.getElementById("rateGraphs");
    var newRow = document.createElement("div");
    newRow.setAttribute("class","row");

    var newGraphDiv = divWithClass("col-md-8");

    var titleDiv = document.createElement("h5");
    var title = document.createTextNode(tick.instrument);
    titleDiv.appendChild(title);

    var graphDiv = document.createElement("div");

    var graphCanvas = document.createElement("canvas");
    graphCanvas.setAttribute("id", tick.instrument);
    graphCanvas.setAttribute("width", 660);
    graphCanvas.setAttribute("height", 150);
    graphDiv.appendChild(graphCanvas);

    newGraphDiv.appendChild(titleDiv);
    newGraphDiv.appendChild(graphDiv);

    newRow.appendChild(divWithClass("col-md-2"));
    newRow.appendChild(newGraphDiv);
    newRow.appendChild(divWithClass("col-md-2"));

    graphElement.appendChild(newRow);


    var ts = {
      bid: new TimeSeries(),
      ask: new TimeSeries()
    };

    graphs.set(tick.instrument, ts);

    var smoothie = new SmoothieChart({ grid: { strokeStyle: 'rgb(125, 0, 0)', fillStyle: 'rgb(60, 0, 0)', lineWidth: 1, millisPerLine: 1000, verticalSections: 6 },
      labels: { precision: 4} ,
      millisPerPixel:50});
    smoothie.addTimeSeries(ts.bid, { strokeStyle: 'rgb(0, 255, 0)', fillStyle: 'rgba(0, 255, 0, 0.4)', lineWidth: 3 });
    smoothie.addTimeSeries(ts.ask, { strokeStyle: 'rgb(255, 0, 255)', fillStyle: 'rgba(255, 0, 255, 0.3)', lineWidth: 3 });

    smoothie.streamTo(document.getElementById(tick.instrument), 1000);
  }

  console.log("got eur usd tick: " + tick.bid + ' ' + tick.ask);
  var timeSeries = graphs.get(tick.instrument);
  timeSeries.bid.append(new Date().getTime(), tick.bid);
  timeSeries.ask.append(new Date().getTime(), tick.ask);

}

function divWithClass(className) {
  var div = document.createElement("div");
  div.setAttribute("class",className);
  return div;
}
