// Kevin Yeap
// kyeap@ucsc.edu
// 1270597
// A.Pang S15
// program generates mandelbrot set with shading.

var gl, vbuf, ibuf; //the opengl context

var pointsArray = [];
var normalsArray = [];

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

var s = 1/375;
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

function mandelbrot(xx, yy, l_bound, r_bound, b_bound, t_bound) {
  pointsArray = [];
  normalsArray = []; 

  var x_dim = xx, y_dim = yy, left = l_bound, right = r_bound, topp = t_bound, bottom = b_bound;

  var r_max = 4; //out of bounds index
  var max_iter = 255; //max number of recursions

  var wc_xy_min = -255; //world coordinates xy minimum
  var wc_xy_max = 255; // world coordinates xy maximum

  var dx = (right-left)/(x_dim-1); //Mandelbrot dx
  var dy = (topp-bottom)/(y_dim-1); //Mandelbrot dy

  var wdx = (wc_xy_max*2)/(x_dim-1); //world dx
  var wdy = (wc_xy_max*2)/(y_dim-1); //world dy
  
  //creating 2d array to hold my points
  var image = new Array(x_dim);
  for (var i = 0; i < x_dim; i++) {
    image[i] = new Array(y_dim);
  }
  
  //generating height coordinates and resizing image to world coordinates
  for (var i = 0; i < x_dim; i++) {
    for (var j = 0; j < y_dim; j++) {
      image[i][j] = vec4 (
      wc_xy_min + i*wdx, 
      wc_xy_min + j*wdy, 
      mandelbrot_height([0,0], [left+i*dx ,topp-j*dy], 0) - (max_iter/2) ); 
    }
  }
  
  for (var i = 0; i < x_dim-1; i++) {
    for (var j = 0; j < y_dim-1; j++) {
      var a = image[i][j];
      var b = image[i][j+1];
      var c = image[i+1][j];
      var d = image[i+1][j+1];
      quad_to_tri(a, b, c, d);
    }
  }

  render(pointsArray, normalsArray); //render Mandelbrot

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

//arrange points of a quad into an array as two triangles
function quad_to_tri(a, b, c, d) {
  
  pointsArray.push(a);
  pointsArray.push(b);
  pointsArray.push(c);
  
  pointsArray.push(b);
  pointsArray.push(c);
  pointsArray.push(d);
  
  var t1 = subtract(b, a);
  var t2 = subtract(c, a);
  var normal = normalize(cross(t2, t1));
  normal = vec4(normal);

  normalsArray.push(normal);
  normalsArray.push(normal);
  normalsArray.push(normal);
  
  var t3 = subtract(d, b);
  var t4 = subtract(c, b);
  var normal2 = normalize(cross(t4, t3));
  normal2 = vec4(normal2);

  normalsArray.push(normal2);
  normalsArray.push(normal2);
  normalsArray.push(normal2);

}

function render(vert, norm) {
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  init_p_buffer(vert);
  init_n_buffer(norm);
 // gl.lineWidth(0.5);
  //gl.uniform4f(shaderProgram.colorUniform, 0, .20, 1, .8);
  gl.drawArrays(gl.TRIANGLES, 0, vert.length);
  //unbindBuffers();
}

function init_p_buffer(data) {
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

function init() {
  gl.clearColor(0.0, 0.0, 0.0, 1.0); //preset value of background color to deep sky blue; RGBA
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
  var lightAmbient = vec4(0.0, 0.0, 0.0, 1.0 );
  var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
  var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

  var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
  var materialDiffuse = vec4( 0.0, 0.5, 1.0, 1.0 );
  var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
  var materialShininess = 25.0;
  
  ambientProduct = mult(lightAmbient, materialAmbient);
  diffuseProduct = mult(lightDiffuse, materialDiffuse);
  specularProduct = mult(lightSpecular, materialSpecular);
  
  gl.uniform4fv( gl.getUniformLocation(shaderProgram, "ambientProduct"),flatten(ambientProduct) );
  gl.uniform4fv( gl.getUniformLocation(shaderProgram, "diffuseProduct"),flatten(diffuseProduct) );
  gl.uniform4fv( gl.getUniformLocation(shaderProgram, "specularProduct"),flatten(specularProduct) );	
  gl.uniform4fv( gl.getUniformLocation(shaderProgram, "lightPosition"),flatten(lightPosition) );
  gl.uniform1f( gl.getUniformLocation(shaderProgram, "shininess"),materialShininess );

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
      var a = 150, b = 150, c = -1.5, d = .5, e = -1, f = 1;
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
varying vec4 fColor;\
void main(void) {\
gl_FragColor = fColor;\
}\
";

var vtxShaderSource = "\
attribute vec4 vPosition;\
attribute vec4 vNormal;\
varying vec4 fColor;\
\
uniform vec4 ambientProduct, diffuseProduct, specularProduct;\
uniform vec4 lightPosition;\
uniform float shininess;\
\
uniform mat4 x_rotation;\
uniform mat4 z_rotation;\
uniform mat4 zoom;\
void main(void) {\
\
vec3 pos = (x_rotation * z_rotation * zoom * vPosition).xyz;\
vec3 L;\
\
    L = normalize( lightPosition.xyz + pos);\
    \
    vec3 E = -normalize( pos );\
    vec3 H = normalize( L + E );\
    \
    vec3 N = normalize(vNormal.xyz);\
    \
    vec4 ambient = ambientProduct;\
    \
    float Kd = max( dot(L, N), 0.0 );\
    vec4  diffuse = Kd*diffuseProduct;\
    \
    float Ks = pow( max(dot(N, H), 0.0), shininess );\
    vec4  specular = Ks * specularProduct;\
    \
    if( dot(L, N) < 0.0 ) {\
      specular = vec4(0.0, 0.0, 0.0, 1.0);\
    } \
    gl_Position = x_rotation * z_rotation * zoom * vPosition;\
\
    fColor = ambient + diffuse + specular;\
\
    fColor.a = 1.0;\
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
  shaderProgram.vNormal = gl.getAttribLocation(shaderProgram, "vNormal");
  gl.enableVertexAttribArray(shaderProgram.vNormal);
  shaderProgram.colorUniform = gl.getUniformLocation(shaderProgram, "fColor");
  shaderProgram.x_rotation = gl.getUniformLocation(shaderProgram, "x_rotation");
  shaderProgram.z_rotation = gl.getUniformLocation(shaderProgram, "z_rotation");
  shaderProgram.zoom = gl.getUniformLocation(shaderProgram, "zoom"); //set zoom matrix
}
