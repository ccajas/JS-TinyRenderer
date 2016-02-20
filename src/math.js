
// Camera functions
/*
viewport = function(x, y, w, h) 
{
	var vp = Matrix();
	vp[0][3] = x + w/2;
	vp[1][3] = y + h/2;
	vp[2][3] = 1;
	vp[0][0] = w/2;
	vp[1][1] = h/2;
	vp[2][2] = 0;

	return vp;
}

projection = function(coeff) 
{
	var proj = Matrix();
	proj[3][2] = coeff;

	return proj;
}

// Camera lookat with three 3D vectors

lookat = function(eye, center, up)
{
	var z = normalize(vecSub(eye, center));
	var x = normalize(cross(up, z));
	var y = normalize(cross(z,x));

	var minv = Matrix();
	var tr   = Matrix();

	for (var i = 0; i < 3; i++) 
	{
		minv[0][i] = x[i];
		minv[1][i] = y[i];
		minv[2][i] = z[i];
		tr[i][3] = -center[i];
	}

	ModelView = Minv * Tr;
}
*/
// Matrix functions

Matrix = (function()
{
	function Matrix() {}

	Matrix.identity = function()
	{
		return [
			[1, 0, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 1, 0],
			[0, 0, 0, 1]
		];
	}

	Matrix.rotation = function(q) 
	{
		var x = q[0], y = q[1], z = q[2], w = q[3];

		return [
			[1 - 2*y*y - 2*z*z, 2*x*y + 2*z*w, 		2*x*z - 2*y*w, 		0], 
			[2*x*y - 2*z*w, 	1 - 2*x*x - 2*z*z,	2*z*y + 2*x*w, 		0], 
			[2*x*z + 2*y*w, 	2*z*y - 2*x*w, 		1 - 2*x*x - 2*y*y, 	0], 
			[0, 0, 0, 1]
		];
	}

	return Matrix;

})();

// Experimental matrix
function Mat4(stdlib, foreign, heap) 
{
    'use asm';

    var H = new stdlib.Float32Array(heap);
    var I = new stdlib.Uint8Array(heap);
    var fr = stdlib.Math.fround;

    var x2 = 0.0, y2 = 0.0, z2 = 0.0;
    var f1 = fr(1.0), f2 = fr(2.0);
    var db = 0.0;

    function identity() 
    {
        var offset = 0;
        offset = ((I[0]|0 + 16) << 6)|0;
        I[0] = I[0]|0 + 1;

        H[offset >> 2] = 1.0;
        H[(offset + 4) >> 2] = 0.0;
        H[(offset + 8) >> 2] = 0.0;
        H[(offset + 12) >> 2] = 0.0;
        H[(offset + 16) >> 2] = 0.0;
        H[(offset + 20) >> 2] = 1.0;
        H[(offset + 24) >> 2] = 0.0;
        H[(offset + 28) >> 2] = 0.0;
        H[(offset + 32) >> 2] = 0.0;
        H[(offset + 36) >> 2] = 0.0;
        H[(offset + 40) >> 2] = 1.0;
        H[(offset + 44) >> 2] = 0.0;
        H[(offset + 48) >> 2] = 0.0;
        H[(offset + 52) >> 2] = 0.0;
        H[(offset + 56) >> 2] = 0.0;
        H[(offset + 60) >> 2] = 1.0;

        return (offset >> 2)|0;
    }

    function rotation(x, y, z, w) 
    {
    	x = +x;
    	y = +y;
    	z = +z;
    	w = +w;

    	// Set buffers
        var offset = 0;
        //offset = ((I[0]|0 + 16) << 6)|0;
        //I[0] = I[0]|0 + 1;

        // Assign values
        //db = (+f2) * +(y*y);
        H[offset >> 2] = 1.0 - 2.0 * (y*y) - 2.0 * (z*z);
        H[4 >> 2] = 2.0 * (x*y) + 2.0 * (z*w);
        H[8 >> 2] = 2.0 * (x*z) - 2.0 * (y*w);
        H[12 >> 2] = 0.0;

        H[16 >> 2] = 2.0 * (x*y) - 2.0 * (z*w);
        H[20 >> 2] = 1.0 - 2.0 * (x*x) - 2.0 * (z*z);
        H[24 >> 2] = 2.0 * (z*y) + 2.0 * (x*w);
        H[28 >> 2] = 0.0;

        H[32 >> 2] = 2.0 * (x*z) + 2.0 * (y*w);
        H[36 >> 2] = 2.0 * (z*y) - 2.0 * (x*w);
        H[40 >> 2] = 1.0 - 2.0 * (x*x) - 2.0 * (y*y);
        H[44 >> 2] = 0.0;

        H[48 >> 2] = 0.0;
        H[52 >> 2] = 0.0;
        H[56 >> 2] = 0.0;
        H[60 >> 2] = 1.0;

        return (offset >> 2)|0;
    }

    return {
        identity: identity,
        rotation: rotation
    };
};

