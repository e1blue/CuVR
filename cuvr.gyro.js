/*
 * CuVR (c) 2014 eje inc. http://www.eje-c.com License: MIT
 * 
 * based on krpano Gyroscope Plugin
 * http://fieldofview.github.io/krpano_fovplugins/gyro/plugin.html
 */
CuVR.plugins.Gyro = function(cuvr, opts) {
  // options
  opts.gyro = CuVR.extend({
    enabled: true,
    velastic: 0,
    vrelative: false,
    camroll: false,
    friction: 0.5
  }, opts.gyro);

  // public API
  cuvr.gyro = {
    enable: enable,
    disable: disable,
    toggle: toggle
  };

  if (opts.gyro.enabled) {
    enable();
  }

  // mock
  var krpano = {
    view: {
      hlookat: 0,
      vlookat: 0,
      camroll: 0
    }
  };
  var isVRelative = false, isCamRoll = false, friction = opts.gyro.friction, validSample = false, firstSample = null, hOffset = 0, vOffset = 0, hLookAt = 0, vLookAt = 0, camRoll = 0, degRad = Math.PI / 180;
  var enabled = false;

  function enable() {
    enabled = true;
    window.addEventListener('deviceorientation', handleDeviceOrientation);
  }

  function disable() {
    enabled = false;
    window.removeEventListener('deviceorientation', handleDeviceOrientation);
  }

  function toggle() {
    if (enabled)
      disable();
    else
      enable();
  }

  function handleDeviceOrientation(e) {
    // Process event.alpha, event.beta and event.gamma
    var deviceOrientation = top.orientation, orientation = rotateEuler({
      yaw: event["alpha"] * degRad,
      pitch: event["beta"] * degRad,
      roll: event["gamma"] * degRad
    }), yaw = wrapAngle(orientation.yaw / degRad), pitch = orientation.pitch / degRad, altYaw = yaw, factor, hLookAtNow = krpano.view.hlookat, vLookAtNow = krpano.view.vlookat, camRollNow = krpano.view.camroll, hSpeed = hLookAtNow - hLookAt, vSpeed = vLookAtNow - vLookAt;

    // Ignore all sample untill we get a sample that is different from the first
    // sample
    if (!validSample) {
      if (firstSample == null)
        firstSample = orientation;
      else {
        if (orientation.yaw != firstSample.yaw || orientation.pitch != firstSample.pitch || orientation.roll != firstSample.roll) {
          firstSample = null;
          validSample = true;
          if (isVRelative) vOffset = -pitch;
        }
      }
      return;
    }

    if (isCamRoll) {
      camRoll = wrapAngle(180 + Number(deviceOrientation) - orientation.roll / degRad);
    }

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

      factor = Math.min(1, (Math.abs(pitch) - 70) / 10);
      yaw = yaw * (1 - factor) + altYaw * factor;

      camRoll *= (1 - factor);
    }

    // Track view change since last orientation event
    // ie: user has manually panned, or krpano has altered lookat
    hOffset += hSpeed;
    vOffset += vSpeed;

    // Clamp vOffset
    if (Math.abs(pitch + vOffset) > 90) vOffset = (pitch + vOffset > 0) ? (90 - pitch) : (-90 - pitch);

    hLookAt = wrapAngle(-yaw - 180 + hOffset);
    vLookAt = Math.max(Math.min((pitch + vOffset), 90), -90);

    // Dampen lookat
    if (Math.abs(hLookAt - hLookAtNow) > 180) hLookAtNow += (hLookAt > hLookAtNow) ? 360 : -360;

    hLookAt = (1 - friction) * hLookAt + friction * hLookAtNow;
    vLookAt = (1 - friction) * vLookAt + friction * vLookAtNow;

    if (Math.abs(camRoll - camRollNow) > 180) camRollNow += (camRoll > camRollNow) ? 360 : -360;
    camRoll = (1 - friction) * camRoll + friction * camRollNow;

    krpano.view.hlookat = wrapAngle(hLookAt);
    krpano.view.vlookat = vLookAt;
    krpano.view.camroll = wrapAngle(camRoll);

    cuvr.y(krpano.view.hlookat);
    cuvr.x(-krpano.view.vlookat);
  }
  function rotateEuler(euler) {
    // This function is based on
    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/eulerToMatrix/index.htm
    // and
    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToEuler/index.htm

    var heading, bank, attitude, ch = Math.cos(euler.yaw), sh = Math.sin(euler.yaw), ca = Math.cos(euler.pitch), sa = Math.sin(euler.pitch), cb = Math.cos(euler.roll), sb = Math.sin(euler.roll), matrix = [sh * sb - ch * sa * cb, -ch * ca, ch * sa * sb + sh * cb, ca * cb, -sa, -ca * sb, sh * sa * cb + ch * sb, sh * ca, -sh * sa * sb + ch * cb];
    // Note: Includes 90 degree rotation around z axis

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

  // //////////////////////////////////////////////////////////
  // utility functions
  // wrap a value between -180 and 180
  function wrapAngle(value) {
    value = value % 360;
    return (value <= 180) ? value : value - 360;
  }
};
