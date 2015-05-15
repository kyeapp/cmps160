// Kevin Yeap
// kyeap@ucsc.edu
// 1270597
// A.Pang S15
//shark

//Left click the shark to toggle between flat and smooth shading. 
//Right click the shark to toggle between perspective and orthographic view.

//AMOUNT IN DEGREES TO ROTATE MODEL
var x = 0;
var y = -60;
var z = -10;
var s = 120;

var x_tran = 0;
var y_tran = 0;
var z_tran = 0;

var aspect;

var gl, vbuf;

var point_array = [];
var normal_array = [];

var smooth_shading_array = [];
var flat_shading_array = [];

var mouse_pos_x = 0;
var mouse_pos_y = 0;
var last_mouse_pos_x = 0;
var last_mouse_pos_y = 0;

var fovy = 200.0; // Field-of-view in Y direction angle (in degrees)
var aspect = 640 / 480; // Viewport aspect ratio
var near = 0.3;
var far = 100.0;

//background color
var R = 0;
var G = 191;
var B = 255;
var A = 255;

function init() {
  //gl.clearColor(0.0, .75, 1.0, 1); //preset value of background color to deep sky blue; RGBA
  gl.clearColor(R / 255, G / 255, B / 255, A / 255);
  gl.clear(gl.COLOR_BUFFER_BIT); //clearing the color buffer to the preset colors
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.GREATER);
  gl.clearDepth(0.0);

  aspect = canvas.width / canvas.height;

  var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
  var lightAmbient = vec4(0.12, 0.12, 0.12, 1.0);
  var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
  var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

  var materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
  var materialDiffuse = vec4(0.55, 0.55, 0.55, 1.0);
  var materialSpecular = vec4(.5, .5, .5, 1.0);
  var materialShininess = 10;

  ambientProduct = mult(lightAmbient, materialAmbient);
  diffuseProduct = mult(lightDiffuse, materialDiffuse);
  specularProduct = mult(lightSpecular, materialSpecular);

  gl.uniform4fv(gl.getUniformLocation(shaderProgram, "ambientProduct"), flatten(ambientProduct));
  gl.uniform4fv(gl.getUniformLocation(shaderProgram, "diffuseProduct"), flatten(diffuseProduct));
  gl.uniform4fv(gl.getUniformLocation(shaderProgram, "specularProduct"), flatten(specularProduct));
  gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lightPosition"), flatten(lightPosition));
  gl.uniform1f(gl.getUniformLocation(shaderProgram, "shininess"), materialShininess);
  
  //generate shark model and normals
  for (var i = 0; i < SHARK_COORD.length; i++) {
    smooth_shading_array.push(vec4(0, 0, 0, 0));
  }

  //process shark polygons
  for (var i = 0; i < SHARK_POLY.length; i++) {
    ps_polygon(SHARK_POLY[i]);
  }

  //process normals
  for (var i = 0; i < SHARK_POLY.length; i++) {
    ps_normals(SHARK_POLY[i]);
  }
  
  generate_shark();
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
    alert("Unable to initialize WebGL.");
  } else {
    document.getElementById('canvas').addEventListener('mousemove', function(evt) {
      last_mouse_pos_x = mouse_pos_x;
      last_mouse_pos_y = mouse_pos_y;
      getMousePos(canvas, evt);
      
      switch (event.which) {
      case 1: //left-click
        x_tran += (mouse_pos_x - last_mouse_pos_x);
        y_tran += (mouse_pos_y - last_mouse_pos_y);
        console.log(x_tran);
        generate_shark();
        break;
      case 3: //right-click
          x += (mouse_pos_y - last_mouse_pos_y)/2;
          y += (mouse_pos_x - last_mouse_pos_x)/2;
          generate_shark();
        break;
      }
    }, false);
    
    document.getElementById("x_slider").oninput = function() {
      x = event.srcElement.value;
      generate_shark();
    };
    
    document.getElementById("y_slider").oninput = function() {
      y = event.srcElement.value;
      generate_shark();
    };
    
    document.getElementById("z_slider").oninput = function() {
      z = event.srcElement.value;
      generate_shark();
    };
    
    document.getElementById("s_slider").oninput = function() {
      s = event.srcElement.value;
      generate_shark();
    };
  }
}

//get mouse position with respective to the readPixel corrdinate system
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  mouse_pos_x = Math.round(evt.clientX - rect.left),
  mouse_pos_y = Math.round(evt.clientY - rect.top - ((evt.clientY - rect.top) - (canvas.height / 2)) * 2)
}

