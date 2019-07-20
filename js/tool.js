window.onload = (e) => {
    document.getElementById('tools').focus();
}

var darkBlue;
var transparentRed;
var transparentGreen;
var transparentBlue;
var white;

var canvas;
var htmlCanvas;
var context;
var currentNum = 0;
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
  selectedRectIndex: 0,
  toolsInfo: {
    direction: '',
    size: '400px'
  }
}
*/
var images = [];

var mousePressedX;
var mousePressedY;
var mouseHolding;

var firstDrag = true;
var generated = false;

const lineToEdge = 20;
const messageTimeout = 4000;

function setup() {
  darkBlue = color(21, 31, 59);
  transparentRed = color(255, 0, 0, 125);
  transparentGreen = color(0, 255, 0, 125);
  transparentBlue = color(0, 0, 255, 125);
  white = color(255, 255, 255);

  canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('display', 'block');
  background(184, 205, 219);

  canvas.dragOver(dragOver);
  canvas.dragLeave(dragLeave);
  canvas.drop(gotFile);

  htmlCanvas = document.querySelector('canvas');
  context = htmlCanvas.getContext('2d');
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
  currentNum++;
  console.log(`got file ${file.name}!`);
  console.log('current num is ' + currentNum.toString());
  var img = createImg(file.data);
  let n = currentNum;
  //img.attribute('onload', 'onImageLoad(n)');
  img.style('display', 'none');
  img.id(idFromNum(currentNum));
  document.getElementById(idFromNum(currentNum)).onload = () => {
    onImageLoad(n);
  }
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
  document.getElementById('left').style.display = 'block';
  document.getElementById('right').style.display = 'block';

  document.getElementById('left').onclick = () => {
    left();
  };
  document.getElementById('right').onclick = () => {
    right();
  }
}

function left() {
  var imageId = idFromNum(currentNum);
  if (currentNum - 1 < 1) {
    currentNum = images.length;
  } else {
    currentNum--;
  }
  if ('size' in images[currentNum - 1].toolsInfo) {
    openTools(images[currentNum - 1].toolsInfo.direction, images[currentNum - 1].toolsInfo.size);
  } else {
    openTools(images[currentNum - 1].toolsInfo.direction);
  }
  document.getElementById('label-input').value = '';
}

function right() {
  var imageId = idFromNum(currentNum);
  if (currentNum + 1 > images.length) {
    currentNum = 1;
  } else {
    currentNum++;
  }
  if ('size' in images[currentNum - 1].toolsInfo) {
    openTools(images[currentNum - 1].toolsInfo.direction, images[currentNum - 1].toolsInfo.size);
  } else {
    openTools(images[currentNum - 1].toolsInfo.direction);
  }
  document.getElementById('label-input').value = '';
}

function dragOver() {
  background(124, 166, 194);
  drawDashedBorder();
}

function dragLeave() {
  background(184, 205, 219);
  drawDashedBorder();
}

function onImageLoad(num) {
  const imageId = idFromNum(num);
  console.log(num);
  console.log(images[num-1]);
  images[num - 1].scale = windowWidth / document.getElementById(imageId).width;
  const currentScale = images[num - 1].scale;

  if (windowHeight - document.getElementById(imageId).height * scale >= 200) {
    context.drawImage(document.getElementById(imageId), 0, 0, windowWidth, document.getElementById(imageId).height * currentScale);
    setBounds(0, 0, windowWidth, document.getElementById(imageId).height * currentScale, num);
    openTools('bottom');
    images[num - 1].toolsInfo = {
      direction: 'bottom'
    };
  } else {
    if (document.getElementById(imageId).height * (windowWidth - 400) / document.getElementById(imageId).width <= windowHeight) {
      images[num - 1].scale = (windowWidth - 400) / document.getElementById(imageId).width;
      const currentScale = images[num - 1].scale;
      context.drawImage(document.getElementById(imageId), 0, 0, windowWidth - 400, document.getElementById(imageId).height * currentScale);
      setBounds(0, 0, windowWidth - 400, document.getElementById(imageId).height * currentScale, num)
      openTools('right');
      images[num - 1].toolsInfo = {
        direction: 'right'
      };
    } else {
      images[num - 1].scale = windowHeight / document.getElementById(imageId).height;
      const currentScale = images[num - 1].scale;
      context.drawImage(document.getElementById(imageId), 0, 0, document.getElementById(imageId).width * currentScale, windowHeight);
      setBounds(0, 0, document.getElementById(imageId).width * currentScale, windowHeight, num);
      openTools('right', (windowWidth - document.getElementById(imageId).width * currentScale).toString() + 'px');
      images[num - 1].toolsInfo = {
        direction: 'right',
        size: (windowWidth - document.getElementById(imageId).width * currentScale).toString() + 'px'
      };
    }
    if (firstDrag) {
      hideHeadingAndLabel();
    } else {
      document.getElementById('label-input').value = '';
    }
  }
  showMessage('Drag the cursor to form a rectangle!');
}

