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

  // private variables
  var cubeSizeHalf = opts.cubeSize / 2;
  var prevX = prevY = -1;
  var self = this;
  var root = opts.root && document.querySelector(opts.root) || document;
  var view = root.querySelector('.cuvr-view');
  var cube = root.querySelector('.cuvr-cube');

  // apply styles
  view.style.width = view.style.height = opts.cubeSize + 'px';
  view.style.webkitPerspective = cubeSizeHalf + 'px';

  cube.style.width = cube.style.height = opts.cubeSize + 'px';
  cube.style.webkitTransform = 'translateZ(' + cubeSizeHalf + 'px) rotateX(0deg) rotateY(0deg)';

  root.querySelector('.cuvr-cube .front').style.webkitTransform = 'translateZ(' + -cubeSizeHalf + 'px)';
  root.querySelector('.cuvr-cube .right').style.webkitTransform = 'rotateY(-90deg) translateZ(' + -cubeSizeHalf + 'px)';
  root.querySelector('.cuvr-cube .back').style.webkitTransform = 'rotateY(180deg) translateZ(' + -cubeSizeHalf + 'px)';
  root.querySelector('.cuvr-cube .left').style.webkitTransform = 'rotateY(90deg) translateZ(' + -cubeSizeHalf + 'px)';
  root.querySelector('.cuvr-cube .top').style.webkitTransform = 'rotateX(-90deg) translateZ(' + -cubeSizeHalf + 'px)';
  root.querySelector('.cuvr-cube .bottom').style.webkitTransform = 'rotateX(90deg) translateZ(' + -cubeSizeHalf + 'px)';

  // anchor tag touch support
  Array.prototype.forEach.call(root.querySelectorAll('a'), function(a) {
    a.ontouchstart = function(e) {
      a.click();
    };
  });

  // Listen mouse & touch events
  enableControl(opts);

  // update view matrix on every updateInterval millis.
  setInterval(function() {
    cube.style.webkitTransform = 'translateZ(' + cubeSizeHalf + 'px) rotateX(' + self.rotateX.toFixed(2) + 'deg) rotateY(' + self.rotateY.toFixed(2) + 'deg)';
  }, opts.updateInterval);

  // enable CSS transition
  if (opts.cssTransition) {
    setTimeout(function() {
      cube.style.transitionDuration = opts.updateInterval + 'ms';
    }, opts.updateInterval);
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
    var x = e.x || e.changedTouches && e.changedTouches[0].clientX || 0;
    var y = e.y || e.changedTouches && e.changedTouches[0].clientY || 0;

    if (prevX !== -1 && prevY !== -1) {
      if (opts.horizontalScroll) {
        var dx = x - prevX;
        dx = dx / opts.cubeSize * 360 * opts.scrollSensitivity;
        self.rotateY -= dx;
      }

      if (opts.verticalScroll) {
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
}