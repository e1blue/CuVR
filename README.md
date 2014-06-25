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
  // and more options...
});
```

## API

### Constructor options

| Property          | Description | Type       | Default
| --------          | ----------- | ----       | -------
| updateInterval    | how often update viewport rotateX & rotateY | Number or 'auto' | 100
| cubeSize          | size of cube faces       | Number | Math.min(window.innerWidth,window.innerHeight)  
| scrollSensitivity | amount of scroll by mouse and touch control. if value is set to 1.0 cube rotates 360 degrees with mouse moving from left/top edge to right/bottom edge. | Number | 0.5
| mouse             | enable mouse control     | Boolean | true
| touch             | enable touch control     | Boolean | true
| horizontalScroll  | enable horizontal scroll | Boolean | true
| verticalScroll    | enable vertical scroll   | Boolean | true
| cssTransition     | enable css transition    | Boolean | true
| fullscreen        | enable fullscreen mode   | Boolean | true

If `updateInterval:'auto'` is specified, CuVR updates frames as fast as possible by calling `requestAnimationFrame` continually.

In that case, it is prefered to set `cssTransition: false`.


### enableControl()

```JavaScript
// specify multiple
cuvr.enableControl({
  mouse : true,
  touch : true
});

// or simple
cuvr.enableControl('mouse');
cuvr.enableControl('touch');
```

### disableControl()

```JavaScript
// specify multiple
cuvr.disableControl({
  mouse : true,
  touch : true
});

// or simple
cuvr.disableControl('mouse');
cuvr.disableControl('touch');
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

### get & set rotation values

```JavaScript
cuvr.rotateX(40);
cuvr.rotateY(60);
cuvr.rotateZ(20);

// or simple version
cuvr.x(40);
cuvr.y(60);
cuvr.z(20);

// or with yaw,pitch,roll
cuvr.yaw(90);   // = rotateY
cuvr.pitch(45); // = rotateZ
cuvr.roll(0);   // = rotateX 

// or with heading,attitude,bank
cuvr.heading(90);  // = rotateY
cuvr.attitude(45); // = rotateZ
cuvr.bank(0);      // = rotateX

// get
var x = cuvr.rotateX();
var y = cuvr.rotateY();
var z = cuvr.rotateZ();
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

## Plugins

CuVR plugins must be loaded after cuvr.js.

```HTML
<script src="./cuvr.js"></script>
<script src="./cuvr.ANY PLUGIN.js"></script>
``` 

### cuvr.object.js

This is experimental plug-in. It enables to put elements anywhere on VR faces.

Include `cuvr.object.js` and put elements in `div.cuvr-view` and add `cuvr-object` class.

```HTML
<div class="cuvr-view">
  <div class="cuvr-cube">
    <div class="cuvr-face front"></div>
    <div class="cuvr-face right"></div>
    <div class="cuvr-face back"></div>
    <div class="cuvr-face left"></div>
    <div class="cuvr-face top"></div>
    <div class="cuvr-face bottom"></div>
  </div>
  
  <!-- put elements here. Don't forget to add cuvr-object class. -->
  <img class="cuvr-object" src="yourimage.png">
  
  <!-- set position with data-pos-* -->
  <img class="cuvr-object" src="yourimage.png" data-pos-x="0.5" data-pos-y="-0.25" data-pos-z="-1">
</div>
```

### cuvr.wheel.js

Add mouse wheel scroll scale function.

### cuvr.gyro.js

Add gyro sensor support. This plugin is in very alpha stage.

## How to create plugin

```JavaScript
// cuvr is CuVR's instance.
// opts is option object passed to CuVR constructor
CuVR.plugins['YourPluginName'] = function(cuvr, opts) {
  // options (if required)
  opts['yourPluginName'] = CuVR.extend({
    // default values
  }, opts['yourPluginName']);

  // public API
  cuvr['yourPluginName'] = {
    // public APIs
  };

  // other initialization codes
};
```

## License

MIT License. See the LICENSE file for more info.
