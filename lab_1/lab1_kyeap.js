// Kevin Yeap
// kyeap@ucsc.edu
// 1270597
// A.Pang S15

var gl, pMatrix, mvMatrix, vbuf, ibuf; //the opengl context

var vtx = new Float32Array(   //32 bit floating point number array 
[-1, -.5, 0.0,              //containing the coordinates of the triangle
1, -.5, 0.0,
0.0, 1.232, 0.0]
);
var idx = new Uint16Array([0, 0]); //array of 16-bit unsigned integers

mvMatrix =
[1, 0, 0, 0,
0, 1, 0.00009999999747378752, 0,
0, -0.00009999999747378752, 1, 0,
0, 1.3552527156068805e-20, -8, 1];

pMatrix = 
[2.4142136573791504, 0, 0, 0,
0, 2.4142136573791504, 0, 0,
0, 0, -1.0020020008087158, -1,
0, 0, -0.20020020008087158, 0];

function init() {
  gl.clearColor(0.0, .75, 1.0, 1.0); //preset value of background color to deep sky blue; RGBA

  //gl.enable(gl.DEPTH_TEST);   //enable depth. not needed for this lab.
  //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.uniformMatrix4fv(shaderProgram.pMUniform, false, new Float32Array(pMatrix));  //Sets values for a 4x4 floating point vector matrix into a uniform location as a matrix or a matrix array.
  gl.uniformMatrix4fv(shaderProgram.mvMUniform, false, new Float32Array(mvMatrix)); //Sets values for a 4x4 floating point vector matrix into a uniform location as a matrix or a matrix array.
  
}

function display() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight); //setting viewport dimensions 
  gl.clear(gl.COLOR_BUFFER_BIT); //clearing the color buffer to the preset colors
  
  initBuffers(vtx, idx);
  gl.uniform4f(shaderProgram.colorUniform, Math.random(), Math.random()/2, Math.random(), 1);  //sets the color of the lines.
  gl.drawArrays(gl.LINE_LOOP, 0, 3); //render primitives from array data in a fashion of connected lines. The last vertex specified is connected to first vertex.
  //unbindBuffers(); //unbinding buffers does not change result because it is a static image.
}

function setup() {
  var canvas = document.getElementById("canvas");
  canvas.width = 640;
  canvas.height = 480;

  try { //setup gl context
    gl = canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width; //set viewport width to canvas width
    gl.viewportHeight = canvas.height; //set viewport height to canvas height 
    initShaders(); //initialize shaders
    init(); //initialize the canvas and the grid overlay for point plotting
  } catch (e) {}

  if (!gl) {
    alert("Unable to initialize WebGL."); //triggers alert if webgl is not supported
  } else {
    setInterval(display, 500); //calls the display function at millisecond intervals
  }
}

function initBuffer(glELEMENT_ARRAY_BUFFER, data) {
  var buf = gl.createBuffer(); //creating buffer
  gl.bindBuffer(glELEMENT_ARRAY_BUFFER, buf); //binding object buffer (buf) to glELEMENT_ARRAY_BUFFER
  
  //creates a buffer in memory and intializes it with array data
  //STATIC_DRAW is typically used when data is stored and modified once, and used many times.
  //since we are displaying a static geometric shape without modifying it, we use STATIC DRAW.
  gl.bufferData(glELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buf;
}

function initBuffers(vtx, idx) {
  //just specifying which buffer to pass in. real binding happens inside function.
  vbuf = initBuffer(gl.ARRAY_BUFFER, vtx); 
  ibuf = initBuffer(gl.ELEMENT_ARRAY_BUFFER, idx);
  gl.vertexAttribPointer(shaderProgram.aposAttrib, 3, gl.FLOAT, false, 0, 0); //defining an array of generic vertex attribute data. has data type float.
}

//since unbinding every frame in the buffer doesn't change the result i've commented it out.
/*
function unbindBuffers() {
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}
*/











//SHADER STUFF. Pang said there was no need to comment on shader code in class.      
var fragShaderSource = "\
precision highp float;\
uniform vec4 u_color;\
void main(void) {\
gl_FragColor = u_color;\
}\
";

var vtxShaderSource = "\
attribute vec3 a_position;\
uniform vec4 u_color;\
uniform mat4 u_mvMatrix;\
uniform mat4 u_pMatrix;\
void main(void) {\
gl_Position = u_pMatrix * u_mvMatrix * vec4(a_position, 1.0);\
}\
";

function get_shader(type, source) {
  var shader = gl.createShader(type); // Create the shader object
  gl.shaderSource(shader, source); // Set the shader source code.
  gl.compileShader(shader); // Compile the shader
  return shader;
}

function initShaders() {
  var vertexShader = get_shader(gl.VERTEX_SHADER, vtxShaderSource); 
  var fragmentShader = get_shader(gl.FRAGMENT_SHADER, fragShaderSource);
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);
  shaderProgram.aposAttrib = gl.getAttribLocation(shaderProgram, "a_position");
  gl.enableVertexAttribArray(shaderProgram.aposAttrib);
  shaderProgram.colorUniform = gl.getUniformLocation(shaderProgram, "u_color");
  shaderProgram.pMUniform = gl.getUniformLocation(shaderProgram, "u_pMatrix");
  shaderProgram.mvMUniform = gl.getUniformLocation(shaderProgram, "u_mvMatrix");
}