/*
 * CuVR (c) 2014 eje inc. http://www.eje-c.com License: MIT
 */
function CuVR(opts) {
  opts = CuVR.extend({
    id: window.location.pathname,
    updateInterval: 100,
    cubeSize: Math.min(window.innerWidth, window.innerHeight),
    cssTransition: true,
    root: opts && opts.root && document.querySelector(opts.root) || document
  }, opts);

  // public API
  this.setCubeSize = setCubeSize;
  this.look = look;
  this.backupExists = backupExists;
  this.update = update;
  this.heading = this.yaw = this.y = this.rotateY = setOrGetRotateY;
  this.attitude = this.pitch = this.z = this.rotateZ = setOrGetRotateZ;
  this.bank = this.roll = this.x = this.rotateX = setOrGetRotateX;
  this.view = opts.root.querySelector('.cuvr-view');
  this.cube = opts.root.querySelector('.cuvr-cube');

  // private variables
  var self = this;
  var rotateX = window.sessionStorage && Number(sessionStorage[opts.id + '-cuvrRotateX']) || opts.rotateX || opts.x || opts.roll || opts.bank || 0;
  var rotateY = window.sessionStorage && Number(sessionStorage[opts.id + '-cuvrRotateY']) || opts.rotateY || opts.y || opts.yaw || opts.heading || 0;
  var rotateZ = window.sessionStorage && Number(sessionStorage[opts.id + '-cuvrRotateZ']) || opts.rotateZ || opts.z || opts.pitch || opts.attitude || 0;
  var cubeSizeHalf;
  var root = opts.root;
  var view = this.view;
  var cube = this.cube;
  var venderPrefixes = ['webkit', 'moz'];

  // plug-in support
  for ( var plugin in CuVR.plugins) {
    CuVR.plugins[plugin](self, opts);
  }

  // fullscreen option
  if (!!opts.fullscreen) {
    setCubeSizeToFullscreen();
    window.addEventListener('resize', setCubeSizeToFullscreen);

    // prevent scroll with mouse wheel
    view.addEventListener('wheel', function(e) {
      e.preventDefault();
      e.stopPropagation();
    });
  } else {
    setCubeSize(opts.cubeSize);
  }

  // anchor tag touch support
  Array.prototype.forEach.call(root.querySelectorAll('a'), function(a) {
    // if user taps <a> trigger click event
    a.ontouchstart = function(e) {
      a.ontouchend = function(e) {
        a.click();
      };

      setTimeout(function() {
        a.ontouchend = null;
      }, 200);
    };
  });

  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  if (requestAnimationFrame && opts.updateInterval === 'auto') {
    // update view matrix on every animation frame
    var prevTime;
    requestAnimationFrame(function _loop(timestamp) {
      if (prevTime) {
        var dt = timestamp - prevTime;

        // apply css transition
        if (opts.cssTransition) {
          setStyle(cube, 'transitionDuration', dt + 'ms');
        }

        update();
      }

      prevTime = timestamp;
      requestAnimationFrame(_loop);
    });
  } else if (typeof opts.updateInterval === 'number') {
    // update view matrix on every updateInterval millis.
    setInterval(update, opts.updateInterval);
  } else {
    // apply initial position
    update();
  }

  // enable CSS transition
  if (opts.cssTransition) {
    if (typeof opts.updateInterval === 'number') {
      setTimeout(updateTransitionDuration, opts.updateInterval);
    } else {
      updateTransitionDuration();
    }
  }

  // backup current rotation to sessionStorage
  if (window.sessionStorage) {
    setInterval(function() {
      sessionStorage[opts.id + '-cuvrRotateX'] = rotateX;
      sessionStorage[opts.id + '-cuvrRotateY'] = rotateY;
      sessionStorage[opts.id + '-cuvrRotateZ'] = rotateZ;
    }, 500);
  }

  /**
   * Update screen.
   */
  function update() {
    setStyle(cube, 'transform', 'translateZ(' + cubeSizeHalf + 'px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) rotateZ(' + rotateZ + 'deg)');
  }

  /**
   * Update cube's transition-duration style.
   */
  function updateTransitionDuration() {
    setStyle(cube, 'transitionDuration', opts.updateInterval + 'ms');
  }

  /**
   * Set cube size.
   */
  function setCubeSize(size) {
    // -1 is to prevent white border between each faces
    cubeSizeHalf = size / 2 - 1;

    view.style.width = view.style.height = size + 'px';
    setStyle(view, 'perspective', cubeSizeHalf + 'px');

    cube.style.width = cube.style.height = size + 'px';

    setStyle(root.querySelector('.cuvr-cube .front'), 'transform', 'translateZ(' + -cubeSizeHalf + 'px)');
    setStyle(root.querySelector('.cuvr-cube .right'), 'transform', 'rotateY(-90deg) translateZ(' + -cubeSizeHalf + 'px)');
    setStyle(root.querySelector('.cuvr-cube .back'), 'transform', 'rotateY(180deg) translateZ(' + -cubeSizeHalf + 'px)');
    setStyle(root.querySelector('.cuvr-cube .left'), 'transform', 'rotateY(90deg) translateZ(' + -cubeSizeHalf + 'px)');
    setStyle(root.querySelector('.cuvr-cube .top'), 'transform', 'rotateX(-90deg) translateZ(' + -cubeSizeHalf + 'px)');
    setStyle(root.querySelector('.cuvr-cube .bottom'), 'transform', 'rotateX(90deg) translateZ(' + -cubeSizeHalf + 'px)');
  }

  /**
   * Set cube size to fill entire window and set additional styles to view
   * element and its parent.
   */
  function setCubeSizeToFullscreen() {
    var size = Math.max(window.innerWidth, window.innerHeight);
    var l = (window.innerWidth - size) * 0.5;
    var t = (window.innerHeight - size) * 0.5;
    view.style.left = l + 'px';
    view.style.top = t + 'px';
    view.parentNode.style.overflow = 'hidden';
    setCubeSize(size);
  }

  function setStyle(elm, name, value) {
    var capitalized = name.substr(0, 1).toUpperCase() + name.substr(1);
    venderPrefixes.forEach(function(prefix) {
      elm.style[prefix + capitalized] = value;
    });
    elm.style[name] = value;
  }

  /**
   * Set view point to front,right,back,left,top,bottom.
   */
  function look(to) {
    switch (to) {
    case 'front':
      return self.rotateX(0).rotateY(0);
    case 'right':
      return self.rotateX(0).rotateY(90);
    case 'back':
      return self.rotateX(0).rotateY(180);
    case 'left':
      return self.rotateX(0).rotateY(270);
    case 'top':
      return self.rotateX(90).rotateY(0);
    case 'bottom':
      return self.rotateX(-90).rotateY(0);
    }

    return self;
  }

  /**
   * Check previous view point.
   */
  function backupExists() {
    return window.sessionStorage && sessionStorage[opts.id + '-cuvrRotateX'] && sessionStorage[opts.id + '-cuvrRotateY'] && sessionStorage[opts.id + '-cuvrRotateZ'];
  }

  function setOrGetRotateX(arg) {
    if (arg === undefined) {
      return rotateX;
    } else {
      rotateX = arg;
      return self;
    }
  }

  function setOrGetRotateY(arg) {
    if (arg === undefined) {
      return rotateY;
    } else {
      rotateY = arg;
      return self;
    }
  }

  function setOrGetRotateZ(arg) {
    if (arg === undefined) {
      return rotateZ;
    } else {
      rotateZ = arg;
      return self;
    }
  }
}

