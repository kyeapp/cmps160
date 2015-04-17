// Kevin Yeap
// kyeap@ucsc.edu
// 1270597
// A.Pang S15









//Mandelbrot set notes
/*
The Mandelbrot set studies whether points on the complex plane tend toward 
infinity or not under repeated quadratic operations.
so lets say there is a complex number c
c is associated with this function. f_c(z) = z^2 + c.
Mandelbrot set is the Behaviour of 0 under iteration of f_c. 
It is concerned with observing the size of the iterations.

two options for this.
(1) distance from 0 of the sequence gets arbitrarily large. (iterates go to infinity)
(2) distance is bounded. (iterates never get bigger than 2)

M the Mandelbrot set is the set of complex #'s c for which case 2 holds

Interesting part is the case on the edge of iterating to infinity, because you can't
predict what is going to happen when you change c even a tiny bit. This is how we get 
the pretty pictures.

PLOTTING ON THE COMPLEX PLANE

plot using numbers of the form a + bi
a and b are real numbers. i is a symbol that means that i^2 = -1;

*/

var x_dim = 3, y_dim = 3, left = -1, right = 1, topp = 1, bottom = -1;

var r_max = 100;
var max_color = 255;

dx = (right-left)/(x_dim-1);
dy = (topp-bottom)/(y_dim-1);

function  mandelbrot(c1, c2, rec_index) {
  var a = c1[0];
  var b = c1[1];
  var c = c1[0];
  var d = c1[1];

  //(a+bi)(c+di) = (ac-bd) + (ad+bc)i
  var aa = (a*c-b*d) + c2[0];
  var bb = (a*d+b*c) + c2[1];
 
  //console.log(aa + " -- " + bb + " -- " + cc);
 
  //the mod of fn_c is sqrt(a^2 + b^2), so the mod square is just a^2 + b^2
  //if . fn_c modsquare) > r_max return recursion level as height
  if (aa*aa + bb*bb > r_max) { return rec_index; }
  //if there has been more recursion than the max color set height to 0.
  else if (rec_index == max_color) { return 0; }
  //else recurse farther.
  else { return mandelbrot([aa, bb], c2, ++rec_index); }
}

function zz() {

/*
  var x = new Array(x_dim);
  for (var i = 0; i < x_dim; i++) {
    x[i] = new Array(y_dim);
  }
  */
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  
  for (var i = 0; i < x_dim; i++) {
    for (var j = 0; j < y_dim; j++) {
      var z = new Float32Array([left+i*dx, topp-j*dy, mandelbrot([0,0], [left+i*dx ,topp-j*dy], 0)] );
      console.log(z[0] + " -- " + z[1] + " -- " + z[2]);
      render_point(z);
    }
  }
  
  render_point(bp);
  
  var vtx = new Float32Array(
                [-1.0, -5.0, -5.0, 
                5.0, 5.0, 5.0]
            );
            var idx = new Uint16Array([0, 1]);
            initBuffers(vtx, idx);
            gl.lineWidth(1.0);
            gl.uniform4f(shaderProgram.colorUniform, 0, 0, 0, 1);
            gl.drawElements(gl.LINES, 2, gl.UNSIGNED_SHORT, 0);
  
}

var bp = new Float32Array(   //coordinates for base triangle
[-1, -1, 0.0]
);
  
function render_point(vertexes) {
  initBuffers(vertexes, idx);
  gl.uniform4f(shaderProgram.colorUniform, 1, 1, 1, 1);  //sets the color of the lines.
  gl.drawArrays(gl.POINTS, 0, 1); //render primitives from array data in a fashion of connected lines. The last vertex specified is connected to first vertex.
  //unbindBuffers(); //unbinding buffers does not change result because it is a static image.
};









var gl, vbuf, ibuf, last_pressed; //the opengl context
var sub_div_num = 0;
var idx = new Uint16Array([0, 0]); //array of 16-bit unsigned integers
var base = new Float32Array(   //coordinates for base triangle
[-1, -1, 0.0,              
 1, -1, 0.0,
 0, 1, 0.0]
);

