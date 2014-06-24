/*
 * CuVR (c) 2014 eje inc. http://www.eje-c.com License: MIT
 */
CuVR.plugins.Wheel = function(cuvr, opts) {
  opts.wheel = CuVR.extend({
    max: 1.5,
    min: 0.5
  }, opts.wheel);

  opts.root.querySelector('.cuvr-view').addEventListener('wheel', function(e) {
    if (e.deltaY < 0) {
      cuvr.scale *= 1.1;
    } else {
      cuvr.scale *= 0.9;
    }

    if (cuvr.scale < opts.wheel.min) {
      cuvr.scale = opts.wheel.min;
    } else if (cuvr.scale > opts.wheel.max) {
      cuvr.scale = opts.wheel.max;
    }
  });
};