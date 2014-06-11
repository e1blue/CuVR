CuVR.plugins.Object = function(cuvr, opts) {
  cuvr.objects = Array.prototype.map.call(opts.root.querySelectorAll('.cuvr-view > .cuvr-object'), function(elm) {
    // 各 .cuvr-face にコピー
    var elements = Array.prototype.map.call(opts.root.querySelectorAll('.cuvr-face'), function(face) {
      var cloned = elm.cloneNode();
      face.appendChild(cloned);
      return cloned;
    });

    // .cuvr-view の直下から削除
    elm.parentNode.removeChild(elm);

    // 位置
    var pos = {
      x: Number(elm.dataset.posX) || 0,
      y: Number(elm.dataset.posY) || 0,
      z: Number(elm.dataset.posZ) || -1
    };

    // 向き
    var direction = {
      x: Number(elm.dataset.directionX) || 1,
      y: Number(elm.dataset.directionY) || 0
    };

    updatePosition();

    return {
      setPosition: setPosition,
      translateX: translateX,
      translateY: translateY,
      translateZ: translateZ,
      progress: progress,
      turn: turn
    };

    function setPosition(x, y, z) {
      pos.x = x;
      pos.y = y;
      pos.z = z;
      updatePosition();
    }

    function translateX(dx) {
      pos.x += dx;
      updatePosition();
    }

    function translateY(dy) {
      pos.y += dy;
      updatePosition();
    }

    function translateZ(dz) {
      pos.z += dz;
      updatePosition();
    }

    function progress(amount) {
      var len = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
      if (len === 0) return;

      var dx = direction.x / len * amount;
      var dy = direction.y / len * amount;

      var angleXZ = Math.atan2(pos.x, -pos.z);

      if (angleXZ >= -QUARTER_PI && angleXZ < QUARTER_PI) {
        // on front
        pos.x += dx;
        pos.y += dy;
      } else if (angleXZ >= -QUARTER_PI && angleXZ < 3 * QUARTER_PI) {
        // on right
        pos.z += dx;
        pos.y += dy;
      } else if (angleXZ >= 3 * QUARTER_PI || angleXZ < -3 * QUARTER_PI) {
        // on back
        pos.x -= dx;
        pos.y += dy;
      } else if (angleXZ < -QUARTER_PI && angleXZ >= -3 * QUARTER_PI) {
        // on left
        pos.z -= dx;
        pos.y += dy;
      }

      updatePosition();
    }

    function turn(amount) {
      var angle = Math.atan2(direction.y, direction.x);
      var newAngle = angle + amount;
      direction.y = Math.sin(newAngle);
      direction.x = Math.cos(newAngle);

      elements.forEach(function(elm) {
        elm.style.transform = 'rotate(' + -newAngle + 'rad)';
      });
    }

    function updatePosition() {
      // z = -1 との交点
      if (pos.z < 0) {
        var x = -pos.x / pos.z;
        var y = -pos.y / pos.z;
        elements[0].style.left = (x + 1) * 50 + '%';
        elements[0].style.top = (y - 1) * -50 + '%';
        elements[0].style.display = 'block';
      } else {
        elements[0].style.display = 'none';
      }

      // x = 1 との交点
      if (pos.x > 0) {
        var y = pos.y / pos.x;
        var z = pos.z / pos.x;
        elements[1].style.left = (z + 1) * 50 + '%';
        elements[1].style.top = (y - 1) * -50 + '%';
        elements[1].style.display = 'block';
      } else {
        elements[1].style.display = 'none';
      }

      // z = 1 との交点
      if (pos.z > 0) {
        var x = pos.x / pos.z;
        var y = pos.y / pos.z;
        elements[2].style.left = (x - 1) * -50 + '%';
        elements[2].style.top = (y - 1) * -50 + '%';
        elements[2].style.display = 'block';
      } else {
        elements[2].style.display = 'none';
      }

      // x = -1 との交点
      if (pos.x < 0) {
        var y = -pos.y / pos.x;
        var z = -pos.z / pos.x;
        elements[3].style.left = (z - 1) * -50 + '%';
        elements[3].style.top = (y - 1) * -50 + '%';
        elements[3].style.display = 'block';
      } else {
        elements[3].style.display = 'none';
      }

      // y = 1 との交点
      if (pos.y > 0) {
        var x = pos.x / pos.y;
        var z = pos.z / pos.y;
        elements[4].style.left = (x + 1) * 50 + '%';
        elements[4].style.top = (z - 1) * -50 + '%';
        elements[4].style.display = 'block';
      } else {
        elements[4].style.display = 'none';
      }

      // y = -1 との交点
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