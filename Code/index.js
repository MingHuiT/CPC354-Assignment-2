var gl;
var cube, theta, thetaLoc, colorLoc;
var c 

const eye = vec3(1, 0, 2);                        //3.4a
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

const fov = 55;
const near = 0.3;
const far = 5;

// var lightPosition = vec4(-1.5, 1.0, 4.0, 1.0);    //3.2b, 3.2c, 3.2d
var lightPosition = vec4(0.0, 0.0, -1.0, 1.0);
var lightAmbient = vec4(0.1, 0.2, 0.2, 1.0);      //3.2a
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(0.0, 1.0, 0.0, 1.0);   //3.3a
var materialDiffuse = vec4(0.4, 0.8, 0.4, 1.0);   //3.3b coefficient is a float (0 to 1) multiply with diffuse, ambient, specular
var materialSpecular = vec4(0.0, 0.4, 0.4, 1.0);  
var materialShininess = 200.0;                    //3.3c

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn’t available");
    }

    c = cube(1.0)
    // cube = createCube(1.0);                       //3.1 create different object
    // cyl = cylinder(36, 3, true);
    theta = [0.0, 0.0, 0.0];

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var modelViewMatrix = lookAt(eye, at, up);
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    var aspectRatio = gl.canvas.width / gl.canvas.height;
    var projectionMatrix = perspective(fov, aspectRatio, near, far);
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    thetaLoc = gl.getUniformLocation(program, "theta");

    var points = [];
    var normals = [];
    // points = points.concat(cube.faces_as_triangles(normals));
    points = points.concat(c.TriangleVertices)
    normals = normals.concat(c.TriangleFaceColors  )

    var lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
    gl.uniform4fv(lightPositionLoc, flatten(lightPosition));

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));

    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));

    var specularProduct = mult(lightSpecular, materialSpecular);
    var specularProductLoc =
      gl.getUniformLocation(program, "specularProduct");
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));

    var shininessLoc = gl.getUniformLocation(program, "shininess");
    gl.uniform1f(shininessLoc, materialShininess);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    render();
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );

    theta[0] += 0.5;
    theta[1] += 1.0;

    if (theta[1] > 360.0) {
      theta[1] -= 360.0;
    }
    if (theta[0] > 360.0) {
      theta[0] -= 360.0;
    }

    gl.uniform3fv(thetaLoc, flatten(theta));

    gl.drawArrays( gl.TRIANGLES, 0, 36 );
    // gl.drawArrays( gl.TRIANGLES, 0, cube.count_vertices_faces );
    // gl.drawArrays( gl.TRIANGLES, 0, 1728 );

    requestAnimFrame( render );
}
