var gl, canvas;
var obj = "cube";
var object;
var theta, thetaLoc, colorLoc;

var points = [];
var normals = [];

const cube_obj = "cube"
const cylinder_obj = "cylinder"
const sphere_obj = "sphere"
const teapot_obj = "teapot"

const eye = vec3(1, 0, 2);                        //3.4a
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

const fov = 55;
const near = 0.3;
const far = 5;

var lightPosition = vec4(-1.0, 0.0, 0.0, 1.0);    //3.2b, 3.2c, 3.2d
// var lightPosition = vec4(0.0, 0.0, -1.0, 1.0);
var lightAmbient = vec4(0.1, 0.2, 0.2, 1.0);      //3.2a
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(0.0, 1.0, 0.0, 1.0);   //3.3a
var materialDiffuse = vec4(0.4, 0.8, 0.4, 1.0);   //3.3b coefficient is a float (0 to 1) multiply with diffuse, ambient, specular
var materialSpecular = vec4(0.0, 0.4, 0.4, 1.0);  
var materialShininess = 200.0;                    //3.3c

var Kd = 1.0;
var Ka = 1.0;
var Ks = 1.0;

window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn’t available");
    }
    buttonInteraction();
    WebGLSetup();

    render();
}

function WebGLSetup(){
    if (obj == cube_obj){
      object = cube(1.0);
    }
    else if (obj == cylinder_obj){
      object = cylinder(72, 3, true);
    }
    else if (obj == sphere_obj){
      object = sphere(5);
      object.scale(0.8, 0.8, 0.8);
    }
    else if (obj == teapot_obj){
      object = teapot(3);
      object.scale(0.25, 0.25, 0.25);

    }
    
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

    points = []
    normals = []
    // points = points.concat(cube.faces_as_triangles(normals));
    if (obj != teapot_obj){
      points = points.concat(object.TriangleVertices)
      normals = normals.concat(object.TriangleVertexColors)
    }
    else{
      points = object.TriangleVertices;
      normals = object.Normals;
    }

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
}

function buttonInteraction(){
  document.getElementById("object").onchange = function(){
    obj = this.value
    WebGLSetup()
  }

  document.getElementById("light_diffuse").onchange = function(){
    var tempcolor = this.value;
    var rgb = convertHexToRGB(tempcolor);
    lightDiffuse[0] = rgb.x
    lightDiffuse[1] = rgb.y
    lightDiffuse[2] = rgb.z
  }
  document.getElementById("light_ambient").onchange = function(){
    var tempcolor = this.value;
    var rgb = convertHexToRGB(tempcolor);
    lightAmbient[0] = rgb.x
    lightAmbient[1] = rgb.y
    lightAmbient[2] = rgb.z
  }
  document.getElementById("light_specular").onchange = function(){
    var tempcolor = this.value;
    var rgb = convertHexToRGB(tempcolor);
    lightSpecular[0] = rgb.x
    lightSpecular[1] = rgb.y
    lightSpecular[2] = rgb.z
  }

  document.getElementById("light_type").onclick = function(){
    type = lightPosition[3]
    if(type == 1.0){
      lightPosition[3] = 0.0
    }
    else if (type == 0.0){
      lightPosition[3] = 1.0
    }
  }

  document.getElementById("on_off").onclick = function(){

  }
  
  document.getElementById("light_X").onchange = function(){
    lightPosition[0] = this.value;
  }
  document.getElementById("light_Y").onchange = function(){
    lightPosition[1] = this.value;
  }
  document.getElementById("light_Z").onchange = function(){
    lightPosition[2] = this.value;
  }

  document.getElementById("material_diffuse").onchange = function(){
    var tempcolor = this.value;
    var rgb = convertHexToRGB(tempcolor);
    materialDiffuse[0] = rgb.x
    materialDiffuse[1] = rgb.y
    materialDiffuse[2] = rgb.z
  }
  document.getElementById("material_ambient").onchange = function(){
    var tempcolor = this.value;
    var rgb = convertHexToRGB(tempcolor);
    materialAmbient[0] = rgb.x
    materialAmbient[1] = rgb.y
    materialAmbient[2] = rgb.z
  }
  document.getElementById("material_specular").onchange = function(){
    var tempcolor = this.value;
    var rgb = convertHexToRGB(tempcolor);
    materialSpecular[0] = rgb.x
    materialSpecular[1] = rgb.y
    materialSpecular[2] = rgb.z
  }

  document.getElementById("coe_material_diffuse").onchange = function(){
    Kd = this.value;
  }
  document.getElementById("coe_material_ambient").onchange = function(){
    Ka = this.value;
  }
  document.getElementById("coe_material_specular").onchange = function(){
    Ks = this.value;
  }

  document.getElementById("material_shininess").onchange = function(){
    materialShininess = this.value;
  }

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
    gl.drawArrays( gl.TRIANGLES, 0, points.length );

    requestAnimFrame( render );
}
