var darkBlue;
var transparentRed;
var transparentGreen;
var transparentBlue;
var white;

var canvas;
var htmlCanvas;
var context;
var currentNum = 1;
/*Format:
{
  name: '',
  bounds: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  scale: 0,
  rects: [{
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    label: ''
  }],
  selectedRectIndex: 0
}
*/
var images = [];

var mousePressedX;
var mousePressedY;
var mouseHolding;

const lineToEdge = 20;

function setup() {
  darkBlue = color(21, 31, 59);
  transparentRed = color(255, 0, 0, 125);
  transparentGreen = color(0, 255, 0, 125);
  transparentBlue = color(0, 0, 255, 125);
  white = color(255, 255, 255);

  canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('display', 'block');
  background(184, 205, 219);

  canvas.dragOver(dragOver)
  canvas.dragLeave(dragLeave)
  canvas.drop(gotFile);

  htmlCanvas = document.querySelector('canvas');
  context = htmlCanvas.getContext('2d');

  drawDashedBorder();
}

function drawDashedBorder() {
  context.beginPath();
  context.setLineDash([10, 10]);
  context.moveTo(lineToEdge, lineToEdge);
  context.lineTo(windowWidth - lineToEdge, lineToEdge);
  context.lineTo(windowWidth - lineToEdge, windowHeight - lineToEdge);
  context.lineTo(lineToEdge, windowHeight - lineToEdge);
  context.lineTo(lineToEdge, lineToEdge);
  context.stroke();
  context.setLineDash([]);
}

//Because HTML ids can't begin with numbers
function idFromNum(id) {
  return 'image' + id.toString();
}

function gotFile(file) {
  console.log(`got file ${file.name}!`);
  var img = createImg(file.data);
  img.attribute('onload', 'onImageLoad()');
  img.style('display', 'none')
  img.id(idFromNum(currentNum));
  images.push({
    name: file.name,
    bounds: {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    },
    scale: 0,
    rects: []
  });

  document.getElementById('title-heading').style.display = 'none';
  document.getElementById('subtitle-heading').style.display = 'none';
  document.getElementById('upload-icon').style.display = 'none';
}

function dragOver() {
  background(124, 166, 194);
  drawDashedBorder();
}

function dragLeave() {
  background(184, 205, 219);
  drawDashedBorder();
}

function onImageLoad() {
  const imageId = idFromNum(currentNum);
  console.log(images[currentNum - 1])
  images[currentNum - 1].scale = windowWidth / document.getElementById(imageId).width;
  const currentScale = images[currentNum - 1].scale;

  if (windowHeight - document.getElementById(imageId).height * scale >= 200) {
    context.drawImage(document.getElementById(imageId), 0, 0, windowWidth, document.getElementById(imageId).height * currentScale);
    setBounds(0, 0, windowWidth, document.getElementById(imageId).height * currentScale)
    openTools('bottom');
  } else {
    if (document.getElementById(imageId).height * (windowWidth - 400) / document.getElementById(imageId).width <= windowHeight) {
      images[currentNum - 1].scale = (windowWidth - 400) / document.getElementById(imageId).width;
      const currentScale = images[currentNum - 1].scale;
      context.drawImage(document.getElementById(imageId), 0, 0, windowWidth - 400, document.getElementById(imageId).height * currentScale);
      setBounds(0, 0, windowWidth - 400, document.getElementById(imageId).height * currentScale)
      openTools('right');
    } else {
      images[currentNum - 1].scale = windowHeight / document.getElementById(imageId).height;
      const currentScale = images[currentNum - 1].scale;
      context.drawImage(document.getElementById(imageId), 0, 0, document.getElementById(imageId).width * currentScale, windowHeight);
      setBounds(0, 0, document.getElementById(imageId).width * currentScale, windowHeight);
      openTools('right', parseInt(windowWidth - document.getElementById(imageId).width * currentScale) + 'px');
    }
  }
}

