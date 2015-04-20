// Kevin Yeap
// kyeap@ucsc.edu
// 1270597
// A.Pang S15
// program generates mandelbrot set.

var gl, vbuf, ibuf; //the opengl context

var x_theta = Math.PI/4;
var x1 = Math.cos(x_theta);
var x2 = -Math.sin(x_theta);
var x3 = Math.sin(x_theta);
var x4 = Math.cos(x_theta);

var x_rotation_matrix = 
[1, 0, 0, 0,
0, x1, x2, 0,
0, x3, x4, 0,
0, 0, 0, 1];

var z_theta = 3*Math.PI/4;
var z1 = Math.cos(z_theta);
var z2 = -Math.sin(z_theta);
var z3 = Math.sin(z_theta);
var z4 = Math.cos(z_theta);

var z_rotation_matrix = 
[z1, z2, 0, 0,
z3, z4, 0, 0,
0, 0, 1, 0,
0, 0, 0, 1];

var s = 1/350;
var zoom_matrix =
[s, 0, 0, 0,
0, s, 0, 0, 
0, 0, s, 0,
0, 0, 0, 1]

function mandelbrot(xx, yy, l_bound, r_bound, b_bound, t_bound) {

  var x_dim = xx, y_dim = yy, left = l_bound, right = r_bound, topp = t_bound, bottom = b_bound;

  var r_max = 4; //out of bounds index
  var max_iter = 255; //max number of recursions

  var wc_xy_min = -255; //world coordinates xy minimum
  var wc_xy_max = 255; // world coordinates xy maximum

  var dx = (right-left)/(x_dim-1); //Mandelbrot dx
  var dy = (topp-bottom)/(y_dim-1); //Mandelbrot dy

  var wdx = (wc_xy_max*2)/(x_dim-1); //world dx
  var wdy = (wc_xy_max*2)/(y_dim-1); //world dy

  gl.clear(gl.COLOR_BUFFER_BIT);
  
  //creating 2d array to hold my points
  var image = new Array(x_dim);
  for (var i = 0; i < x_dim; i++) {
    image[i] = new Array(y_dim);
  }
  
  //generating height coordinates and resizing image to world coordinates
  for (var i = 0; i < x_dim; i++) {
    for (var j = 0; j < y_dim; j++) {
      image[i][j] = new Float32Array([wc_xy_min + i*wdx, 
      wc_xy_min + j*wdy, 
      mandelbrot_height([0,0], [left+i*dx ,topp-j*dy], 0) -(max_iter/2) ] ); 
    }
  }
  
  var ax = []; //ax is the array that will be built to contain the points to be drawn
  
  for (var i = 0; i < x_dim-1; i++) { //generating the Float32Array for line processing
    for (var j = 0; j < y_dim-1; j++) {
      ax.push(image[i][j][0]);
      ax.push(image[i][j][1]);
      ax.push(image[i][j][2]);
      
      ax.push(image[i+1][j][0]);
      ax.push(image[i+1][j][1]) 
      ax.push(image[i+1][j][2]);                                                    
    }
  }
  
  for (var i = 0; i < x_dim-1; i++) {
    for (var j = 0; j < y_dim-1; j++) {
      ax.push(image[i][j][0]);
      ax.push(image[i][j][1]);
      ax.push(image[i][j][2]);
      
      ax.push(image[i][j+1][0]);
      ax.push(image[i][j+1][1]) 
      ax.push(image[i][j+1][2]);          
    }
  }

  draw_lines(new Float32Array(ax)); //render the lines

  //mandelbrot height recursion function
  function  mandelbrot_height(c1, c2, rec_index) {
    var a = c1[0]; b = c1[1]; c = c1[0]; d = c1[1];

    //(a+bi)(c+di) = (ac-bd) + (ad+bc)i
    var aa = (a*c-b*d) + c2[0];
    var bb = (a*d+b*c) + c2[1];
    
    //the mod of fn_c is sqrt(a^2 + b^2), so the mod square is just a^2 + b^2
    //if . fn_c modsquare) > r_max return recursion level as height
    if (aa*aa + bb*bb > r_max) { return rec_index; }
    else if (rec_index == max_iter) { return 0; } //if there has been more recursion than the max color set height to max.
    else { return mandelbrot_height([aa, bb], c2, ++rec_index); } //else recurse farther.
  }
}

function draw_lines(vtx) {
  var idx = new Uint16Array([0, 1]);
  initBuffers(vtx, idx);
  gl.lineWidth(0.5);
  gl.uniform4f(shaderProgram.colorUniform, 0, .20, 1, .8);
  gl.drawArrays(gl.LINES, 0, vtx.length/3);
  //unbindBuffers();
}

