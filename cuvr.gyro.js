/*
 * CuVR (c) 2014 eje inc. http://www.eje-c.com License: MIT
 */
CuVR.plugins.Gyro = function(cuvr, opts) {

  window.addEventListener('deviceorientation', function(e) {
    cuvr.rotateY = -(e.alpha + e.gamma);
    cuvr.rotateX = e.beta - 90;
  });
};
