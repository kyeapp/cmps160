// Kevin Yeap
// kyeap@ucsc.edu
// 1270597
// A.Pang S15

var gl, vbuf;

var point_array = [];
var normal_array = [];

var x_theta = 0;
var x1 = Math.cos(x_theta);
var x2 = -Math.sin(x_theta);
var x3 = Math.sin(x_theta);
var x4 = Math.cos(x_theta);

var x_rotation_matrix = 
[1, 0, 0, 0,
0, x1, x2, 0,
0, x3, x4, 0,
0, 0, 0, 1];

var y_theta = 0;
var y1 = Math.cos(y_theta);
var y2 = Math.sin(y_theta);
var y3 = -Math.sin(y_theta);
var y4 = Math.cos(y_theta);

var y_rotation_matrix = 
[y1, 0, y2, 0,
0, 1, 0, 0,
y3, 0, y4, 0,
0, 0, 0, 1];

var z_theta = 0;
var z1 = Math.cos(z_theta);
var z2 = -Math.sin(z_theta);
var z3 = Math.sin(z_theta);
var z4 = Math.cos(z_theta);

var z_rotation_matrix = 
[z1, z2, 0, 0,
z3, z4, 0, 0,
0, 0, 1, 0,
0, 0, 0, 1];

var s = 1/100;
var zoom_matrix =
[s, 0, 0, 0,
0, s, 0, 0, 
0, 0, s, 0,
0, 0, 0, 1];

var lightPosition;
var lightAmbient;
var lightDiffuse;
var lightSpecular;

var materialAmbient;
var materialDiffuse;
var materialSpecular;
var materialShininess = 20.0;

function init() {
  gl.clearColor(0.0, .75, 1.0, 1); //preset value of background color to deep sky blue; RGBA
  gl.clear(gl.COLOR_BUFFER_BIT); //clearing the color buffer to the preset colors
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
  
  if (!gl) { alert("Unable to initialize WebGL."); } 
  else {
    document.getElementById( "Generate" ).onclick = function () {
      gl.clear(gl.COLOR_BUFFER_BIT); //clearing the color buffer to the preset colors
      point_array = [];
      nomral_array = [];
      generate_shark();
    };
  }
}

//process each shark polygon part
function generate_shark() {
  for (var i = 0; i < SHARK_POLY.length; i++) {
    ps_polygon(SHARK_POLY[i]);
  }
  
  render(point_array);
}

//Process_shark_polygon, takes input of single array of shark polygon index
function ps_polygon(poly) {
  var a, b, c;
  a = poly[1]-1;
  for (var i = 1; i < poly.length; i++) {
    
    b = poly[i+1]-1;
    c = poly[i+2]-1;
    point_array.push(vec4(SHARK_COORD[a])); 
    point_array.push(vec4(SHARK_COORD[b]));
    point_array.push(vec4(SHARK_COORD[c]));
  }
}

function render(vert) {
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  init_v_buffer(vert);
  //init_n_buffer(norm);
 // gl.lineWidth(0.5);
  //gl.uniform4f(shaderProgram.colorUniform, 0, .20, 1, .8);
  gl.uniform4f(shaderProgram.colorUniform, 1, 1, 1, 1);  //sets the color of the lines.
  gl.drawArrays(gl.TRIANGLES, 0, vert.length);
  //unbindBuffers();
}


function init_v_buffer(data) {
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STATIC_DRAW);
  gl.vertexAttribPointer(shaderProgram.vPosition, 4, gl.FLOAT, false, 0, 0);
}

function init_n_buffer(data) {
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.vertexAttribPointer(shaderProgram.vNormal, 4, gl.FLOAT, false, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STATIC_DRAW);
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
uniform vec4 fColor;\
void main(void) {\
gl_FragColor = fColor;\
}\
";

var vtxShaderSource = "\
attribute vec3 vPosition;\
uniform vec4 fColor;\
uniform mat4 x_rotation;\
uniform mat4 y_rotation;\
uniform mat4 z_rotation;\
uniform mat4 zoom;\
void main(void) {\
gl_Position = x_rotation * y_rotation * z_rotation * zoom * vec4(vPosition, 1.05);\
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
  shaderProgram.vPosition = gl.getAttribLocation(shaderProgram, "vPosition");
  gl.enableVertexAttribArray(shaderProgram.vPosition);
  shaderProgram.colorUniform = gl.getUniformLocation(shaderProgram, "fColor");
  shaderProgram.x_rotation = gl.getUniformLocation(shaderProgram, "x_rotation");
  shaderProgram.y_rotation = gl.getUniformLocation(shaderProgram, "y_rotation");
  shaderProgram.z_rotation = gl.getUniformLocation(shaderProgram, "z_rotation");
  shaderProgram.zoom = gl.getUniformLocation(shaderProgram, "zoom"); //set zoom matrix
  
  gl.uniformMatrix4fv(shaderProgram.x_rotation, false, new Float32Array(x_rotation_matrix));
  gl.uniformMatrix4fv(shaderProgram.y_rotation, false, new Float32Array(y_rotation_matrix));
  gl.uniformMatrix4fv(shaderProgram.z_rotation, false, new Float32Array(z_rotation_matrix));
  gl.uniformMatrix4fv(shaderProgram.zoom, false, new Float32Array(zoom_matrix));
}