function openTools(option, size='400px') {
  document.getElementById('num-1').innerHTML = images.length.toString();
  document.getElementById('num-2').innerHTML = images.length.toString();
  document.getElementById('tools').style.display = 'block';
  if (option === 'bottom') {
    document.getElementById('tools').style.width = windowWidth;
    document.getElementById('tools').style.height = '200px';
    document.getElementById('tools').style.bottom = '100px';
  } else if (option === 'right') {
    document.getElementById('tools').style.width = size;
    document.getElementById('tools').style.height = Math.round(document.getElementById(idFromNum(currentNum)).height * images[currentNum - 1].scale).toString() + 'px';
    document.getElementById('image-heading').style.top = '2em';
    document.getElementById('label').style.display = 'none';
    document.getElementById('label').style.top = '8em';
    document.getElementById('tools').style.right = '0';
  } else {
    console.log('Option is not bottom or right!');
  }
}

function setBounds(x, y, width, height) {
  images[currentNum - 1].bounds.x = x;
  images[currentNum - 1].bounds.y = y;
  images[currentNum - 1].bounds.width = width;
  images[currentNum - 1].bounds.height = height;
}

function labelRect(event) {
  images[currentNum - 1].rects[images[currentNum - 1].selectedRectIndex].label = document.getElementById('label-input').value;
  event.preventDefault();
  return false;
}

function draw() {
  if (images.length > 0) {
    background(124, 166, 194);
    const bounds = images[currentNum - 1].bounds;
    context.drawImage(document.getElementById(idFromNum(currentNum)), bounds.x, bounds.y, bounds.width, bounds.height);
    //drawDashedBorder();
    strokeWeight(2);
    stroke(transparentRed);
    fill(transparentRed);
    if (mouseHolding) {
      rect(mousePressedX, mousePressedY, mouseX - mousePressedX, mouseY - mousePressedY);
    }
    for (var i = 0; i < images[currentNum - 1].rects.length; i++) {
      const rectangle = images[currentNum - 1].rects[i]
      fill(transparentRed);
      stroke(transparentRed);
      strokeWeight(2);
      rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
      if (rectangle.label !== '') {
        console.log('rect label not null!');
        textSize(20);
        fill(white);
        noStroke();
        text(rectangle.label, rectangle.x + rectangle.width / 2 - textWidth(rectangle.label) / 2, rectangle.y + rectangle.height / 2);
      }
    }
    if (images[currentNum - 1].selectedRectIndex != null) {
      images[currentNum - 1].rects[images[currentNum - 1].selectedRectIndex].label = document.getElementById('label-input').value;
    }
  }
}

function mouseInRegion(x, y, width, height) {
  var xTest;
  var yTest;
  if (width > 0) {
    xTest = mouseX > x && mouseX < x + width;
  } else if (width < 0) {
    xTest = mouseX > x + width && mouseX < x;
  } else {
    console.log('width is 0!');
  }
  if (height > 0) {
    yTest = mouseY > y && mouseY < y + height;
  } else if (height < 0) {
    yTest = mouseY > y + height && mouseY < y;
  } else {
    console.log('height is 0!');
  }
  console.log(`mouse in region: ${xTest && yTest}!`);

  return xTest && yTest;
}

function mousePressed() {
  if (images.length < 1) {
    return;
  }

  if (mouseX > images[currentNum - 1].bounds.width) {
    return;
  }

  for (var i = 0; i < images[currentNum - 1].rects.length; i++) {
    var rectangle = images[currentNum - 1].rects[i];
    if (mouseInRegion(rectangle.x, rectangle.y, rectangle.width, rectangle.height)) {
      images[currentNum - 1].selectedRectIndex = i;

      document.getElementById('label-input').value = images[currentNum - 1].rects[images[currentNum - 1].selectedRectIndex].label;
    }
  }

  mousePressedX = mouseX;
  mousePressedY = mouseY;
  mouseHolding = true;
}

function mouseReleased() {
  mouseHolding = false;

  if (images.length < 1) {
    return;
  }

  if (mouseX > images[currentNum - 1].bounds.width) {
    return;
  }

  //Avoid misclicks/misdrags
  if (Math.abs(mousePressedX - mouseX) < 10 || Math.abs(mousePressedY - mouseY) < 10) {
    return;
  }

  images[currentNum - 1].rects.push({
    x: mousePressedX,
    y: mousePressedY,
    width: mouseX - mousePressedX,
    height: mouseY - mousePressedY,
    label: ''
  });

  images[currentNum - 1].selectedRectIndex = images[currentNum - 1].rects.length - 1;
  document.getElementById('label-input').value = '';

  document.getElementById('label').style.display = 'block';
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
}
