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
	cubeSize : 720
});
```

## API

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

## License

MIT License. See the LICENSE file for more info.