/*
 * CuVR (c) 2014 eje inc. http://www.eje-c.com License: MIT
 */
function CuVR(opts) {
  opts = extend({
    updateInterval: 100,
    cubeSize: Math.min(window.innerWidth, window.innerHeight),
    scrollSensitivity: 0.5,
    mouse: true,
    touch: true,
    keyboard: true,
    sensor: false,
    horizontalScroll: true,
    verticalScroll: true,
    cssTransition: true
  }, opts);

  this.enableControl = enableControl;
  this.disableControl = disableControl;
  this.rotateX = 0;
  this.rotateY = 0;
  this.verticalScroll = opts.verticalScroll;
  this.horizontalScroll = opts.horizontalScroll;
  this.setCubeSize = setCubeSize;
  this.look = look;

  // private variables
  var self = this;
  var cubeSizeHalf;
  var prevX = prevY = -1;
  var root = opts.root && document.querySelector(opts.root) || document;
  var view = root.querySelector('.cuvr-view');
  var cube = root.querySelector('.cuvr-cube');

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
  setInterval(function() {
    setStyle(cube, 'transform', 'translateZ(' + cubeSizeHalf + 'px) rotateX(' + self.rotateX.toFixed(2) + 'deg) rotateY(' + self.rotateY.toFixed(2) + 'deg)');
  }, opts.updateInterval);

  // enable CSS transition
  if (opts.cssTransition) {
    setTimeout(function() {
      cube.style.transitionDuration = opts.updateInterval + 'ms';
    }, opts.updateInterval);
  }

  /**
   * Set cube size.
   */
  function setCubeSize(size) {
    cubeSizeHalf = size / 2 - 1;
    view.style.width = view.style.height = size + 'px';
    setStyle(view, 'perspective', cubeSizeHalf + 'px');

    cube.style.width = cube.style.height = size + 'px';
    setStyle(cube, 'transform', 'translateZ(' + cubeSizeHalf + 'px) rotateX(0deg) rotateY(0deg)');

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

    if (controlOpts === 'keyboard' || typeof controlOpts.keyboard === 'boolean' && controlOpts.keyboard) {
      opts.keyboard = true;
      window.addEventListener('keydown', onKeyDown);
    }

    if (controlOpts === 'sensor' || typeof controlOpts.sensor === 'boolean' && controlOpts.sensor) {
      opts.sensor = true;
      window.addEventListener('deviceorientation', onDeviceOrientation);
    }
  }

  /**
   * Disable specified controls (or all controls)
   */
  function disableControl(controlOpts) {
    if (typeof controlOpts === 'undefined') {
      controlOpts = {
        mouse: true,
        touch: true,
        keyboard: true,
        sensor: true
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

    if (controlOpts === 'keyboard' || typeof controlOpts.keyboard === 'boolean' && controlOpts.keyboard) {
      opts.keyboard = false;
      window.removeEventListener('keydown', onKeyDown);
    }

    if (controlOpts === 'sensor' || typeof controlOpts.sensor === 'boolean' && controlOpts.sensor) {
      opts.sensor = false;
      window.removeEventListener('deviceorientation', onDeviceOrientation);
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

    if (opts.sensor) {
      window.removeEventListener('deviceorientation', onDeviceOrientation);
    }

  }

  function onmove(e) {
    // normalize mouse and touch event
    var x = e.clientX || e.changedTouches && e.changedTouches[0].clientX || 0;
    var y = e.clientY || e.changedTouches && e.changedTouches[0].clientY || 0;

    if (prevX !== -1 && prevY !== -1) {
      if (self.horizontalScroll) {
        var dx = x - prevX;
        dx = dx / opts.cubeSize * 360 * opts.scrollSensitivity;
        self.rotateY -= dx;
      }

      if (self.verticalScroll) {
        var dy = y - prevY;
        dy = dy / opts.cubeSize * 360 * opts.scrollSensitivity;
        self.rotateX += dy;
      }
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

    if (opts.sensor) {
      manualAdjustX = self.rotateX;
      manualAdjustY = self.rotateY;
      window.addEventListener('deviceorientation', onDeviceOrientation);
    }
  }

  /**
   * Keyboard support
   */
  function onKeyDown(e) {
    switch (e.keyCode) {
    case 37:// left
      self.rotateY--;
      break;
    case 38:// top
      self.rotateX++;
      break;
    case 39:// right
      self.rotateY++;
      break;
    case 40:// bottom
      self.rotateX--;
      break;
    }
  }

  /**
   * Orientation sensor support
   */
  var a = 0.85;
  var alpha = 0, beta = 0, gamma = 0, prevA = 0, prevB = 0, prevG = 0, offsetA = 0, offsetB = 0, offsetG = 0, manualAdjustX = 0, manualAdjustY = 0;
  function onDeviceOrientation(e) {
    var newAlpha = e.alpha;
    var newBeta = e.beta;
    var newGamma = e.gamma;
    var da = newAlpha - prevA;
    var db = newBeta - prevB;
    var dg = newGamma - prevG;

    // alphaが急激に変化するときの処理
    if (da > 350) {
      // 0 to 360
      offsetA -= 360;
    } else if (da < -350) {
      offsetA += 360;
    }

    prevA = newAlpha;
    prevB = newBeta;
    prevG = newGamma;
    //
    // // betaが急激に変化するときの処理
    // if (db * db > 0) {
    // if (db > 350) {
    // // 0 to 360
    // offsetB -= 360;
    // } else if (db < -350) {
    // offsetB += 360;
    // }
    // db = 0;
    // }

    // apply low pass filter
    alpha = a * alpha + (1 - a) * (e.alpha + offsetA);
    beta = a * beta + (1 - a) * (e.beta + offsetB);
    gamma = a * gamma + (1 - a) * (e.gamma + offsetG);

    self.rotateX = beta - 90 + manualAdjustX;
    self.rotateY = -alpha + manualAdjustY;
  }

  function extend(dst, src) {
    if (!dst) return dst;

    for (var i = 1; i < arguments.length; i++) {
      for ( var prop in arguments[i]) {
        dst[prop] = arguments[i][prop];
      }
    }
    return dst;
  }

  function setStyle(elm, name, value) {
    var capitalized = name.substr(0, 1).toUpperCase() + name.substr(1);
    ['webkit', 'moz'].forEach(function(prefix) {
      elm.style[prefix + capitalized] = value;
    });
    elm.style[name] = value;
  }

  function look(to) {
    switch (to) {
    case 'front':
      self.rotateX = 0;
      self.rotateY = 0;
      break;
    case 'right':
      self.rotateX = 0;
      self.rotateY = 90;
      break;
    case 'back':
      self.rotateX = 0;
      self.rotateY = 180;
      break;
    case 'left':
      self.rotateX = 0;
      self.rotateY = 270;
      break;
    case 'top':
      self.rotateX = 90;
      self.rotateY = 0;
      break;
    case 'bottom':
      self.rotateX = -90;
      self.rotateY = 0;
      break;
    }
  }
}
