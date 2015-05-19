// Kevin Yeap
// kyeap@ucsc.edu
// 1270597
// A.Pang S15

var gl, vbuf; //the opengl context

var point_array = [];
var normal_array = [];

function init() {
  gl.clearColor(0.0, .75, 1.0, 1); //preset value of background color to deep sky blue; RGBA
  gl.clear(gl.COLOR_BUFFER_BIT); //clearing the color buffer to the preset colors
  //gl.enable(gl.DEPTH_TEST);
}

function setup() {
  var canvas = document.getElementById("canvas");
  canvas.width = 500;
  canvas.height = 500;

  try { //setup gl context
    gl = canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width; //set viewport width to canvas width
    gl.viewportHeight = canvas.height; //set viewport height to canvas height 
    initShaders(); //initialize shaders
    init(); //initialize the canvas and the grid overlay for point plotting
  } catch (e) {}
  
  if (!gl) { alert("Unable to initialize WebGL."); } 
  else {
  
    setInterval(render, 500);
    document.getElementById( "Random" ).onclick = function () {

    };
    
    document.getElementById( "Subdivide" ).onclick = function () {

    };
    
    
  }
  
  
  
}

var center = {
  x: 0,
  y: 0
};

function circleXY(radius, dots) {
    stepSize = ((2*Math.PI)/dots);
    for (d = 0; d <= (2*Math.PI)-stepSize; d += stepSize) {
      var a = vec3( (Math.sin(d) * radius) + center.x,
            (Math.cos(d) * radius) + center.x,
             0);
      point_array.push(a);
      
      
      console.log((Math.sin(d) * radius) + center.x);
      console.log((Math.cos(d) * radius) + center.x);
    }

}

function clear_array() {
  point_array = [];
}

function test() {

console.log(scale(2, 2, 2));
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  
  //shaderProgram.scale = gl.getUniformLocation(shaderProgram, "scale");
  //gl.uniformMatrix4fv(shaderProgram.scale, false, new Float32Array(scale_matrix));
  
  console.log(point_array);
  init_v_buffer(point_array);
  //init_n_buffer(normal_array);
  gl.uniform4f(shaderProgram.colorUniform, 1, 1, 1, 1); //sets the color of the lines.
  gl.drawArrays(gl.LINE_LOOP, 0, point_array.length);
}


function init_v_buffer(data) {
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STATIC_DRAW);
  gl.vertexAttribPointer(shaderProgram.vPosition, 3, gl.FLOAT, false, 0, 0);
}

function init_n_buffer(data) {
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STATIC_DRAW);
  gl.vertexAttribPointer(shaderProgram.vNormal, 4, gl.FLOAT, false, 0, 0);
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
uniform vec4 f_color;\
void main(void) {\
gl_FragColor = f_color;\
}\
";

var vtxShaderSource = "\
attribute vec3 v_position;\
uniform vec4 u_color;\
uniform mat4 scale;\
void main(void) {\
gl_Position = vec4(v_position, 1.05);\
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
  shaderProgram.aposAttrib = gl.getAttribLocation(shaderProgram, "v_position");
  gl.enableVertexAttribArray(shaderProgram.aposAttrib);
  shaderProgram.colorUniform = gl.getUniformLocation(shaderProgram, "f_color");
}