CuVR.plugins = {};

/**
 * Copy all properties from src(s) to dst and return dst.
 */
CuVR.extend = function(dst/* , src... */) {
  if (!dst) return dst;

  for (var i = 1; i < arguments.length; i++) {
    var obj = arguments[i];
    if (obj) {
      for ( var prop in obj) {
        dst[prop] = arguments[i][prop];
      }
    }
  }
  return dst;
};

/*
 * EventEmitter
 */
CuVR.prototype.on = function(type, callback) {
  var self = this;

  if (!self.callbacks) {
    self.callbacks = {};
  }

  if (!self.callbacks[type]) {
    self.callbacks[type] = [];
  }

  if (self.callbacks[type].indexOf(callback) === -1) {
    self.callbacks[type].push(callback);
  }

  return self;
};

CuVR.prototype.emit = function(type) {
  var self = this, callbacks, callbacksInType;

  if (!(callbacks = self.callbacks)) return;
  if (!(callbacksInType = callbacks[type])) return;

  var args = Array.prototype.slice.call(arguments, 1);

  callbacksInType.forEach(function(callback) {
    callback.apply(self, args);
  });

  return self;
};

CuVR.prototype.off = function(type, callback) {
  var self = this, callbacks, callbacksInType, index;

  if (!(callbacks = self.callbacks)) return;
  if (!(callbacksInType = callbacks[type])) return;

  if (callback) {
    if ((index = callbacksInType.indexOf(callback)) !== -1) {
      callbacksInType.splice(index, 1);
    }
  } else {
    delete callbacks[type];
  }

  return self;
};