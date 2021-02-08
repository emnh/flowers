// Following this idea: https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/
var chartSize = 600;
var dataSize = 600;

var dataset = d3.range(dataSize).map(function(d, i) {
  return d3.range(dataSize).map(function(d, i) {
    return ~~(Math.random() * 255);
  });
});

var canvas = d3
  .select("body")
  .append("canvas")
  .style({
    position: "absolute",
    width: chartSize + "px",
    height: chartSize + "px"
  })
  .attr({ width: dataSize, height: dataSize })
  .node();

var canvasWidth = canvas.width;
var canvasHeight = canvas.height;
var ctx = canvas.getContext("2d");
var imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

var buf = new ArrayBuffer(imageData.data.length);
var buf8 = new Uint8ClampedArray(buf);
var data = new Uint32Array(buf);

var maxi = 100;
var points = [];
for (var i = 0; i < maxi; i++) {
  points.push({ x: Math.random() - 0.5, y: Math.random() - 0.5, rnd: Math.random() });
}

for (var y = 0; y < canvasHeight; ++y) {
  for (var x = 0; x < canvasWidth; ++x) {
    //var value = dataset[y][x];
    var px = 0;
    var py = 0;
    var mind = 100.0;
    var r = 0;
    var g = 0;
    var b = 0;
    for (var i = 0; i < maxi; i++) {
      var ddx = Math.abs(x / canvasWidth - 0.5 - points[i].x);
      var ddy = Math.abs(y / canvasHeight - 0.5 - points[i].y);
      var d = Math.sqrt(ddx * ddx + ddy * ddy);
      
      px = points[i].x;
      py = points[i].y;

      var dx = x / canvasWidth - 0.5 - px;
      var dy = y / canvasHeight - 0.5 - py;
      dx *= 10.0 * points[i].rnd + 1.0;
      dy *= 10.0 * points[i].rnd + 1.0;
      var a = Math.atan2(dy, dx);
      a = a < 0.0 ? a + 2 * Math.PI : a;
      a = (0.5 * a) / (2.0 * Math.PI);
      a2 = (Math.sin(10.0 * 2.0 * Math.PI * a) + 1.0) * 0.25;
      a3 = (Math.sin(10.0 * 2.0 * Math.PI * (a + 0.25)) + 1.0) * 0.25;
      a4 = (Math.sin(10.0 * 2.0 * Math.PI * (a + 0.125)) + 1.0) * 0.25;

      var d = Math.sqrt(dx * dx + dy * dy);
      var f = 20.0 / maxi;
      //var f = 1.0;
      r += d < a2 ? f : 0;
      g += d < a3 ? f : 0;
      b += d < a4 ? f : 0;
    }
    r = Math.max(0, Math.min(1, r)) * 255;
    g = Math.max(0, Math.min(1, g)) * 255;
    b = Math.max(0, Math.min(1, b)) * 255;
    data[y * canvasWidth + x] =
      (255 << 24) | // alpha
      (b << 16) | // blue
      (g << 8) | // green
      r; // red
  }
}

imageData.data.set(buf8);

ctx.putImageData(imageData, 0, 0);