//Process_shark_polygon, takes input of single array of shark polygon index
function ps_polygon(poly) {
  var a, b, c;
  a = vec4(SHARK_COORD[poly[1] - 1]);
  for (var i = 1; i < poly.length - 2; i++) {
    b = vec4(SHARK_COORD[poly[i + 1] - 1]);
    c = vec4(SHARK_COORD[poly[i + 2] - 1]);
    point_array.push(a);
    point_array.push(b);
    point_array.push(c);

    var t1 = subtract(a, b);
    var t2 = subtract(b, c);
    var normal = normalize(cross(t1, t2));
    normal = vec4(normal);

    //adding normals to other adjecent normals
    smooth_shading_array[poly[1] - 1] = add(smooth_shading_array[poly[1] - 1], normal);
    smooth_shading_array[poly[i + 1] - 1] = add(smooth_shading_array[poly[i + 1] - 1], normal);
    smooth_shading_array[poly[i + 2] - 1] = add(smooth_shading_array[poly[i + 2] - 1], normal);

    //pushing flat shading normals
    flat_shading_array.push(normal);
    flat_shading_array.push(normal);
    flat_shading_array.push(normal);
  }
}

function ps_normals(poly) {
  var a, b, c;

  a = vec4(SHARK_COORD[poly[1] - 1]);
  for (var i = 1; i < poly.length - 2; i++) {
    b = vec4(SHARK_COORD[poly[i + 1] - 1]);
    c = vec4(SHARK_COORD[poly[i + 2] - 1]);

    normal_array.push(smooth_shading_array[poly[1] - 1]);
    normal_array.push(smooth_shading_array[poly[i + 1] - 1]);
    normal_array.push(smooth_shading_array[poly[i + 2] - 1]);
  }
}

//process each shark polygon part
function generate_shark() {
  var x_theta = x * Math.PI / 180;
  var x_rotation_matrix = x_matrix(x_theta)

  var y_theta = y * Math.PI / 180;
  var y_rotation_matrix = y_matrix(y_theta)

  var z_theta = z * Math.PI / 180;
  var z_rotation_matrix = z_matrix(z_theta);

  var scale_matrix = scaling_matrix(s);
  
  perspective_matrix = perspective2(fovy, aspect, near, far);
  
  var translation_matrix = translation(x_tran, y_tran, z_tran);

  shaderProgram.x_rotation = gl.getUniformLocation(shaderProgram, "x_rotation");
  shaderProgram.y_rotation = gl.getUniformLocation(shaderProgram, "y_rotation");
  shaderProgram.z_rotation = gl.getUniformLocation(shaderProgram, "z_rotation");
  shaderProgram.scale = gl.getUniformLocation(shaderProgram, "scale"); //set scale matrix
  shaderProgram.perspective = gl.getUniformLocation(shaderProgram, "perspective");
  shaderProgram.translation = gl.getUniformLocation(shaderProgram, "translation");

  gl.uniformMatrix4fv(shaderProgram.x_rotation, false, new Float32Array(x_rotation_matrix));
  gl.uniformMatrix4fv(shaderProgram.y_rotation, false, new Float32Array(y_rotation_matrix));
  gl.uniformMatrix4fv(shaderProgram.z_rotation, false, new Float32Array(z_rotation_matrix));
  gl.uniformMatrix4fv(shaderProgram.perspective, false, new Float32Array(perspective_matrix));
  gl.uniformMatrix4fv(shaderProgram.scale, false, new Float32Array(scale_matrix));
  gl.uniformMatrix4fv(shaderProgram.translation, false, new Float32Array(translation_matrix));
  

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  render(); //render the shark
}



function render() {
  init_v_buffer(point_array);
  init_n_buffer(normal_array);
  gl.uniform4f(shaderProgram.colorUniform, 1, 1, 1, 1); //sets the color of the lines.
  gl.drawArrays(gl.TRIANGLES, 0, point_array.length);
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
uniform mat4 y_rotation;\
uniform mat4 z_rotation;\
uniform mat4 perspective;\
uniform mat4 scale;\
uniform mat4 translation;\
void main(void) {\
\
vec3 pos = ( x_rotation * y_rotation * z_rotation * scale * vPosition).xyz;\
vec3 L;\
\
    if(lightPosition.w == 0.0) L = normalize(lightPosition.xyz);\
    else L = normalize( lightPosition.xyz - pos );\
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
    gl_Position =  perspective * x_rotation * y_rotation * z_rotation * scale * vPosition * translation;\
\
    fColor = ambient + diffuse + specular ;\
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
}