function hideHeadingAndLabel() {
  document.getElementById('heading-and-label').style.display = 'none';
}

function openTools(option, size='400px') {
  document.getElementById('num-1').innerHTML = currentNum;
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
    //document.getElementById('label').style.display = 'none';
    document.getElementById('label').style.top = '8em';
    document.getElementById('tools').style.right = '0';
  } else {
    console.log('Option is not bottom or right!');
  }
}

function showMessage(message) {
  document.getElementById('snackbar').innerHTML = message;
  document.getElementById('snackbar').className = 'show';
  setTimeout(() => {
    document.getElementById('snackbar').className = document.getElementById('snackbar').className.replace('show', '');
  }, messageTimeout);
}

function showDelayedMessage(message, delay) {
  setTimeout(() => {
    showMessage(message);
  }, delay);
}

function setBounds(x, y, width, height, num) {
  images[num - 1].bounds.x = x;
  images[num - 1].bounds.y = y;
  images[num - 1].bounds.width = width;
  images[num - 1].bounds.height = height;
}

function labelRect(event) {
  images[currentNum - 1].rects[images[currentNum - 1].selectedRectIndex].label = document.getElementById('label-input').value;
  event.preventDefault();
  return false;
}

function draw() {
  document.getElementById('num-1').innerHTML = currentNum;
  document.getElementById('num-2').innerHTML = images.length.toString();
  if (images.length === 0) {
    drawDashedBorder();
  }
  if (images.length > 0) {
    background(124, 166, 194);
    const bounds = images[currentNum - 1].bounds;
    context.drawImage(document.getElementById(idFromNum(currentNum)), bounds.x, bounds.y, bounds.width, bounds.height);
    //drawDashedBorder();
    strokeWeight(2);
    stroke(transparentRed);
    context.setLineDash([]);
    fill(transparentRed);
    if (mouseHolding && mousePressedX < images[currentNum - 1].bounds.width) {
      rect(mousePressedX, mousePressedY, mouseX - mousePressedX, mouseY - mousePressedY);
    }
    for (var i = 0; i < images[currentNum - 1].rects.length; i++) {
      const rectangle = images[currentNum - 1].rects[i]
      fill(transparentRed);
      stroke(transparentRed);
      strokeWeight(2);
      if (i === images[currentNum - 1].selectedRectIndex) {
        context.setLineDash([10, 10]);
      } else {
        context.setLineDash([]);
      }
      rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
      if (rectangle.label !== '') {
        //console.log('rect label not null!');
        textSize(20);
        fill(white);
        noStroke();
        text(rectangle.label, rectangle.x + rectangle.width / 2 - textWidth(rectangle.label) / 2, rectangle.y + rectangle.height / 2);
      }
    }
    if (images[currentNum - 1].selectedRectIndex != null && isLabelInputFocused()) {
      images[currentNum - 1].rects[images[currentNum - 1].selectedRectIndex].label = document.getElementById('label-input').value;
    }

    document.body.style.cursor = 'default';
    for (var i = 0; i < images[currentNum - 1].rects.length; i++) {
      var rectangle = images[currentNum - 1].rects[i];
      if (mouseInRegion(rectangle.x, rectangle.y, rectangle.width, rectangle.height)) {
        document.body.style.cursor = 'pointer';
      }
    }
  }
}

