/*
 * CuVR (c) 2014 eje inc. http://www.eje-c.com License: MIT
 */
CuVR.plugins.Gyro = function(cuvr, opts) {
  // options
  opts.gyro = CuVR.extend({
    enable: true
  }, opts.gyro);

  // public API
  cuvr.gyro = {
    enable: enable,
    disable: disable,
    isEnabled: isEnabled,
    toggle: toggle
  };

  // private
  var enabled;

  if (opts.gyro.enable) {
    enable();
  }

  function enable() {
    if (!enabled) {
      window.addEventListener('deviceorientation', handleOrientation);
      enabled = true;
    }
  }

  function disable() {
    if (enabled) {
      window.removeEventListener('deviceorientation', handleOrientation);
      enabled = false;
    }
  }

  function isEnabled() {
    return enabled;
  }

  function toggle() {
    if (enabled)
      disable();
    else
      enable();
  }

  function handleOrientation(e) {
    cuvr.rotateY = -(e.alpha + e.gamma);
    cuvr.rotateX = e.beta - 90;
  }
};
