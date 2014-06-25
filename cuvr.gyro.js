/*
 * CuVR (c) 2014 eje inc. http://www.eje-c.com License: MIT
 * 
 * based on krpano Gyroscope Plugin
 * http://fieldofview.github.io/krpano_fovplugins/gyro/plugin.html
 */
CuVR.plugins.Gyro = function(cuvr, opts) {
  // options
  opts.gyro = CuVR.extend({
    enable: true,
    friction: 0.5
  }, opts.gyro);

  // public API
  cuvr.gyro = {
    enable: enable,
    disable: disable,
    isEnabled: isEnabled,
    toggle: toggle
  };

  if (opts.gyro.enable) {
    enable();
  }

  // private
  var enabled, friction = opts.gyro.friction, isTouching = false;

  function enable() {
    if (!enabled) {
      window.addEventListener('deviceorientation', handleOrientation);

      var view = opts.root.querySelector('.cuvr-view');
      view.addEventListener('touchstart', handleTouchStart, true);
      view.addEventListener('touchend', handleTouchEnd, true);
      view.addEventListener('touchcancel', handleTouchEnd, true);
      enabled = true;
    }
  }

  function disable() {
    if (enabled) {
      window.removeEventListener('deviceorientation', handleOrientation);

      var view = opts.root.querySelector('.cuvr-view');
      view.removeEventListener('touchstart', handleTouchStart, true);
      view.removeEventListener('touchend', handleTouchEnd, true);
      view.removeEventListener('touchcancel', handleTouchEnd, true);

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

  function handleTouchStart(event) {
    isTouching = true;
    if (enabled) window.removeEventListener('deviceorientation', handleOrientation);
  }

  function handleTouchEnd(event) {
    isTouching = false;
    if (enabled) window.addEventListener('deviceorientation', handleOrientation);
  }
  var degRad = Math.PI / 180;

  /**
   * many codes from
   * http://fieldofview.github.io/krpano_fovplugins/gyro/plugin.html
   */
  function handleOrientation(event) {
    // Process event.alpha, event.beta and event.gamma
    var deviceOrientation = window.top && top.orientation || window.orientation;
    var orientation = rotateEuler(event.alpha * degRad, event.beta * degRad, event.gamma * degRad);
    var yaw = wrapAngle(orientation.yaw / degRad);
    var pitch = orientation.pitch / degRad, altYaw = yaw;
    var hLookAtNow = cuvr.yaw();
    var vLookAtNow = cuvr.pitch();
    var camRollNow = cuvr.roll();

    camRoll = wrapAngle(180 + Number(deviceOrientation) - orientation.roll / degRad);

    // Fix gimbal lock
    if (Math.abs(pitch) > 70) {
      altYaw = event.alpha;

      switch (deviceOrientation) {
      case 0:
        if (pitch > 0) altYaw += 180;
        break;
      case 90:
        altYaw += 90;
        break;
      case -90:
        altYaw += -90;
        break;
      case 180:
        if (pitch < 0) altYaw += 180;
        break;
      }

      altYaw = wrapAngle(altYaw);
      if (Math.abs(altYaw - yaw) > 180) altYaw += (altYaw < yaw) ? 360 : -360;

      var factor = Math.min(1, (Math.abs(pitch) - 70) / 10);
      yaw = yaw * (1 - factor) + altYaw * factor;

      camRoll *= (1 - factor);
    }

    var hLookAt = wrapAngle(-yaw - 180);
    var vLookAt = Math.max(Math.min((pitch), 90), -90);

    // Dampen lookat
    if (Math.abs(hLookAt - hLookAtNow) > 180) hLookAtNow += (hLookAt > hLookAtNow) ? 360 : -360;

    hLookAt = (1 - friction) * hLookAt + friction * hLookAtNow;
    vLookAt = (1 - friction) * vLookAt + friction * vLookAtNow;

    if (Math.abs(camRoll - camRollNow) > 180) camRollNow += (camRoll > camRollNow) ? 360 : -360;
    camRoll = (1 - friction) * camRoll + friction * camRollNow;

    cuvr.yaw(wrapAngle(hLookAt));
    cuvr.pitch(-vLookAt);
    cuvr.roll(-wrapAngle(camRoll));
  }

  /**
   * See http://fieldofview.github.io/krpano_fovplugins/gyro/plugin.html
   */
  function rotateEuler(yaw, pitch, roll) {
    var heading, bank, attitude, ch = Math.cos(yaw), sh = Math.sin(yaw), ca = Math.cos(pitch), sa = Math.sin(pitch), cb = Math.cos(roll), sb = Math.sin(roll),

    matrix = [sh * sb - ch * sa * cb, -ch * ca, ch * sa * sb + sh * cb, ca * cb, -sa, -ca * sb, sh * sa * cb + ch * sb, sh * ca, -sh * sa * sb + ch * cb];

    /*
     * [m00 m01 m02] 0 1 2 [m10 m11 m12] 3 4 5 [m20 m21 m22] 6 7 8
     */

    if (matrix[3] > 0.9999) {
      // Deal with singularity at north pole
      heading = Math.atan2(matrix[2], matrix[8]);
      attitude = Math.PI / 2;
      bank = 0;
    } else if (matrix[3] < -0.9999) {
      // Deal with singularity at south pole
      heading = Math.atan2(matrix[2], matrix[8]);
      attitude = -Math.PI / 2;
      bank = 0;
    } else {
      heading = Math.atan2(-matrix[6], matrix[0]);
      bank = Math.atan2(-matrix[5], matrix[4]);
      attitude = Math.asin(matrix[3]);
    }

    return {
      yaw: heading,
      pitch: attitude,
      roll: bank
    };
  }

  function wrapAngle(value) {
    value = value % 360;
    return (value <= 180) ? value : value - 360;
  }
};
