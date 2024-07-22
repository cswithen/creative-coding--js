const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const math = require("canvas-sketch-util/math");
const colormap = require("colormap");

const settings = {
  dimensions: [1080, 1080],
  animate: true,
  fps: 60,
};

const sketch = ({ width, height }) => {
  const columns = 99;
  const rows = 13;
  const numCells = columns * rows;

  // grid
  const gridWidth = width * 0.8;
  const gridHeight = height * 0.8;

  // cell
  const cellWidth = gridWidth / columns;
  const cellHeight = gridHeight / rows;

  // margins
  const marginX = (width - gridWidth) / 2;
  const marginY = (height - gridHeight) / 2;

  const points = [];

  let x, y, n, lineWidth, color, alpha;
  let frequency = 0.002;
  let amplitude = 76;

  const colors = colormap({
    colormap: "portland",
    nshades: amplitude,
    alpha: amplitude,
  });

  for (let i = 0; i < numCells; i++) {
    x = (i % columns) * cellWidth;
    y = Math.floor(i / columns) * cellHeight;

    n = random.noise2D(x, y, frequency, amplitude);
    // x += n;
    // y += n;

    lineWidth = math.mapRange(n, -amplitude, amplitude, 0, 5);
    color =
      colors[Math.floor(math.mapRange(n, -amplitude, amplitude, 0, amplitude))];
    alpha = math.mapRange(n, -amplitude, amplitude, 0.5, 1);

    points.push(new Point({ x, y, lineWidth, color, alpha }));
  }

  return ({ context, width, height, frame }) => {
    context.fillStyle = "#0d1117";
    context.fillRect(0, 0, width, height);

    context.save();

    context.translate(marginX, marginY);
    context.translate(cellWidth / 2, cellHeight / 2);
    context.strokeStyle = "red";
    context.lineWidth = 2;

    // update position
    points.forEach((point) => {
      const n = random.noise2D(
        point.ix + frame * 2,
        point.iy,
        frequency,
        amplitude
      );
      point.x = point.ix + n;
      point.y = point.iy + n;
    });

    let lastx, lasty;

    // draw lines
    for (let r = rows - 1; r >= 0; r--) {
      // Change loop to go from bottom to top
      for (let c = 0; c < columns - 1; c++) {
        const curr = points[c + r * columns];
        const next = points[c + r * columns + 1];

        const mx = curr.x + (next.x - curr.x) * 0.8;
        const my = curr.y + (next.y - curr.y) * 4.5;

        if (c === 0) {
          lastx = curr.x;
          lasty = curr.y;
        }

        context.beginPath();
        context.lineWidth = curr.lineWidth;
        context.strokeStyle = curr.color;
        context.globalAlpha = curr.alpha; // Changed from context.alpha

        context.moveTo(lastx, lasty);
        context.quadraticCurveTo(curr.x, curr.y, mx, my);
        context.stroke();

        lastx = mx - (c / columns) * 250;
        lasty = my - (r / rows) * 150;
      }
    }

    // draw points
    // points.forEach((point) => {
    //   // point.draw(context);
    // });
    context.restore();
  };
};

canvasSketch(sketch, settings);

class Point {
  constructor({ x, y, lineWidth, color, alpha }) {
    this.x = x;
    this.y = y;
    this.lineWidth = lineWidth;
    this.color = color;
    this.alpha = alpha;

    this.ix = x;
    this.iy = y;
  }

  draw(context) {
    context.save();
    context.translate(this.x, this.y);
    context.fillStyle = "red";

    context.beginPath();
    context.arc(0, 0, 5, 0, Math.PI * 2);
    context.fill();

    context.restore();
  }
}
