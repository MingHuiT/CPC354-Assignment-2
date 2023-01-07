//Program  setup
var canvas;
var gl;

var numVertices = 36
// Store points and colors : Cube
var pointsC = [];
var colorsC = [];

// // Store points and colors : Tetrahedron
// var pointsT = [];
// var colorsT = [];

// // Store points and colors : Octahedron
// var pointsO = [];
// var colorsO = [];

// Declare axes for rotation
// Axes: 0 = x; 1 = y; 3 = z
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
// Array of angles: 0 = x; 1 = y; 3 = z
var theta = [ 0, 0, 0 ];

var thetaLoc;

window.onload = function init()
{
  canvas = document.getElementById( "gl-canvas" );
  
  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" ); }
  
  // ---------- Cube ---------- //
  colorCube();
  // // ---------- Tetrahedron ---------- //
  // colorTetra();
  // // ---------- Octahedron ---------- //
  // colorOcta();

  // viewport = rectangular area of display window
  gl.viewport( 0, 0, canvas.width, canvas.height );

  // Clear area of display for rendering at each frame
  // It specifies the color values used when clearing color buffers
  // clearColor(red, green, blue, alpha)
  gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
  
  gl.enable(gl.DEPTH_TEST);

  // Load shaders and initialize attribute buffers
  // ---------------- Cube ---------------- //
  var programCube = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( programCube );
  
  // Buffer
  // Buffers are arrays of binary data you upload to the GPU
  var c_cBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, c_cBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsC), gl.STATIC_DRAW );

  // Color
  // Set attributes
  var c_vColor = gl.getAttribLocation( programCube, "vColor" );
  gl.vertexAttribPointer( c_vColor, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( c_vColor );

  // Create points buffer
  var c_vBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, c_vBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsC), gl.STATIC_DRAW );

  // Create position
  var c_vPosition = gl.getAttribLocation( programCube, "vPosition" );
  gl.vertexAttribPointer( c_vPosition, 3, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( c_vPosition );

  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // calling Cube 
  thetaLoc = gl.getUniformLocation(programCube, "theta"); 
  
  // Event listeners for buttons
  document.getElementById( "xButton" ).onclick = function () {
    axis = xAxis;
  };
  document.getElementById( "yButton" ).onclick = function () {
      axis = yAxis;
  };
  document.getElementById( "zButton" ).onclick = function () {
      axis = zAxis;
  };
      
  render();

  // Load shaders and initialize attribute buffers
  // ---------------- Tetrahedron ---------------- //

  // var programTetra = initShaders( gl, "vertex-shader", "fragment-shader" );
  // gl.useProgram( programTetra );
  
  // var t_cBuffer = gl.createBuffer();
  // gl.bindBuffer( gl.ARRAY_BUFFER, t_cBuffer );
  // gl.bufferData( gl.ARRAY_BUFFER, transpose(colorsT), gl.STATIC_DRAW );
  
  // var t_vColor = gl.getAttribLocation( programTetra, "vColor" );
  // gl.vertexAttribPointer( t_vColor, 3, gl.FLOAT, false, 0, 0 );
  // gl.enableVertexAttribArray( t_vColor );

  // var t_vBuffer = gl.createBuffer();
  // gl.bindBuffer( gl.ARRAY_BUFFER, t_vBuffer);
  // gl.bufferData( gl.ARRAY_BUFFER, transpose(pointsT), gl.STATIC_DRAW );

  // var t_vPosition = gl.getAttribLocation( programTetra, "vPosition" );
  // gl.vertexAttribPointer( t_vPosition, 3, gl.FLOAT, false, 0, 0 );
  // gl.enableVertexAttribArray( t_vPosition );
	
  // Calling tetra
	//thetaLoc = gl.getUniformLocation(programTetra, "theta");

  // Load shaders and initialize attribute buffers
  // ---------------- Octahedron ---------------- //
  // var programOcta = initShaders( gl, "vertex-shader", "fragment-shader" );
  // gl.useProgram( programOcta );

  // var o_cBuffer = gl.createBuffer();
  // gl.bindBuffer( gl.ARRAY_BUFFER, o_cBuffer );
  // gl.bufferData( gl.ARRAY_BUFFER, transpose(colorsO), gl.STATIC_DRAW );
  
  // var o_vColor = gl.getAttribLocation( programOcta, "vColor" );
  // gl.vertexAttribPointer( o_vColor, 3, gl.FLOAT, false, 0, 0 );
  // gl.enableVertexAttribArray( o_vColor );

  // var o_vBuffer = gl.createBuffer();
  // gl.bindBuffer( gl.ARRAY_BUFFER, o_vBuffer );
  // gl.bufferData( gl.ARRAY_BUFFER, transpose(pointsO), gl.STATIC_DRAW );

  // var o_vPosition = gl.getAttribLocation( programOcta, "vPosition" );
  // gl.vertexAttribPointer( o_vPosition, 3, gl.FLOAT, false, 0, 0 );
  // gl.enableVertexAttribArray( o_vPosition );
	
  // // Calling octa
	// //thetaLoc = gl.getUniformLocation(programOcta, "theta"); 
}

