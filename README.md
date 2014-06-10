CuVR
=====

CuVR is library to build CubicVR Web page. [View sample](http://ejeinc.github.io/CuVR/)

Each faces are simple HTML contents. Any content can be put on cubic VR world.

Currently supported only webkit browsers.

## How to

### 1. Include CSS

```html
<link rel="stylesheet" href="cuvr.css" type="text/css"/>
```

### 2. Include JavaScript

```html
<script type="text/javascript" src="cuvr.js"></script>
```

### 3. Put HTML

```html
<div class="cuvr-view">
  <div class="cuvr-cube">
    <div class="cuvr-face front">
      Front contents here
    </div>
    <div class="cuvr-face right">
      Right contents here
    </div>
    <div class="cuvr-face back">
      Back contents here
    </div>
    <div class="cuvr-face left">
      Left contents here
    </div>
    <div class="cuvr-face top">
      Top contents here
    </div>
    <div class="cuvr-face bottom">
      Bottom contents here
    </div>
  </div>
</div>
```

### 4. Call CuVR constructor

```JavaScript
var cuvr = new CuVR({
  // this is rendered cube size (px) 
  cubeSize : 720
});
```

## API

### Constructor options

| Property          | Description | Type       | Default
| --------          | ----------- | ----       | -------
| updateInterval    | how often update viewport rotateX & rotateY | Number | 100
| cubeSize          | size of cube faces       | Number | Math.min(window.innerWidth,window.innerHeight)  
| scrollSensitivity | amount of scroll by mouse and touch control. if value is set to 1.0 cube rotates 360 degrees with mouse moving from left/top edge to right/bottom edge. | Number | 0.5
| mouse             | enable mouse control     | Boolean | true
| touch             | enable touch control     | Boolean | true
| keyboard          | enable keyboard control  | Boolean | true
| sensor            | enable sensor control (uses deviceorientation event) | Boolean | false
| horizontalScroll  | enable horizontal scroll | Boolean | true
| verticalScroll    | enable vertical scroll   | Boolean | true
| cssTransition     | enable css transition    | Boolean | true
| fullscreen        | enable fullscreen mode   | Boolean | true

### enableControl()

```JavaScript
// specify multiple
cuvr.enableControl({
  mouse : true,
  touch : true,
  keyboard : true,
  sensor : true
});

// or simple
cuvr.enableControl('mouse');
cuvr.enableControl('touch');
cuvr.enableControl('keyboard');
cuvr.enableControl('sensor');
```

### disableControl()

```JavaScript
// specify multiple
cuvr.disableControl({
  mouse : true,
  touch : true,
  keyboard : true,
  sensor : true
});

// or simple
cuvr.disableControl('mouse');
cuvr.disableControl('touch');
cuvr.disableControl('keyboard');
cuvr.disableControl('sensor');
```

### setCubeSize(size)

```JavaScript
// set cube size to 50% but limit up to 500px
cuvr.setCubeSize(Math.min(500, window.innerWidth / 2));
```

### look(to)

```JavaScript
cuvr.look('front');
cuvr.look('right');
cuvr.look('back');
cuvr.look('left');
cuvr.look('top');
cuvr.look('bottom');
```

### rotateX

```JavaScript
// set
cuvr.rotateX = 120;

// get
var r = cuvr.rotateX;
```

### rotateY

```JavaScript
// set
cuvr.rotateY = 80;

// get
var r = cuvr.rotateY;
```

### verticalScroll

```JavaScript
// set
cuvr.verticalScroll = false;

// get
var vs = cuvr.verticalScroll;
```

### horizontalScroll

```JavaScript
// set
cuvr.horizontalScroll = false;

// get
var hs = cuvr.horizontalScroll;
```

## License

MIT License. See the LICENSE file for more info.
