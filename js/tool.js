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
  };
  document.getElementById('right').onclick = () => {
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
  };
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
      console.log('it\'s happening');
      openTools('right');
      images[num - 1].toolsInfo = {
        direction: 'right'
      };
    } else {
      images[num - 1].scale = windowHeight / document.getElementById(imageId).height;
      const currentScale = images[num - 1].scale;
      context.drawImage(document.getElementById(imageId), 0, 0, document.getElementById(imageId).width * currentScale, windowHeight);
      setBounds(0, 0, document.getElementById(imageId).width * currentScale, windowHeight, num);
      console.log('it\'s happening 2');
      openTools('right', (windowWidth - document.getElementById(imageId).width * currentScale).toString() + 'px');
      images[num - 1].toolsInfo = {
        direction: 'right',
        size: (windowWidth - document.getElementById(imageId).width * currentScale).toString() + 'px'
      };
    }
    console.log(images[num - 1].toolsInfo);
  }
}

function openTools(option, size='400px') {
  document.getElementById('num-1').innerHTML = currentNum;
  document.getElementById('num-2').innerHTML = images.length.toString();
  document.getElementById('tools').style.display = 'block';
  document.getElementById('code-box').style.width = size;
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
        //console.log('rect label not null!');
        textSize(20);
        fill(white);
        noStroke();
        text(rectangle.label, rectangle.x + rectangle.width / 2 - textWidth(rectangle.label) / 2, rectangle.y + rectangle.height / 2);
      }
    }
    if (images[currentNum - 1].selectedRectIndex != null && document.getElementById('label-input') === document.activeElement) {
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
  document.getElementById('generate').style.display = 'inline-block';
  document.getElementById('generate').onclick = () => {
    document.getElementById('code-box').value = "";
    document.getElementById('code-box').value += "[";
    for (var i = 0; i < images.length; i++) {
      var currentImage = images[i];
      var currentScale = currentImage.scale;
      document.getElementById('code-box').value += "{'image': '" + currentImage.name + "', 'annotations': "
      document.getElementById('code-box').value += "["
      for (var j = 0; j < currentImage.rects.length; j++) {
        var rect = currentImage.rects[j];
        var height = rect.height/currentScale;
        var width = rect.width/currentScale;
        var x = Math.round(rect.x/currentScale + width/2).toString();
        var y = Math.round(rect.y/currentScale + height/2).toString();
        height = Math.round(Math.abs(height).toString());
        width = Math.round(Math.abs(width).toString());
        document.getElementById('code-box').value += "{'coordinates': {'height': " + height + ", 'width': " + width + ", 'x': " + x + ", 'y': " + y + "}, 'label': '" + rect.label + "'}";
        if (j !== currentImage.rects.length - 1) {
          document.getElementById('code-box').value += ", ";
        }
      }
      document.getElementById('code-box').value += "]"
      document.getElementById('code-box').value += "}";
      if (i !== images.length - 1) {
        document.getElementById('code-box').value += ", ";
      }
    }
    document.getElementById('code-box').value += "]";
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
}
