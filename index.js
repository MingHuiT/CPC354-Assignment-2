var gl, canvas;
var obj = "cube";
var object;

var points = [];
var normals = [];

// Set the shape of the displayed object
const cube_obj = "cube"
const cylinder_obj = "cylinder"
const sphere_obj = "sphere"

// Changing the location and orientation of camera via LookAt function
const eye = vec3(1.0, 0.0, 1.5);
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 0.0, 1.0);

// Use to set volume of the scene (projectionMatrix)
const volume = 1;
const fov = 55;
const near = -0.3;
const far = 5;

// Changing of position of the light
var lightPosition = vec4(1.0, 1.0, 1.0, 1.0);   // Change the 4th parameter for point/distance light
// Changing of color for selected light, 
var lightAmbient = vec4(0.5, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 0.5, 1.0, 1.0);
var lightSpecular = vec4(1.0, 0.5, 1.0, 1.0);

// Variables used to link to vertex shader
var lightPositionLoc;
var ambientProduct;
var diffuseProduct;
var specularProduct;
var ambientProduct;
var diffuseProduct;
var specularProduct;
var ambientProductLoc, diffuseProductLoc, specularProductLoc;
var shininessLoc;

var modelViewMatrix;
var projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

// Change the material property in terms of ambient, diffuse, specular
var materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var materialDiffuse = vec4(0.4, 0.3, 0.4, 1.0);
var materialSpecular = vec4(0.0, 0.4, 0.4, 1.0); 

// Change the shininess property of object's surface
var materialShininess = 100.0;

// Set the reflection coefficient for material ambient, diffuse, specular
var Kd = 1.0;
var Ka = 1.0;
var Ks = 1.0;
var KaLoc, KdLoc, KsLoc;

// Start the program
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

// Load vertex and fragment shader
function WebGLSetup(){
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Determine the shape to be displayed and create the object in the scene
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
    object.rotate(45, [1, 1, 1]);

    // Retrieve the points and normals of the objects from respective js by using the attribute provided
    points = []
    normals = []
    points = object.TriangleVertices;
    normals = object.TriangleNormals;

    // Create buffer for points and normals
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Link attributes for points
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Link uniform model view
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    // Calculate and link projectionMatrix
    projectionMatrix = ortho(-volume, volume, -volume, volume, near, far);
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    // Link attribute for light position
    lightPositionLoc = gl.getUniformLocation(program, "lightPosition");

    // Multiple light ambient and material ambient to get the product
    ambientProduct = mult(lightAmbient, materialAmbient);
    ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
    // Multiple light diffuse and material diffuse to get the product
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    // Multiple light specular and material specular to get the product
    specularProduct = mult(lightSpecular, materialSpecular);
    specularProductLoc = gl.getUniformLocation(program, "specularProduct");

    // Link to shininess of the material
    shininessLoc = gl.getUniformLocation(program, "shininess");

    // Link to coefficient of reflection
    KaLoc = gl.getUniformLocation(program, "Ka");
    KdLoc = gl.getUniformLocation(program, "Kd");
    KsLoc = gl.getUniformLocation(program, "Ks");
}

