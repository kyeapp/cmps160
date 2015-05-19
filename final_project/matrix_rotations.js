function x_matrix(x_theta) {
var x1 = Math.cos(x_theta);
var x2 = -Math.sin(x_theta);
var x3 = Math.sin(x_theta);
var x4 = Math.cos(x_theta);

return [1, 0, 0, 0,
0, x1, x2, 0,
0, x3, x4, 0,
0, 0, 0, 1];
}

function y_matrix(y_theta) {
var y1 = Math.cos(y_theta);
var y2 = Math.sin(y_theta);
var y3 = -Math.sin(y_theta);
var y4 = Math.cos(y_theta);

return [y1, 0, y2, 0,
0, 1, 0, 0,
y3, 0, y4, 0,
0, 0, 0, 1];
}

function z_matrix(z_theta) {
var z1 = Math.cos(z_theta);
var z2 = -Math.sin(z_theta);
var z3 = Math.sin(z_theta);
var z4 = Math.cos(z_theta);

return [z1, z2, 0, 0,
z3, z4, 0, 0,
0, 0, 1, 0,
0, 0, 0, 1];
}

function scaling_matrix(s) {
return [1/s, 0, 0, 0,
0, 1/s, 0, 0, 
0, 0, 1/s, 0,
0, 0, 0, 1];
}

function perspective2(fovy, aspect, near, far) {
  //determine between perspective/orthographic toggle
    var f = Math.tan(Math.PI * 0.5 - 0.5 * fovy);
    var rangeInv = 1.0 / (near - far);
    return [1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, -1,
      0, 0, near * far * rangeInv * 2, 1
    ];
}
/*
function perspective2( fovy, aspect, near, far ) {
  var f = Math.tan(Math.PI * 0.5 - 0.5 * fovy);
  var rangeInv = 1.0 / (near - far);
  return [
  -f/aspect, 0, 0, 0,
  0, -f/aspect, 0, 0,
  0, 0, 1, -1,
  0, 0, near * far * rangeInv * 2, 1
  ];
}
*/
function translation(x, y, z) {
  return [1,0,0,x/s,
  0,1,0,y/s,
  0,0,1,z/s,
  0,0,0,1];
}
  
  
  