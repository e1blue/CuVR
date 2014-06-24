/*
 * CuVR (c) 2014 eje inc. http://www.eje-c.com License: MIT
 */
CuVR.plugins.Keyboard = function(cuvr, opts) {
  // options
  opts.keyboard = CuVR.extend({
    enable: true
  }, opts.keyboard);

  // public API
  cuvr.keyboard = {
    enable: enable,
    disable: disable
  };

  if (opts.keyboard.enable) {
    enable();
  }

  function enable() {
    opts.root.addEventListener('keydown', onKeyDown);
  }

  function disable() {
    opts.root.removeEventListener('keydown', onKeyDown);
  }

  /**
   * Keyboard support
   */
  function onKeyDown(e) {
    switch (e.keyCode) {
    case 37:// left
      cuvr.rotateY--;
      break;
    case 38:// top
      cuvr.rotateX++;
      break;
    case 39:// right
      cuvr.rotateY++;
      break;
    case 40:// bottom
      cuvr.rotateX--;
      break;
    }
  }
};