function mouseInRegion(x, y, width, height) {
  var xInRegion;
  var yInRegion;
  if (width > 0) {
    xInRegion = mouseX > x && mouseX < x + width;
  } else if (width < 0) {
    xInRegion = mouseX > x + width && mouseX < x;
  } else {
    console.log('width is 0!');
  }
  if (height > 0) {
    yInRegion = mouseY > y && mouseY < y + height;
  } else if (height < 0) {
    yInRegion = mouseY > y + height && mouseY < y;
  } else {
    console.log('height is 0!');
  }

  return xInRegion && yInRegion;
}

function mousePressed() {
  mousePressedX = mouseX;
  mousePressedY = mouseY;
  mouseHolding = true;

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
      document.getElementById('label-input').focus();
    }
  }
}

function onFirstDrag() {
  document.getElementById('mouse-drag').style.display = 'none';
  document.getElementById('heading-and-label').style.display = 'block';
  showMessage('If you make a mistake, press delete to remove.');
  showDelayedMessage('When you\'re done labelling, click "generate".', 5000);
}

function isLabelInputFocused() {
  return document.activeElement === document.getElementById('label-input');
}

function download(text, name, type) {
  var file = new Blob([text], { type: type });
  var isIE = /*@cc_on!@*/ false || !!document.documentMode;
  if (isIE) {
    window.navigator.msSaveOrOpenBlob(file, name);
  } else {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
  }
}

function generate() {
  if (!generated) {
    document.getElementById('generate-text').style.display = 'block';
    generated = true;
  }

  var string = '';
  string += '[';
  for (var i = 0; i < images.length; i++) {
    var currentImage = images[i];
    var currentScale = currentImage.scale;
    string += `{"image":"${currentImage.name}","annotations":`;
    string += '['
    for (var j = 0; j < currentImage.rects.length; j++) {
      var rect = currentImage.rects[j];
      var height = rect.height/currentScale;
      var width = rect.width/currentScale;
      var x = Math.round(rect.x/currentScale + width/2).toString();
      var y = Math.round(rect.y/currentScale + height/2).toString();
      height = Math.round(Math.abs(height).toString());
      width = Math.round(Math.abs(width).toString());
      string += `{"coordinates":{"height":${height},"width":${width},"x":${x},"y":${y}},"label":"${rect.label}"}`;
      if (j !== currentImage.rects.length - 1) {
        string += ',';
      }
    }
    string += ']'
    string += '}';
    if (i !== images.length - 1) {
      string += ',';
    }
  }
  string += ']';
  download(string, 'labels.json', 'text/json');
}

function mouseReleased() {
  if (images.length < 1) {
    return;
  }

  if (mouseHolding && mousePressedX > images[currentNum - 1].bounds.width) {
    mouseHolding = false;
    return;
  }
  console.log(mousePressedX);

  mouseHolding = false;

  if (mouseX > images[currentNum - 1].bounds.width) {
    return;
  }

  //Avoid misclicks/misdrags
  if (Math.abs(mousePressedX - mouseX) < 10 || Math.abs(mousePressedY - mouseY) < 10) {
    return;
  }

  if (firstDrag) {
    firstDrag = false;
    onFirstDrag();
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
  document.getElementById('label-input').focus();

  document.getElementById('label').style.display = 'block';
  document.getElementById('generate').style.display = 'inline';
  document.getElementById('generate').onclick = () => {
    generate();
  };
}

document.addEventListener('keyup', (e) => {
  if (e.keyCode === 8 || e.keyCode === 46) {
    if (images.length > 0) {
      if ('selectedRectIndex' in images[currentNum - 1]) {
        if (!isLabelInputFocused()) {
          deleteSelectedRect();
        }
      }
    }
  }
  if (e.keyCode === 37) {
    if (!isLabelInputFocused()) {
      left();
    }
  }
  if (e.keyCode === 39) {
    if (!isLabelInputFocused()) {
      right();
    }
  }
});

function deleteSelectedRect() {
    images[currentNum - 1].rects.splice(images[currentNum - 1].selectedRectIndex, 1);
    images[currentNum - 1].selectedRectIndex = null;
    document.getElementById('label-input').value = '';
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(184, 205, 219);
}
