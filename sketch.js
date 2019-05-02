let dice = ["🎲", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"]
let diceThrown = [] // false if idle, else array of dice positions and rotation and value
let default_config = 0
let triangles = []
let checkers = new Array(28) // each triangle's checkers. negative is black, positive is red. indices 25..28 correspond to hidden Triangles 25:top-left,26:top-right,27:bottom-left,28:bottom-right
let variant = 0 // variants of the game
let player1 = true // true is red (positive checkers), false is black (nefative checkers)

function setup() {
  createCanvas(windowWidth, windowHeight);
  initializeCheckers()
  for (a = 0; a < 28; a++) {
    triangles.push(new Triangle(a))
  }
  noLoop()
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  noLoop()
}

function draw() {
  background(config().background)
  // draw board
  let e = width * config().boxExterior;
  let t = width * config().boxThickness;
  let s = config().boxStrokeWeight
  // box outer
  stroke(config().boxBorder)
  strokeWeight(s)
  fill(config().boxColor)
  rect(e, s, width - 2 * e, height - 2 * s)
  strokeWeight(2 * s)
  line(width / 2, s + 1, width / 2, height - s - 2)
  // box side
  strokeWeight(s)
  fill(config().boxBoard)
  rect(e + t, t + s, width / 2 - e - 2 * t, height - 2 * (t + s))
  rect(width / 2 + t, t + s, width / 2 - e - 2 * t, height - 2 * (t + s))
  // box junctions
  fill(config().junction)
  strokeWeight(s / 2)
  rect(width / 2 - e / 8, height / 3 - e, e / 4, e / 2)
  rect(width / 2 - e / 8, height / 3 - e + e / 2, e / 4, e / 2)
  rect(width / 2 - e / 8, height * 2 / 3, e / 4, e / 2)
  rect(width / 2 - e / 8, height * 2 / 3 + e / 2, e / 4, e / 2)
  // triangles
  for (a = 0; a < 24; a++) {
    triangles[a].draw()
  }
  for (a=24;a<28;a++){
    triangles[a].calculate()
  }
  // box outer rectangle
  stroke(config().boxBorder)
  strokeWeight(s)
  noFill()
  rect(e + t, t + s, width / 2 - e - 2 * t, height - 2 * (t + s))
  rect(width / 2 + t, t + s, width / 2 - e - 2 * t, height - 2 * (t + s))
  // display arrows
  if (diceThrown.length != 0) {

  }
  // drawArrow(triangles[floor(random(24))], triangles[floor(random(24))], floor(random(4) + 1))
  // // drawArrow(triangles[0],triangles[11])
  // display dice
  if (diceThrown.length == 0) {
    displayDiceIdle(LEFT)
    displayDiceIdle(RIGHT)
  }
}

function displayDiceIdle(side = LEFT) {
  let align = (side == LEFT ? width * config().boxExterior / 2 : width * (1 - config().boxExterior / 2))
  textSize(width * config().boxExterior)
  textAlign(CENTER, CENTER)
  strokeJoin(ROUND);
  fill(255)
  stroke(255)
  strokeWeight(width * config().boxExterior / 6)
  text(dice[0], align, height / 2)
  fill(0)
  noStroke()
  text(dice[0], align, height / 2)
}

function diceIdleClick(side = LEFT) {
  let dx = mouseX - (side == LEFT ? width * config().boxExterior / 2 : width * (1 - config().boxExterior / 2))
  let dy = mouseY - height / 2
  return dx * dx + dy * dy < (width * config().boxExterior) * (width * config().boxExterior)
}

function throwDice(choosePlayer = true) {
  randomSeed()
  let dice_val = [floor(random(6)) + 1, floor(random(6)) + 1]
  let angles = [random(PI), random(PI)]
  let limx1 = [width / 9, width * .45]
  let limx2 = [width - width / 9, width - width * .45]
  let limx11 = (random(1) < .5 ? limx1 : limx2)
  let limx12 = (random(1) < .5 ? limx1 : limx2)
  let limy = height * .37
  let dice_pos = []
  dice_pos = [
    [random(limx11[0], limx11[1]), random(limy, height - limy)],
    [random(limx12[0], limx12[1]), random(limy, height - limy)]
  ]
  let die_size = width * config().boxExterior
  diceThrown = [dice_val, dice_pos, angles]
  if (diceClick(true)) { // if overlap, rethrow
    console.log("overlap")
    throwDice(choosePlayer)
    return false
  }
  if (choosePlayer && (dice_val[0] == dice_val[1])) { // if choosing player and same value, rethrow 
    console.log("same value")
    throwDice(choosePlayer)
    return false
  }
  draw()

  textSize(die_size)
  textAlign(CENTER, CENTER)
  for (let i = 0; i < 2; i++) {
    push()
    translate(dice_pos[i][0], dice_pos[i][1])
    rotate(angles[i])
    translate(-dice_pos[i][0], -dice_pos[i][1])
    if (choosePlayer) {
      if (i == 0) {
        fill(config().redTriangle)
        stroke(config().redTriangle)
      } else {
        fill(config().blkTriangle)
        stroke(config().blkTriangle)
      }
      player1 = dice_val[0] > dice_val[1]
    } else {
      fill(255)
      stroke(255)
    }
    strokeWeight(width * config().boxExterior / 3)
    rect(dice_pos[i][0] - die_size / 4, dice_pos[i][1] - die_size / 3, die_size / 2, die_size / 2)
    fill(0)
    noStroke()
    text(dice[dice_val[i]], dice_pos[i][0], dice_pos[i][1])
    pop()
  }
}

function diceClick(overlapTest = false) {
  if (diceThrown.length > 0) {
    let dx, dy
    let die_size = width * config().boxExterior * 6
    for (let i = 0; i < 2; i++) {
      // ellipse( diceThrown[1][i][0], diceThrown[1][i][1],die_size/2)
      dx = (overlapTest ? diceThrown[1][abs(i - 1)][0] : mouseX) - diceThrown[1][i][0]
      dy = (overlapTest ? diceThrown[1][abs(i - 1)][0] : mouseY) - diceThrown[1][i][1]
      if (dx * dx + dy * dy < die_size * die_size) {
        return true
      }
    }
  }
  return false
}

function initializeCheckers() {
  for (let i = 0; i < checkers.length; i++) {
    checkers[i] = 0
  }
  for (let i = 0; i < variants().init_checker_pos.length; i++) {
    let tmp = variants().init_checker_pos
    checkers[tmp[i][0]] = tmp[i][1]
  }
}

function mousePressed() {
  if (diceIdleClick(LEFT) || diceIdleClick(RIGHT)) {
    throwDice()
    return "dice"
  } else if (diceClick()) {
    diceThrown = []
    draw()
  } else {
    for (let a = 0; a < 28; a++) {
      if (triangles[a].click()) {
        console.log("Triangle ", a)
        return a
      }
    }
  }
}

function drawArrow(triangle1, triangle2, multpl = 1) {
  let rotation = variants().rotation
  let byTheLeft = triangle1.pos < triangle2.pos
  let camp = [triangle1.pos <= 11, triangle2.pos <= 11]
  stroke(config().arrowShadow)
  strokeWeight(width * config().arrowShadowSize * multpl)
  if ((camp[0] ^ camp[1])) { // changing camp
    for (let i = 0; i < multpl + 1; i++) { //draw shadow then arrow
      let h = height * .05
      let x1 = triangle1.x3
      let y1 = triangle1.y3
      let x2 = triangle2.x3
      let y2 = triangle2.y3
      let x1h = triangle1.x3 - (rotation && byTheLeft ? triangle1.x3 - triangles[0].x3 : triangle1.x3 - triangles[11].x3)
      let y2h = y2 + (camp[1] ? 2 * h : -2 * h)
      let xmid = (rotation && byTheLeft ? width / 9 : width - width / 9)
      let ymid = height / 2
      let ymidh = ymid + (camp[0] ? 3 * h : -3 * h)
      let ymidg = ymid + (camp[0] ? -3 * h : 3 * h)
      let line1 = [x1, y1, x1h, y1]
      let line2a = [xmid, ymidg, xmid, ymid]
      let line2b = [xmid, ymid, xmid, ymidh]
      let line3 = [x2, y2h, x2, y2]
      $bezier(line1, line2a)
      $bezier(line2b, line3)
      stroke(i % 2 == 0 ? config().arrowColor : config().arrowShadow)
      strokeWeight(width * config().arrowSize * (multpl * 2 - 1 - 2 * i) / (multpl * 2 - 1) * multpl)
    }
    fill(config().arrowShadow)
    stroke(config().arrowShadow)
    ellipse(triangle2.x3, triangle2.y3, width * config().arrowPointShadow)
    stroke(config().arrowColor)
    ellipse(triangle2.x3, triangle2.y3, width * config().arrowPointRadius)
  } else {
    for (let i = 0; i < multpl + 1; i++) {
      let h = height * .05
      let x1 = triangle1.x3
      let y1 = triangle1.y3
      let x2 = triangle2.x3
      let y2 = triangle2.y3
      let y1h = y1 + (camp[0] ? h : -h)
      let y2h = y2 + (camp[1] ? 2 * h : -2 * h)
      let line1 = [x1, y1, x1, y1h]
      let line2 = [x2, y2h, x2, y2]
      $bezier(line1, line2)
      stroke(i % 2 == 0 ? config().arrowColor : config().arrowShadow)
      strokeWeight(width * config().arrowSize * (multpl * 2 - 1 - 2 * i) / (multpl * 2 - 1) * multpl)
    }
    fill(config().arrowShadow)
    stroke(config().arrowShadow)
    ellipse(triangle2.x3, triangle2.y3, width * config().arrowPointShadow)
    stroke(config().arrowColor)
    ellipse(triangle2.x3, triangle2.y3, width * config().arrowPointRadius)
  }
}

function $bezier(line1, line2, drawLines = false) {
  if (drawLines) {
    line(line1[0], line1[1], line1[2], line1[3])
    line(line2[0], line2[1], line2[2], line2[3])
  }
  bezier(line1[0], line1[1], line1[2], line1[3], line2[0], line2[1], line2[2], line2[3])
}

function onMouseLeave() {
  noLoop();
}

function onMouseEnter() {
  // loop();
}

function config() {
  let configs = [{ //brown #8F4C0E , light #FDD6B1 , orange #FF932E , blue #3CACC9 , lightblue #2ED4FF
    name: "classic",
    background: color("#3CACC9"),
    boxColor: color("#8F4C0E"),
    boxBorder: color(0),
    boxBoard: color("#FDD6B1"),
    boxStrokeWeight: 2,
    boxThickness: 1 / 64,
    boxExterior: 1 / 16,
    triangleStrokeWeight: 1,
    text: color("#8F4C0E"),
    junction: color("#FF932E"),

    redTriangle: color("#FF932E"),
    redTriangleBorder: color("#8F4C0E"),
    redCheckers: color("#8F4C0E"),
    redCheckersLight: color("#FF932E"),

    blkTriangle: color("#2ED4FF"),
    blkTriangleBorder: color("#3CACC9"),
    blkCheckers: color("#3CACC9"),
    blkCheckersLight: color("#2ED4FF"),

    checkersShadow: color(127, 127), //not used

    arrowColor: color("#3CACC9"),
    arrowSize: .005,
    arrowPointRadius: .02,
    arrowPointShadow: .03,
    arrowShadow: color(255, 127),
    arrowShadowSize: .009
  }];
  return configs[default_config]
}

function variants() {
  let all_variants = [{
    name: "jaquet",
    rotation: true, // true : trigonometric, false : clock
    init_checker_pos: [
      [11, -15],
      [12, 15]
    ],

  }];
  return all_variants[variant]
}

//TODO dessiner un trait pour tirer plus ou moins "fort" les dés
//TODO implémenter le dé de pari
//TODO variantes :
// == Moultezim ==
//Le moultezim est un jeu turc très semblable au jacquet. Les règles n'en diffèrent que sur les deux points suivants5 :
// ¤ la première dame doit seulement avoir atteint le troisième quadrant pour que le joueur puisse déplacer les autres 
// ¤ le bouchage du premier quadrant est interdit en toutes circonstances.
// == Backgammon ==
// == TricTrac ==

class Triangle {
  constructor(pos) {
    this.pos = pos // index in array 'checkers', first is top-left, last is bottom-right
    this.x1;
    this.y1;
    this.x2;
    this.y2;
    this.x3;
    this.y3;
    this.top; // true if on top
  }
  calculate() {
    if (this.pos <= 23) {
      let i = this.pos % 6
      let j = floor(this.pos / 6) % 2
      let k = floor(this.pos / 12)

      let e = width * config().boxExterior;
      let t = width * config().boxThickness;
      let s = config().boxStrokeWeight;
      let w = (width / 2 - e - 2 * t) / 6
      let offsetX = j * (width / 2 - e)
      let offsetY = k * (height - 2 * t - 2 * s)

      let x1 = (e + t) + i * w;
      let y1 = t + s;
      let x2 = x1 + w;
      let y2 = y1;
      let x3 = x1 + w / 2;
      let y3 = (t + s) + (height - 2 * (t + s)) / 3 * (k + 1) + k * s

      this.top = k == 0
      this.x1 = x1 + offsetX
      this.y1 = y1 + offsetY
      this.x2 = x2 + offsetX
      this.y2 = y2 + offsetY
      this.x3 = x3 + offsetX
      this.y3 = y3 + (this.top ? -2 : 0)
    } else { // hidden Triangles 24:top-left,25:top-right,26:bottom-left,27:bottom-right
      if (this.pos == 24){
        this.x1 = 0
        this.y1 = triangles[0].y1
        this.x2 = width * config().boxExterior
        this.y2 = this.y1
        this.x3 = (this.x2-this.x1)/2
        this.y3 = triangles[0].y3
        this.top = true
      } else if (this.pos == 25){
        this.x1 = width * (1-config().boxExterior)
        this.y1 = triangles[0].y1
        this.x2 = width
        this.y2 = this.y1
        this.x3 = width - (this.x2-this.x1)/2
        this.y3 = triangles[0].y3
        this.top = true
      }else if (this.pos == 26){
        this.x1 = 0
        this.y1 = triangles[12].y1
        this.x2 = width * config().boxExterior
        this.y2 = this.y1
        this.x3 = (this.x2-this.x1)/2
        this.y3 = triangles[12].y3
        this.top = true
      }else if (this.pos == 27){
        this.x1 = width * (1-config().boxExterior)
        this.y1 = triangles[12].y1
        this.x2 = width
        this.y2 = this.y1
        this.x3 = width - (this.x2-this.x1)/2
        this.y3 = triangles[12].y3
        this.top = true
      }
    }
  }
  draw() {
    this.calculate()
    let i = this.pos % 6
    strokeWeight(config().triangleStrokeWeight)
    fill(255)
    stroke(255)
    triangle(this.x1, this.y1, this.x2, this.y2, this.x3, this.y3)
    fill(i % 2 ? config().redTriangle : config().blkTriangle)
    stroke(i % 2 ? config().redTriangleBorder : config().blkTriangleBorder)
    triangle(this.x1, this.y1, this.x2, this.y2, this.x3, this.y3)

    if (checkers[this.pos] > 4) {
      noStroke()
      fill(config().text)
      textAlign(CENTER, CENTER)
      let textSizeVal = (this.x2 - this.x1) / 2
      textSize(textSizeVal)
      text(checkers[this.pos], this.x1 + (this.x2 - this.x1) / 2, this.y3 + textSizeVal * (this.top ? 1 : -1))
    }

    if ((checkers[this.pos] != 0)&&(this.pos<=23)) {
      this.placeCheckers()
    }
  }
  placeCheckers() {
    function indexToHeight(c) {
      if (c < 0) {
        return (c > -8 ? c * 1.5 : -.5 + (c + 8) * 1.5)
      } else {
        return (abs(c) < 8 ? c * 1.5 : .5 + (c - 8) * 1.5)
      }
    }
    if (this.top) {
      for (let i = abs(checkers[this.pos]) - 1; i >= 0; i--) {
        this.placeChecker(indexToHeight(-i))
      }
    } else {
      for (let i = 0; i < checkers[this.pos]; i++) {
        this.placeChecker(indexToHeight(i))
      }
    }
  }
  placeChecker(c = 0) { // c : height
    let w = (this.x2 - this.x1)*.85
    let h = abs(this.y3 - this.y1) / 12
    randomSeed(this.pos+2*c)
    random()
    let x0 = this.x1 + (this.x2 - this.x1) / 2 + (random(2)-1)
    randomSeed(this.pos+3*c)
    random()
    let y0 = this.y1 - (c + (this.top ? -.75 : .75)) * h + (random(2)-1)
    let th = h / 5
    let a = h / 2
    let light = (checkers[this.pos] < 0 ? config().redCheckersLight : config().blkCheckersLight)
    let dark = (checkers[this.pos] < 0 ? config().redCheckers : config().blkCheckers)
    strokeWeight(1.4)
    for (let wx = -w / 2; wx < w / 2; wx++) {
      let r = map(wx, -w / 2, w / 2, red(light), red(dark))
      let g = map(wx, -w / 2, w / 2, green(light), green(dark))
      let b = map(wx, -w / 2, w / 2, blue(light), blue(dark))
      stroke(r, g, b)
      let s1 = wx / (w / 2)
      let s = a * sqrt(1 - s1 * s1)
      line(x0 + wx, y0 - th + s, x0 + wx, y0 + th + s)
      stroke(light)
      line(x0 + wx, y0 - th - s, x0 + wx, y0 - th + s)
    }
    strokeWeight(1)
    stroke(0)
    noFill()
    ellipse(x0, y0 - th, w, 2 * a)
    arc(x0 + .5, y0 + th, w - 1, 2 * a, TWO_PI, PI)
    line(x0 - w / 2, y0 - th, x0 - w / 2, y0 + th)
    line(x0 + w / 2, y0 - th, x0 + w / 2, y0 + th)
  }
  click() {
    let mX1 = mouseX > this.x1
    let mX2 = mouseX < this.x2
    let mY1, mY2
    if (this.top) {
      mY1 = mouseY > this.y1
      mY2 = mouseY < this.y3
    } else {
      mY1 = mouseY < this.y1
      mY2 = mouseY > this.y3
    }
    return (mX1 && mX2 && mY1 && mY2)
  }
}