var buffer = new ArrayBuffer(65536);
var f32array = new Float32Array(buffer);
var mat4 = Mat4(window, {}, buffer);

// Quaternion functions

Quaternion = (function() 
{
    function Quaternion() {}

    Quaternion.fromEuler = function(x, y, z) 
    {
		var cx, cy, cz, sx, sy, sz;
		sx = m.sin(x * 0.5);
		cx = m.cos(x * 0.5);
		sy = m.sin(y * 0.5);
		cy = m.cos(y * 0.5);
		sz = m.sin(z * 0.5);
		cz = m.cos(z * 0.5);

		return [
			cx * cy * cz + sx * sy * sz, 
			sx * cy * cz - cx * sy * sz, 
			cx * sy * cz + sx * cy * sz, 
			cx * cy * sz - sx * sy * cz
		];
    };

    return Quaternion;

})();

// Vector functions

Vec3 = (function() 
{
	function Vec3() {}

	Vec3.dot = function(a, b)
	{
		return (a[0] * b[0]) + (a[1] * b[1]) + (a[2] * b[2]);
	}

	Vec3.cross = function(a, b)
	{
		// (a.x, a.y, a.z) x (b.x, b.y, b.z)
		return [
			a[1] * b[2] - a[2] * b[1], 
			a[2] * b[0] - a[0] * b[2], 
			a[0] * b[1] - a[1] * b[0]
		];
	}

	Vec3.reflect = function(l, n)
	{
		var ldn = Vec3.dot(l, n);
		var proj = [2 * n[0] * ldn, 2 * n[1] * ldn, 2 * n[2] * ldn];

		return [proj[0] - l[0], proj[1] - l[1], proj[2] - l[2]];
	}

	Vec3.dist = function(v)
	{
		var sum = 0;
		for (var i = 0; i < v.length; i++)
			sum += (v[i] * v[i]);

		return m.sqrt(sum);
	}

	Vec3.normalize = function(v)
	{
		var dist1 = 1 / Vec3.dist(v);
		return [v[0] * dist1, v[1] * dist1, v[2] * dist1];
	}

	return Vec3;

})();

// Orientation on a side

orient2d = function(p1, p2, b)
{
	return (p2[0]-p1[0]) * (b[1]-p1[1]) - (p2[1]-p1[1]) * (b[0]-p1[0]);
}

// Barycentric coordinates from three 2D points

barycentric = function(pts, point)
{
	var pt0 = pts[0], pt1 = pts[1], pt2 = pts[2];

	var v0 = [pt1[0] - pt0[0], pt1[1] - pt0[1], pt1[2] - pt0[2]],
	v1 =     [pt2[0] - pt0[0], pt2[1] - pt0[1], pt2[2] - pt0[2]], 
	v2 =     [point[0] - pt0[0], point[1] - pt0[1], point[2] - pt0[2]];

	var dn1 = 1 / (v0[0] * v1[1] - v1[0] * v0[1]);

	v = (v2[0] * v1[1] - v1[0] * v2[1]) * dn1;
	w = (v0[0] * v2[1] - v2[0] * v0[1]) * dn1;
	u = 1 - v - w;

	return [u, v, w];
}
/*
VecModule = function(stdlib, foreign, heap) 
{
    "use asm";

    // Variable Declarations
    var sqrt = stdlib.Math.sqrt;
    var H = new stdlib.Float32Array(heap);
    var I = new stdlib.Uint8Array(heap);

    function dist(x, y) {
        x = +x;
        y = +y;
        return +sqrt((x*x) + (y*y));
    }

    function mul(a, b)
    {
    	a = +a;
    	b = +b;
    	return a * b;
    }

	return { dist: dist, mul: mul };
}

var buf = new ArrayBuffer(65536);
var array = new Float32Array(buf);
var vecModule = VecModule(this, {}, buf);

console.log(vecModule.dist(12, 11));

// Get the max elevation angle from a point in the z-buffer (as a heightmap)

max_elevation_angle = function(zbuffer, index, p, dims, ray, width)
{
	var maxangle = 0;
	for (var t = 1; t < 40; t += 3) 
	{
		// Current position of the ray traveled, and check for out of bounds
		var cur = [p[0] + ray[0] * t, p[1] + ray[1] * t];
		if (cur[0] >= dims[0] || cur[1] >= dims[1] || cur[0] < 0 || cur[1] < 0) return maxangle;

		var distance = Vec3.dist([p[0] - cur[0], p[1] - cur[1]]);
		if (distance < 1) continue;

		// buffer index
		var curIndex = ((dims[1] - m.floor(cur[1])) * width) + m.floor(cur[0]);
		var elevation = (zbuffer[curIndex] - zbuffer[index]) * 0.002; // 1/500

		maxangle = m.max(maxangle, elevation / distance);
	}

	return maxangle;
}
*/