function init() {
  gl.clearColor(0.0, .75, 1.0, 1); //preset value of background color to deep sky blue; RGBA
  gl.clear(gl.COLOR_BUFFER_BIT); //clearing the color buffer to the preset colors
}

//renders a single triangle with passed in vertexes.
function render_triangle(vertexes) {
  initBuffers(vertexes, idx);
  gl.uniform4f(shaderProgram.colorUniform, 1, 1, 1, 1);  //sets the color of the lines.
  gl.drawArrays(gl.LINE, 0, 2); //render primitives from array data in a fashion of connected lines. The last vertex specified is connected to first vertex.
  //unbindBuffers(); //unbinding buffers does not change result because it is a static image.
};

//recursively renders the amount of random triangles specified
function recursive_triangle_render(num) {
  if (num > 0) {
    recursive_triangle_render(num-1); //recursive calls to render more triangles
    render_triangle(rand_triangle()); //render a single triangle
  } 
}

//returns a triangle of random coordinates as a float32array
function rand_triangle() {
  var triangle = new Float32Array(   //32 bit floating point number array 
  [rand(), rand(), 0.0,              //containing the coordinates of the triangle
  rand(), rand(), 0.0,
  rand(), rand(), 0.0]
  );
  
  return triangle;
  
  //local random function
  function rand() {
    return ((2*(Math.random()-.5)));
  }
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
    document.getElementById( "Random" ).onclick = function () {
      gl.clear(gl.COLOR_BUFFER_BIT); //clearing the color buffer to the preset colors
      recursive_triangle_render(10); //recursively renders 10 triangles
      last_pressed = window.event.target.id; //set as last button pressed
    };
    
    document.getElementById( "Subdivide" ).onclick = function () {
      if (last_pressed != "Subdivide") { sub_div_num = 0; } //reset subdivision count
      
      sub_div_num++;
      gl.clear(gl.COLOR_BUFFER_BIT); //clearing the color buffer to the preset colors
      subdivide(base, sub_div_num);
      last_pressed = window.event.target.id; //set as last button pressed
    };
  }
}

function subdivide(sub_tri, num) {
  if (num == sub_div_num) { render_triangle(base); } //render base triangle

  if (num > 1) {
    var mpt = mid_point_triangle(sub_tri);
    render_triangle(mpt); //render triangle made of midpoints
    
    var tri1 = new Float32Array( //setting subdivision triangles
    [mpt[6], mpt[7], 0.0,              
    mpt[3] ,mpt[4], 0.0,
    sub_tri[6], sub_tri[7], 0.0]
    );
    
    var tri2 = new Float32Array(
    [sub_tri[0], sub_tri[1], 0.0,              
    mpt[0] ,mpt[1], 0.0,
    mpt[6], mpt[7], 0.0]
    );
    
    var tri3 = new Float32Array(
    [mpt[0], mpt[1], 0.0,              
    sub_tri[3] ,sub_tri[4], 0.0,
    mpt[3], mpt[4], 0.0]
    );
    
    subdivide(mpt, num-1);
    subdivide(tri1, num-1);
    subdivide(tri2, num-1);
    subdivide(tri3, num-1);
  }
}

//returns a float32array containing the coordinates of the three midpoints of the sides
function mid_point_triangle(vertexes) {
  var x1, x2, x3, y1, y2, y3;
  
  x1 = vertexes[0];
  x2 = vertexes[3];
  x3 = vertexes[6];
  
  y1 = vertexes[1];
  y2 = vertexes[4];
  y3 = vertexes[7];
  
  var mpt = new Float32Array( //calculating midpoint triangle
  [(x1+x2)/2, (y1+y2)/2, 0,   
   (x2+x3)/2, (y2+y3)/2, 0,
   (x1+x3)/2, (y1+y3)/2, 0]
  );
  
  return mpt;
}

function initBuffer(glELEMENT_ARRAY_BUFFER, data) {
  var buf = gl.createBuffer(); //creating buffer
  gl.bindBuffer(glELEMENT_ARRAY_BUFFER, buf); //binding object buffer (buf) to glELEMENT_ARRAY_BUFFER
  
  //creates a buffer in memory and initializes it with array data
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
void main(void) {\
gl_Position = vec4(a_position, 1.05);\
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
}