// Cube functions
function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) 
{
    var verticesC = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 1.0, 1.0, 1.0, 1.0 ],  // white
        [ 0.0, 1.0, 1.0, 1.0 ]   // cyan
    ];

    // We need to parition the quad into two triangles in order for WebGL to be able to render it
    // In this case, we create two triangles from the quad indices
    // Vertex color assigned by the index of the vertex
    
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        pointsC.push( verticesC[indices[i]] );
        //colorsC.push( vertexColors[indices[i]] );
    
        // for solid colored faces use 
        colorsC.push(vertexColors[a]);
    }
}

// Tetrahedron functions
function colorTetra(){
	
	var verticesT = [
        vec3(  0.0000,  0.0000, -0.3500 ),
        vec3(  0.0000,  0.3500,  0.1500 ),
        vec3( -0.3500, -0.1500,  0.1500 ),
        vec3(  0.3500, -0.1500,  0.1500 )
    ];
    
	tetra(verticesT[0], verticesT[1], verticesT[2], verticesT[3]);
}

function makeTetra( a, b, c, color )
{
    // Add colors and vertices for one triangle
    var baseColors = [
        vec3(0.7, 0.7, 0.9, 1.0),
        vec3(0.6, 0.8, 0.9, 1.0),
        vec3(0.5, 0.6, 0.9, 1.0),
        vec3(1.0, 1.0, 0.2, 1.0)
    ];

    colorsT.push( baseColors[color] );
    pointsT.push( a );
    colorsT.push( baseColors[color] );
    pointsT.push( b );
    colorsT.push( baseColors[color] );
    pointsT.push( c );
}

function tetra( p, q, r, s )
{
  // Tetrahedron with each side using a different color
  makeTetra( p, r, q, 0 );
  makeTetra( p, r, s, 1 );
  makeTetra( p, q, s, 2 );
  makeTetra( q, r, s, 3 );
}

// Octahedron functions
function colorOcta(){
	
  var verticesO = [
  vec3(  0.4000, 0.0000, 0.0000 ),		
  vec3(  0.0000, 0.0000, 0.0000 ),
  vec3(  0.0000, 0.4000, 0.0000 ),
  vec3(  0.4000, 0.4000, 0.0000 ),
  vec3(  0.2000, 0.2000, 0.3000 ),
  vec3(  0.2000, 0.2000, -0.3000 )
  ];
  
  octo(verticesO[0], verticesO[1], verticesO[2], verticesO[3], verticesO[4], verticesO[5]);	
}

function makeOcta( a, b, c, color )
{
  // Add colors and vertices for one triangle
  var baseColors = [
  vec3(0.6, 0.6, 0.6, 1.0),
  vec3(0.3, 0.4, 0.9, 1.0),
  vec3(0.9, 0.9, 0.9, 1.0),
  ];

  colorsO.push( baseColors[color] );
  pointsO.push( a );
  colorsO.push( baseColors[color] );
  pointsO.push( b );
  colorsO.push( baseColors[color] );
  pointsO.push( c );
}

function octo( a, b, c, d , e, f)
{
  // Octahedron with each side using a different color
  makeOcta( a, d, e, 0 );
  makeOcta( a, b, e, 1 );
  makeOcta( b, c, e, 0 );
  makeOcta( c, d, e, 1 );
  makeOcta( a, d, f, 1 );
  makeOcta( a, b, f, 2 );
  makeOcta( b, c, f, 1 );
  makeOcta( c, d, f, 2 );
}

function render()
{
  theta[axis] += 2.0;
  gl.uniform3fv(thetaLoc, theta);

  // Render 
  gl.drawArrays( gl.TRIANGLES, 0, numVertices );
  //gl.drawArrays( gl.TRIANGLES, 0, pointsT.length );
  //gl.drawArrays( gl.TRIANGLES, 0, pointsO.length );

  requestAnimFrame( render );
}