// Button interaction for frontend
function buttonInteraction(){
  // Get the required shape and setup the scene again
  document.getElementById("object").oninput = function(){
    obj = this.value
    WebGLSetup()
  }
  // Get the required light diffuse and update the value
  document.getElementById("light_diffuse").oninput = function(){
    var tempcolor = this.value;
    var rgb = convertHexToRGB(tempcolor);
    lightDiffuse[0] = rgb.x
    lightDiffuse[1] = rgb.y
    lightDiffuse[2] = rgb.z
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
  }
  // Get the required light ambient and update the value
  document.getElementById("light_ambient").oninput = function(){
    var tempcolor = this.value;
    var rgb = convertHexToRGB(tempcolor);
    lightAmbient[0] = rgb.x
    lightAmbient[1] = rgb.y
    lightAmbient[2] = rgb.z
    ambientProduct = mult(lightAmbient, materialAmbient);
  }
  // Get the required light specular and update the value
  document.getElementById("light_specular").oninput = function(){
    var tempcolor = this.value;
    var rgb = convertHexToRGB(tempcolor);
    lightSpecular[0] = rgb.x
    lightSpecular[1] = rgb.y
    lightSpecular[2] = rgb.z
    specularProduct = mult(lightSpecular, materialSpecular);
  }

  // Get the required light type by toggling the value from 0 to 1 or vice versa
  document.getElementById("light_type").onclick = function(){
    type = lightPosition[3]
    if(type == 1.0){
      lightPosition[3] = 0.0
      document.getElementById("light_type").innerHTML = "Distance Light"
      console.log(lightPosition[3])
    }
    else if (type == 0.0){
      lightPosition[3] = 1.0
      document.getElementById("light_type").innerHTML = "Point Light"
      console.log(lightPosition[3])
    }
  }

  // Turn on or off the light
  document.getElementById("on_off").onclick = function(){
    on = lightPosition[0]
    if(on >= 1.0){
      lightPosition[0] = -1.0;
      lightPosition[1] = -1.0;
      lightPosition[2] = -1.0;
      document.getElementById('light_X').disabled = true;
      document.getElementById('light_Y').disabled = true;
      document.getElementById('light_Z').disabled = true;
      document.getElementById("on_off").innerHTML = "On"
    }
    else if(on <= 0.0){
      lightPosition[0] = document.getElementById('light_X').value;
      lightPosition[1] = document.getElementById('light_Y').value;
      lightPosition[2] = document.getElementById('light_Z').value;
      document.getElementById('light_X').disabled = false;
      document.getElementById('light_Y').disabled = false;
      document.getElementById('light_Z').disabled = false;
      document.getElementById("on_off").innerHTML = "Off"
    }
  }

  // Adjust position and orientation of camera
  document.getElementById("cam_angle_eye").oninput = function(){
    eye[0] = this.value;
  }
  document.getElementById("cam_angle_at").oninput = function(){
    at[1] = this.value;
    at[2] = this.value;
  }
  document.getElementById("cam_angle_up").oninput = function(){
    up[1] = this.value;
  }
  
  // Adjust the position of light source
  document.getElementById("light_X").oninput = function(){
    lightPosition[0] = this.value;
  }
  document.getElementById("light_Y").oninput = function(){
    lightPosition[1] = this.value;
  }
  document.getElementById("light_Z").oninput = function(){
    lightPosition[2] = this.value;
  }

  // Change the diffuse of material 
  document.getElementById("material_diffuse").oninput = function(){
    var tempcolor = this.value;
    var rgb = convertHexToRGB(tempcolor);
    materialDiffuse[0] = rgb.x
    materialDiffuse[1] = rgb.y
    materialDiffuse[2] = rgb.z
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
  }
  // Change the ambient of material 
  document.getElementById("material_ambient").oninput = function(){
    var tempcolor = this.value;
    var rgb = convertHexToRGB(tempcolor);
    materialAmbient[0] = rgb.x
    materialAmbient[1] = rgb.y
    materialAmbient[2] = rgb.z
    ambientProduct = mult(lightAmbient, materialAmbient);
  }
  // Change the specular of material 
  document.getElementById("material_specular").oninput = function(){
    var tempcolor = this.value;
    var rgb = convertHexToRGB(tempcolor);
    materialSpecular[0] = rgb.x
    materialSpecular[1] = rgb.y
    materialSpecular[2] = rgb.z
    specularProduct = mult(lightSpecular, materialSpecular);
  }

  // Update the diffuse coefficient of reflection
  document.getElementById("coe_material_diffuse").oninput = function(){
    Kd = this.value;
  }
  // Update the ambient coefficient of reflection
  document.getElementById("coe_material_ambient").oninput = function(){
    Ka = this.value;
  }
  // Update the specular coefficient of reflection
  document.getElementById("coe_material_specular").oninput = function(){
    Ks = this.value;
  }

  // Update the shininess of the object
  document.getElementById("material_shininess").oninput = function(){
    materialShininess = this.value;
  }

}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );

    // Pass the value to vertex shader
    gl.uniform4fv(lightPositionLoc, flatten(lightPosition));
    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));
    gl.uniform1f(shininessLoc, materialShininess);

    // Get the latest lookAt angle and pass to vertex shader
    modelViewMatrix = lookAt(eye, at, up);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // Pass the coefficient value to the vertex shader
    gl.uniform1f(KaLoc, Ka);
    gl.uniform1f(KdLoc, Kd);
    gl.uniform1f(KsLoc, Ks);

    // Draw the shape accordingly
    gl.drawArrays( gl.TRIANGLES, 0, points.length );

    // Re-render the scene
    requestAnimFrame( render );
}
