/*
 * CuVR (c) 2014 eje inc. http://www.eje-c.com License: MIT
 */
CuVR.plugins.Control = function(cuvr, opts) {
  // options
  opts.control = CuVR.extend({
    enabled: true,
    scrollSensitivity: 0.5,
    horizontal: true,
    vertical: true,
  }, opts.control);

  // public API
  cuvr.control = {
    enable: enable,
    disable: disable,
    toggle: toggle,
    horizontal: opts.control.horizontal,
    vertical: opts.control.vertical
  };

  if (opts.control.enabled) {
    enable();
  }

  var enabled, prevX = prevY = -1, scrollSensitivity = opts.control.scrollSensitivity;

  function enable() {
    if (!enabled) {
      enabled = true;

      cuvr.view.addEventListener('mousedown', ondown);
      cuvr.view.addEventListener('touchstart', ondown);
    }

    return cuvr;
  }

  function disable() {
    if (enabled) {
      enabled = false;

      cuvr.view.removeEventListener('mousedown', ondown);
      cuvr.view.removeEventListener('touchstart', ondown);
    }

    return cuvr;
  }

  function toggle() {
    if (enabled)
      return disable();
    else
      return enable();
  }

  /**
   * Mouse and Touch support
   */
  function ondown(e) {
    e.preventDefault();

    opts.root.addEventListener('touchmove', onmove);
    opts.root.addEventListener('touchend', onup);
    opts.root.addEventListener('mousemove', onmove);
    opts.root.addEventListener('mouseup', onup);
  }

  function onmove(e) {
    // if both scroll are disabled do nothing.
    if (!cuvr.control.horizontal && !cuvr.control.vertical) return;

    // normalize mouse and touch event
    var x = e.clientX || e.changedTouches && e.changedTouches[0].clientX || 0;
    var y = e.clientY || e.changedTouches && e.changedTouches[0].clientY || 0;
    var newY = cuvr.rotateY();
    var newX = cuvr.rotateX();

    if (prevX !== -1 && prevY !== -1) {
      if (cuvr.control.horizontal) {
        var dx = x - prevX;
        dx = dx / opts.cubeSize * 360 * scrollSensitivity;
        newY -= dx;
      }

      if (cuvr.control.vertical) {
        var dy = y - prevY;
        dy = dy / opts.cubeSize * 360 * scrollSensitivity;
        newX += dy;

        if (newX > 90) {
          newX = 90;
        } else if (newX < -90) {
          newX = -90;
        }
      }

      cuvr.rotateY(newY).rotateX(newX);
      notifyRotateChange();
    }

    prevX = x;
    prevY = y;
  }

  function onup(e) {
    opts.root.removeEventListener('mousemove', onmove);
    opts.root.removeEventListener('mouseup', onup);
    opts.root.removeEventListener('touchmove', onmove);
    opts.root.removeEventListener('touchend', onup);

    // invalidate prevX,prevY
    prevX = prevY = -1;
  }

  function notifyRotateChange() {
    cuvr.emit('rotationChange', {
      x: cuvr.x(),
      y: cuvr.y(),
      z: cuvr.z()
    });
  }
};