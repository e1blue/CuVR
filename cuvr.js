/*
 * CuVR (c) 2014 eje inc. http://www.eje-c.com License: MIT
 */
function CuVR(opts) {
  opts = CuVR.extend({
    id: window.location.pathname,
    updateInterval: 100,
    cubeSize: Math.min(window.innerWidth, window.innerHeight),
    scrollSensitivity: 0.5,
    mouse: true,
    touch: true,
    horizontalScroll: true,
    verticalScroll: true,
    cssTransition: true,
    root: opts && opts.root && document.querySelector(opts.root) || document,
    scale: 1
  }, opts);

  // public API
  this.enableControl = enableControl;
  this.disableControl = disableControl;
  this.scale = opts.scale;
  this.verticalScroll = opts.verticalScroll;
  this.horizontalScroll = opts.horizontalScroll;
  this.setCubeSize = setCubeSize;
  this.look = look;
  this.backupExists = backupExists;
  this.update = update;
  this.heading = setOrGetRotateY;
  this.attitude = setOrGetRotateZ;
  this.bank = setOrGetRotateX;
  this.yaw = setOrGetRotateY;
  this.pitch = setOrGetRotateZ;
  this.roll = setOrGetRotateX;
  this.x = setOrGetRotateX;
  this.y = setOrGetRotateY;
  this.z = setOrGetRotateZ;
  this.rotateX = setOrGetRotateX;
  this.rotateY = setOrGetRotateY;
  this.rotateZ = setOrGetRotateZ;
  this.view = opts.root.querySelector('.cuvr-view');
  this.cube = opts.root.querySelector('.cuvr-cube');

  // private variables
  var self = this;
  var rotateX = window.sessionStorage && Number(sessionStorage[opts.id + '-cuvrRotateX']) || opts.rotateX || opts.x || opts.roll || opts.bank || 0;
  var rotateY = window.sessionStorage && Number(sessionStorage[opts.id + '-cuvrRotateY']) || opts.rotateY || opts.y || opts.yaw || opts.heading || 0;
  var rotateZ = window.sessionStorage && Number(sessionStorage[opts.id + '-cuvrRotateZ']) || opts.rotateZ || opts.z || opts.pitch || opts.attitude || 0;
  var cubeSizeHalf;
  var prevX = prevY = -1;
  var root = opts.root;
  var view = this.view;
  var cube = this.cube;
  var venderPrefixes = ['webkit', 'moz'];

  // plug-in support
  for ( var plugin in CuVR.plugins) {
    CuVR.plugins[plugin](this, opts);
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

  // Listen mouse & touch events
  enableControl(opts);

  // update view matrix on every updateInterval millis.
  if (opts.updateInterval === 'auto') {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    requestAnimationFrame(function _loop(timestamp) {
      if (_loop.prevTime) {
        var dt = timestamp - _loop.prevTime;

        // apply css transition
        if (opts.cssTransition) {
          setStyle(cube, 'transitionDuration', dt + 'ms');
        }

        update();
      }

      _loop.prevTime = timestamp;
      requestAnimationFrame(_loop);
    });
  } else if (typeof opts.updateInterval === 'number') {
    setInterval(update, opts.updateInterval);
  } else {
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

  /**
   * Update screen.
   */
  function update() {
    setStyle(cube, 'transform', 'translateZ(' + cubeSizeHalf * self.scale + 'px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) rotateZ(' + rotateZ + 'deg)');

    // backup
    if (window.sessionStorage) {
      sessionStorage[opts.id + '-cuvrRotateX'] = rotateX;
      sessionStorage[opts.id + '-cuvrRotateY'] = rotateY;
      sessionStorage[opts.id + '-cuvrRotateZ'] = rotateZ;
    }
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

  /**
   * Enable specified controls. controlOpts can be String or Object.
   */
  function enableControl(controlOpts) {
    if (controlOpts === 'mouse' || typeof controlOpts.mouse === 'boolean' && controlOpts.mouse) {
      opts.mouse = true;
      view.addEventListener('mousedown', ondown);
    }

    if (controlOpts === 'touch' || typeof controlOpts.touch === 'boolean' && controlOpts.touch) {
      opts.touch = true;
      view.addEventListener('touchstart', ondown);
    }
  }

  /**
   * Disable specified controls (or all controls)
   */
  function disableControl(controlOpts) {
    if (typeof controlOpts === 'undefined') {
      controlOpts = {
        mouse: true,
        touch: true
      };
    }

    if (controlOpts === 'mouse' || typeof controlOpts.mouse === 'boolean' && controlOpts.mouse) {
      opts.mouse = false;
      view.removeEventListener('mousedown', ondown);
      root.removeEventListener('mousemove', onmove);
      root.removeEventListener('mouseup', onup);
    }

    if (controlOpts === 'touch' || typeof controlOpts.touch === 'boolean' && controlOpts.touch) {
      opts.touch = false;
      view.removeEventListener('touchstart', ondown);
      root.removeEventListener('touchmove', onmove);
      root.removeEventListener('touchend', onup);
    }
  }

  /**
   * Mouse and Touch support
   */
  function ondown(e) {
    e.preventDefault();

    if (opts.touch) {
      root.addEventListener('touchmove', onmove);
      root.addEventListener('touchend', onup);
    }

    if (opts.mouse) {
      root.addEventListener('mousemove', onmove);
      root.addEventListener('mouseup', onup);
    }
  }

  function onmove(e) {
    // normalize mouse and touch event
    var x = e.clientX || e.changedTouches && e.changedTouches[0].clientX || 0;
    var y = e.clientY || e.changedTouches && e.changedTouches[0].clientY || 0;
    var newY = self.rotateY();
    var newX = self.rotateX();

    if (prevX !== -1 && prevY !== -1) {
      if (self.horizontalScroll) {
        var dx = x - prevX;
        dx = dx / opts.cubeSize * 360 * opts.scrollSensitivity;
        newY -= dx;
      }

      if (self.verticalScroll) {
        var dy = y - prevY;
        dy = dy / opts.cubeSize * 360 * opts.scrollSensitivity;
        newX += dy;

        if (newX > 90) {
          newX = 90;
        } else if (newX < -90) {
          newX = -90;
        }
      }
      
      self.rotateY(newY).rotateX(newX);
    }

    prevX = x;
    prevY = y;
  }

  function onup(e) {
    root.removeEventListener('mousemove', onmove);
    root.removeEventListener('mouseup', onup);
    root.removeEventListener('touchmove', onmove);
    root.removeEventListener('touchend', onup);

    // invalidate prevX,prevY
    prevX = prevY = -1;
  }

  function setStyle(elm, name, value) {
    var capitalized = name.substr(0, 1).toUpperCase() + name.substr(1);
    venderPrefixes.forEach(function(prefix) {
      elm.style[prefix + capitalized] = value;
    });
    elm.style[name] = value;
  }

  function look(to) {
    if (typeof to === 'string') {
      switch (to) {
      case 'front':
        self.rotateX(0).rotateY(0);
        break;
      case 'right':
        self.rotateX(0).rotateY(90);
        break;
      case 'back':
        self.rotateX(0).rotateY(180);
        break;
      case 'left':
        self.rotateX(0).rotateY(270);
        break;
      case 'top':
        self.rotateX(90).rotateY(0);
        break;
      case 'bottom':
        self.rotateX(-90).rotateY(0);
        break;
      }
    }
  }

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