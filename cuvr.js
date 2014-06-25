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
    root: opts && opts.root && document.querySelector(opts.root) || document
  }, opts);

  // public API
  this.enableControl = enableControl;
  this.disableControl = disableControl;
  this.scale = 1;
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

  // private variables
  var self = this;
  var rotateX = 0;
  var rotateY = 0;
  var rotateZ = 0;
  var cubeSizeHalf;
  var prevX = prevY = -1;
  var root = opts.root;
  var view = root.querySelector('.cuvr-view');
  var cube = root.querySelector('.cuvr-cube');

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
  }

  // restore from backup
  if (window.sessionStorage) {
    rotateX = Number(sessionStorage[opts.id + '-cuvrRotateX']) || 0;
    rotateY = Number(sessionStorage[opts.id + '-cuvrRotateY']) || 0;
    rotateZ = Number(sessionStorage[opts.id + '-cuvrRotateZ']) || 0;
  }

  // enable CSS transition
  if (opts.cssTransition) {
    setTimeout(function() {
      setStyle(cube, 'transitionDuration', opts.updateInterval + 'ms');
    }, opts.updateInterval);
  }

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
   * Set cube size.
   */
  function setCubeSize(size) {
    // -1 is to prevent white border between each faces
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

    if (prevX !== -1 && prevY !== -1) {
      if (self.horizontalScroll) {
        var dx = x - prevX;
        dx = dx / opts.cubeSize * 360 * opts.scrollSensitivity;
        rotateY -= dx;
      }

      if (self.verticalScroll) {
        var dy = y - prevY;
        dy = dy / opts.cubeSize * 360 * opts.scrollSensitivity;
        rotateX += dy;

        if (rotateX > 90) {
          rotateX = 90;
        } else if (rotateX < -90) {
          rotateX = -90;
        }
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
  }

  function setStyle(elm, name, value) {
    var capitalized = name.substr(0, 1).toUpperCase() + name.substr(1);
    ['webkit', 'moz'].forEach(function(prefix) {
      elm.style[prefix + capitalized] = value;
    });
    elm.style[name] = value;
  }

  function look(to) {
    if (typeof to === 'string') {
      switch (to) {
      case 'front':
        rotateX = 0;
        rotateY = 0;
        break;
      case 'right':
        rotateX = 0;
        rotateY = 90;
        break;
      case 'back':
        rotateX = 0;
        rotateY = 180;
        break;
      case 'left':
        rotateX = 0;
        rotateY = 270;
        break;
      case 'top':
        rotateX = 90;
        rotateY = 0;
        break;
      case 'bottom':
        rotateX = -90;
        rotateY = 0;
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
    }
  }
  function setOrGetRotateY(arg) {
    if (arg === undefined) {
      return rotateY;
    } else {
      rotateY = arg;
    }
  }
  function setOrGetRotateZ(arg) {
    if (arg === undefined) {
      return rotateZ;
    } else {
      rotateZ = arg;
    }
  }
}

CuVR.plugins = {};

CuVR.extend = function(dst, src) {
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