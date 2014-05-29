CuVR
=====

CuVR is library to build CubicVR Web page.

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

The MIT License (MIT)

Copyright (c) 2014 eje inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.