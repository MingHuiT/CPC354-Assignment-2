//----------------------------------------------------------------------------
//
//  Utility functions
//

function radians(degrees) {
    return degrees * Math.PI / 180.0;
  }
  
  function _argumentsToArray(args) {
    return [].concat.apply([], Array.prototype.slice.apply(args));
  }
  
  function flatten(v) {
    if (v.matrix === true) {
      v = transpose(v);
    }
  
    var n = v.length;
    var elemsAreArrays = false;
  
    if (Array.isArray(v[0])) {
      elemsAreArrays = true;
      n *= v[0].length;
    }
  
    var floats = new Float32Array(n);
  
    if (elemsAreArrays) {
      var idx = 0;
      for (var i = 0; i < v.length; ++i) {
        for (var j = 0; j < v[i].length; ++j) {
          floats[idx++] = v[i][j];
        }
      }
    } else {
      for (var i = 0; i < v.length; ++i) {
        floats[i] = v[i];
      }
    }
  
    return floats;
  }
  
  //----------------------------------------------------------------------------
  //
  //  Vector constructors
  //
  
  function vec3() {
    var result = _argumentsToArray(arguments);
  
    switch (result.length) {
      case 0:
        result.push(0.0);
      case 1:
        result.push(0.0);
      case 2:
        result.push(0.0);
    }
  
    return result.splice(0, 3);
  }
  
  function vec4() {
    var result = _argumentsToArray(arguments);
  
    switch (result.length) {
      case 0:
        result.push(0.0);
      case 1:
        result.push(0.0);
      case 2:
        result.push(0.0);
      case 3:
        result.push(1.0);
    }
  
    return result.splice(0, 4);
  }
  
  //----------------------------------------------------------------------------
  //
  //  Vector Functions
  //
  
  function length(u) {
    return Math.sqrt(dot(u, u));
  }
  
  function dot(u, v) {
    if (u.length != v.length) {
      throw "dot(): vectors are not the same dimension";
    }
  
    var sum = 0.0;
    for (var i = 0; i < u.length; ++i) {
      sum += u[i] * v[i];
    }
  
    return sum;
  }
  
  function cross(u, v) {
    if (!Array.isArray(u) || u.length < 3) {
      throw "cross(): first argument is not a vector of at least 3";
    }
  
    if (!Array.isArray(v) || v.length < 3) {
      throw "cross(): second argument is not a vector of at least 3";
    }
  
    var result = [
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0]
    ];
  
    return result;
  }
  
  function negate(u) {
    var result = [];
    for (var i = 0; i < u.length; ++i) {
      result.push(-u[i]);
    }
  
    return result;
  }
  
  function normalize(u, excludeLastComponent) {
    if (excludeLastComponent) {
      var last = u.pop();
    }
  
    var len = length(u);
  
    if (!isFinite(len)) {
      throw "normalize: vector " + u + " has zero length";
    }
  
    for (var i = 0; i < u.length; ++i) {
      u[i] /= len;
    }
  
    if (excludeLastComponent) {
      u.push(last);
    }
  
    return u;
  }
  
  //----------------------------------------------------------------------------
  //
  //  Matrix constructors
  //
  
  function mat4() {
    var v = _argumentsToArray(arguments);
  
    var m = [];
    switch (v.length) {
      case 0:
        v[0] = 1;
      case 1:
        m = [
          vec4(v[0], 0.0, 0.0, 0.0),
          vec4(0.0, v[0], 0.0, 0.0),
          vec4(0.0, 0.0, v[0], 0.0),
          vec4(0.0, 0.0, 0.0, v[0])
        ];
        break;
  
      default:
        m.push(vec4(v));
        v.splice(0, 4);
        m.push(vec4(v));
        v.splice(0, 4);
        m.push(vec4(v));
        v.splice(0, 4);
        m.push(vec4(v));
        break;
    }
  
    m.matrix = true;
  
    return m;
  }
  
  //----------------------------------------------------------------------------
  //
  //  Rotation matrix generators
  //
  
  function rotateX(theta) {
    var c = Math.cos(radians(theta));
    var s = Math.sin(radians(theta));
    var rx = mat4(
      1.0, 0.0, 0.0, 0.0,
      0.0, c, s, 0.0,
      0.0, -s, c, 0.0,
      0.0, 0.0, 0.0, 1.0
    );
    return rx;
  }
  
  function rotateY(theta) {
    var c = Math.cos(radians(theta));
    var s = Math.sin(radians(theta));
    var ry = mat4(
      c, 0.0, -s, 0.0,
      0.0, 1.0, 0.0, 0.0,
      s, 0.0, c, 0.0,
      0.0, 0.0, 0.0, 1.0
    );
    return ry;
  }
  
  //----------------------------------------------------------------------------
  //
  //  View matrix generators
  //
  
  function lookAt(eye, at, up) {
    if (!Array.isArray(eye) || eye.length != 3) {
      throw "lookAt(): first parameter [eye] must be an a vec3";
    }
  
    if (!Array.isArray(at) || at.length != 3) {
      throw "lookAt(): first parameter [at] must be an a vec3";
    }
  
    if (!Array.isArray(up) || up.length != 3) {
      throw "lookAt(): first parameter [up] must be an a vec3";
    }
  
    if (equal(eye, at)) {
      return mat4();
    }
  
    var v = normalize(subtract(at, eye)); // view direction vector
    var n = normalize(cross(v, up)); // perpendicular vector
    var u = normalize(cross(n, v)); // "new" up vector
  
    v = negate(v);
  
    var result = mat4(
      vec4(n, -dot(n, eye)),
      vec4(u, -dot(u, eye)),
      vec4(v, -dot(v, eye)),
      vec4()
    );
  
    return result;
  }
  
  //----------------------------------------------------------------------------
  //
  //  Projection Matrix Generators
  //
  
  function perspective(fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(radians(fovy) / 2);
    var d = far - near;
  
    var result = mat4();
    result[0][0] = f / aspect;
    result[1][1] = f;
    result[2][2] = -(near + far) / d;
    result[2][3] = -2 * near * far / d;
    result[3][2] = -1;
    result[3][3] = 0.0;
  
    return result;
  }
  
  
  
  //----------------------------------------------------------------------------
  //
  //  Matrix functions
  //
  
  function transpose(m) {
    if (!m.matrix) {
      return "transpose(): trying to transpose a non-matrix";
    }
  
    var result = [];
    for (var i = 0; i < m.length; ++i) {
      result.push([]);
      for (var j = 0; j < m[i].length; ++j) {
        result[i].push(m[j][i]);
      }
    }
  
    result.matrix = true;
  
    return result;
  }
  
  //----------------------------------------------------------------------------
  //
  //  Vector and matrix functions
  //
  
  
  function mult(u, v) {
    var result = [];
  
    if (u.matrix && v.matrix) {
      if (u.length != v.length) {
        throw "mult(): trying to add matrices of different dimensions";
      }
  
      for (var i = 0; i < u.length; ++i) {
        if (u[i].length != v[i].length) {
          throw "mult(): trying to add matrices of different dimensions";
        }
      }
  
      for (var i = 0; i < u.length; ++i) {
        result.push([]);
  
        for (var j = 0; j < v.length; ++j) {
          var sum = 0.0;
          for (var k = 0; k < u.length; ++k) {
            sum += u[i][k] * v[k][j];
          }
          result[i].push(sum);
        }
      }
  
      result.matrix = true;
  
      return result;
    }
  
    if (u.matrix && (u.length == v.length)) {
      for (var i = 0; i < v.length; i++) {
        var sum = 0.0;
        for (var j = 0; j < v.length; j++) {
          sum += u[i][j] * v[j];
        }
        result.push(sum);
      }
      return result;
    } else {
      if (u.length != v.length) {
        throw "mult(): vectors are not the same dimension";
      }
  
      for (var i = 0; i < u.length; ++i) {
        result.push(u[i] * v[i]);
      }
  
      return result;
    }
  }
  
  
  function subtract(u, v) {
    var result = [];
  
    if (u.matrix && v.matrix) {
      if (u.length != v.length) {
        throw "subtract(): trying to subtract matrices" +
          " of different dimensions";
      }
  
      for (var i = 0; i < u.length; ++i) {
        if (u[i].length != v[i].length) {
          throw "subtract(): trying to subtact matrices" +
            " of different dimensions";
        }
        result.push([]);
        for (var j = 0; j < u[i].length; ++j) {
          result[i].push(u[i][j] - v[i][j]);
        }
      }
  
      result.matrix = true;
  
      return result;
    } else if (u.matrix && !v.matrix || !u.matrix && v.matrix) {
      throw "subtact(): trying to subtact  matrix and non-matrix variables";
    } else {
      if (u.length != v.length) {
        throw "subtract(): vectors are not the same length";
      }
  
      for (var i = 0; i < u.length; ++i) {
        result.push(u[i] - v[i]);
      }
  
      return result;
    }
  }
  
  function equal(u, v) {
    if (u.length != v.length) {
      return false;
    }
  
    if (u.matrix && v.matrix) {
      for (var i = 0; i < u.length; ++i) {
        if (u[i].length != v[i].length) {
          return false;
        }
        for (var j = 0; j < u[i].length; ++j) {
          if (u[i][j] !== v[i][j]) {
            return false;
          }
        }
      }
    } else if (u.matrix && !v.matrix || !u.matrix && v.matrix) {
      return false;
    } else {
      for (var i = 0; i < u.length; ++i) {
        if (u[i] !== v[i]) {
          return false;
        }
      }
    }
  
    return true;
  }
  