/*
 * CuVR (c) 2014 eje inc. http://www.eje-c.com License: MIT
 */
CuVR.plugins.Object = function(cuvr, opts) {
  cuvr.objects = Array.prototype.map.call(opts.root.querySelectorAll('.cuvr-view > .cuvr-object'), function(elm) {
    // clone to each .cuvr-face
    var elements = Array.prototype.map.call(opts.root.querySelectorAll('.cuvr-face'), function(face) {
      var cloned = elm.cloneNode();
      face.appendChild(cloned);
      return cloned;
    });

    var pos = {
      x: elm.dataset.posX ? Number(elm.dataset.posX) : 0,
      y: elm.dataset.posY ? Number(elm.dataset.posY) : 0,
      z: elm.dataset.posZ ? Number(elm.dataset.posZ) : -1
    };

    // delete original element
    elm.parentNode.removeChild(elm);

    updatePosition();

    return {
      position: position
    };

    function position(x, y, z) {
      if (arguments.length === 0) return pos;

      if (typeof x === 'number') pos.x = x;
      if (typeof y === 'number') pos.y = y;
      if (typeof z === 'number') pos.z = z;
      updatePosition();
    }

    function updatePosition() {
      // set front position
      if (pos.z < 0) {
        var x = -pos.x / pos.z;
        var y = -pos.y / pos.z;
        elements[0].style.left = (x + 1) * 50 + '%';
        elements[0].style.top = (y - 1) * -50 + '%';
        elements[0].style.display = 'block';
      } else {
        elements[0].style.display = 'none';
      }

      // set right position
      if (pos.x > 0) {
        var y = pos.y / pos.x;
        var z = pos.z / pos.x;
        elements[1].style.left = (z + 1) * 50 + '%';
        elements[1].style.top = (y - 1) * -50 + '%';
        elements[1].style.display = 'block';
      } else {
        elements[1].style.display = 'none';
      }

      // set back position
      if (pos.z > 0) {
        var x = pos.x / pos.z;
        var y = pos.y / pos.z;
        elements[2].style.left = (x - 1) * -50 + '%';
        elements[2].style.top = (y - 1) * -50 + '%';
        elements[2].style.display = 'block';
      } else {
        elements[2].style.display = 'none';
      }

      // set left position
      if (pos.x < 0) {
        var y = -pos.y / pos.x;
        var z = -pos.z / pos.x;
        elements[3].style.left = (z - 1) * -50 + '%';
        elements[3].style.top = (y - 1) * -50 + '%';
        elements[3].style.display = 'block';
      } else {
        elements[3].style.display = 'none';
      }

      // set top position
      if (pos.y > 0) {
        var x = pos.x / pos.y;
        var z = pos.z / pos.y;
        elements[4].style.left = (x + 1) * 50 + '%';
        elements[4].style.top = (z - 1) * -50 + '%';
        elements[4].style.display = 'block';
      } else {
        elements[4].style.display = 'none';
      }

      // set bottom position
      if (pos.y < 0) {
        var x = -pos.x / pos.y;
        var z = -pos.z / pos.y;
        elements[5].style.left = (x + 1) * 50 + '%';
        elements[5].style.top = (z + 1) * 50 + '%';
        elements[5].style.display = 'block';
      } else {
        elements[5].style.display = 'none';
      }
    }
  });
};