function initBuffer(glELEMENT_ARRAY_BUFFER, data) {
  var buf = gl.createBuffer();
  gl.bindBuffer(glELEMENT_ARRAY_BUFFER, buf);
  gl.bufferData(glELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buf;
}

function initBuffers(vtx, idx) {
  vbuf = initBuffer(gl.ARRAY_BUFFER, vtx);
  ibuf = initBuffer(gl.ELEMENT_ARRAY_BUFFER, idx);
  gl.vertexAttribPointer(shaderProgram.aposAttrib, 3, gl.FLOAT, false, 0, 0);
}

function init() {
  gl.clearColor(0.0, 0.0, 0.0, 1); //preset value of background color to deep sky blue; RGBA
  gl.clear(gl.COLOR_BUFFER_BIT); //clearing the color buffer to the preset colors
  //gl.uniformMatrix4fv(shaderProgram.projectionM, false, new Float32Array(isometric)); //Sets values for a 4x4 floating point vector matrix into a uniform location as a matrix or a matrix array.
  gl.uniformMatrix4fv(shaderProgram.zoom, false, new Float32Array(zoom_matrix));
  gl.uniformMatrix4fv(shaderProgram.x_rotation, false, new Float32Array(x_rotation_matrix));
  gl.uniformMatrix4fv(shaderProgram.z_rotation, false, new Float32Array(z_rotation_matrix));
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
      x_box = document.getElementById('x_dimm').value;
      y_box = document.getElementById('y_dimm').value;
      l_box = document.getElementById('left_bound').value;
      r_box = document.getElementById('right_bound').value;
      b_box = document.getElementById('bottom_bound').value;
      t_box = document.getElementById('top_bound').value;
      
      
      if ( !(isNaN(x_box) | isNaN(y_box) | isNaN(l_box) 
           | isNaN(r_box) | isNaN(t_box) | isNaN(b_box)) ) {
        var x_res = document.getElementById('x_dimm').value;
        var y_res = document.getElementById('y_dimm').value;
        var left_bound = document.getElementById('left_bound').value;
        var right_bound = document.getElementById('right_bound').value;
        var bottom_bound = document.getElementById('bottom_bound').value;
        var top_bound = document.getElementById('top_bound').value;
        
        
        console.log(Number(x_res));
        
        mandelbrot(Number(x_res), Number(y_res), Number(left_bound), Number(right_bound), Number(top_bound), Number(bottom_bound));
      } else {
        if (isNaN(x_box)) { document.getElementById('x_dimm').value = "NaN"; }
        if (isNaN(y_box)) { document.getElementById('y_dimm').value = "NaN"; }
        if (isNaN(l_box)) { document.getElementById('left_bound').value = "NaN"; }
        if (isNaN(r_box)) { document.getElementById('right_bound').value = "NaN"; }
        if (isNaN(b_box)) { document.getElementById('bottom_bound').value = "NaN"; }
        if (isNaN(t_box)) { document.getElementById('top_bound').value = "NaN"; }
        alert("Not a Number!");
      }
    };
    
    document.getElementById( "Preset" ).onclick = function () {
      var a = 100, b = 100, c = -1.5, d = .5, e = -1, f = 1;
      mandelbrot(a, b, c, d, e, f);
      
      document.getElementById('x_dimm').value = a;
      document.getElementById('y_dimm').value = b;
      document.getElementById('left_bound').value = c;
      document.getElementById('right_bound').value = d;
      document.getElementById('bottom_bound').value = e;
      document.getElementById('top_bound').value = f;
    }
  }
}

//since unbinding every frame in the buffer doesn't change the result i've commented it out.
/*
function unbindBuffers() {
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}
*/





//Shader Code 
var fragShaderSource = "\
precision highp float;\
uniform vec4 u_color;\
void main(void) {\
gl_FragColor = u_color;\
}\
";

var vtxShaderSource = "\
attribute vec4 a_position;\
uniform vec4 u_color;\
uniform mat4 x_rotation;\
uniform mat4 z_rotation;\
uniform mat4 zoom;\
void main(void) {\
gl_Position = x_rotation * z_rotation * zoom * a_position;\
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
  shaderProgram.x_rotation = gl.getUniformLocation(shaderProgram, "x_rotation");
  shaderProgram.z_rotation = gl.getUniformLocation(shaderProgram, "z_rotation");
  shaderProgram.zoom = gl.getUniformLocation(shaderProgram, "zoom"); //set zoom matrix
}
