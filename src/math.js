
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

	Matrix.mul = function(lh, r)
	{
		var mat = [];

		// If rhs is a vector instead of matrix
		if (!Array.isArray(r[0]))
		{
			var vec = [
				lh[0][0] * r[0] + lh[0][1] * r[1] + lh[0][2] * r[2] + lh[0][3] * r[3], 
				lh[1][0] * r[0] + lh[1][1] * r[1] + lh[1][2] * r[2] + lh[1][3] * r[3],
				lh[2][0] * r[0] + lh[2][1] * r[1] + lh[2][2] * r[2] + lh[2][3] * r[3] 
			];
			//console.log(r[0][3]);
			return vec;
		}

		for (var i = 0; i < 4; i++)
			mat[i] = [ 
				Vec4.dot(lh[i], [r[0][0], r[1][0], r[2][0], r[3][0]]), 
				Vec4.dot(lh[i], [r[0][1], r[1][1], r[2][1], r[3][1]]), 
				Vec4.dot(lh[i], [r[0][2], r[1][2], r[2][2], r[3][2]]),
				Vec4.dot(lh[i], [r[0][3], r[1][3], r[2][3], r[3][3]])
			];

		return mat;
	}

	Matrix.scale = function(x, y, z)
	{
		return [
			[x, 0, 0, 0],
			[0, y, 0, 0],
			[0, 0, z, 0],
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

	// Camera lookat with three 3D vectors

	Matrix.view = function(eye, lookat, up)
	{
		var forward = Vec3.normalize([eye[0] - lookat[0], 
			eye[1] - lookat[1], eye[2] - lookat[2]]);

		var right = Vec3.normalize(Vec3.cross(up, forward));
		var up = Vec3.normalize(Vec3.cross(forward, right));

		var view = Matrix.identity();

		for (var i = 0; i < 3; i++) 
		{
			view[0][i] = right[i];
			view[1][i] = up[i];
			view[2][i] = forward[i];
		}

		view[3][0] = -Vec3.dot(right, eye);
		view[3][1] = -Vec3.dot(up, eye);
		view[3][2] = -Vec3.dot(forward, eye);

		return view;
	}
 
	return Matrix;

})();

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
    }

    Quaternion.fromAxisAngle = function(x, y, z, angle)
    {
		var s = m.sin(angle / 2);

		return [
			x * s,
			y * s,
			z * s,
			m.cos(angle / 2)
		];
    }

    return Quaternion;

})();

// 3D Vector functions

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

// 4D Vector functions

Vec4 = (function()
{
	function Vec4() { }

	Vec4.dot = function(a, b)
	{
		return (a[0] * b[0]) + (a[1] * b[1]) + (a[2] * b[2]) + (a[3] * b[3]);
	}

	return Vec4;

})();

// Orientation on a side

orient2d = function(p1, p2, b)
{
	return (p2[0]-p1[0]) * (b[1]-p1[1]) - (p2[1]-p1[1]) * (b[0]-p1[0]);
}


// Get the max elevation angle from a point in the z-buffer (as a heightmap)

max_elevation_angle = function(zbuf, index, p, dims, ray, width)
{
	var maxangle = 0;
	for (var t = 0; t < width/30; t += width/360) 
	{
		// Current position of the ray traveled, and check for out of bounds
		var cur = [p[0] + ray[0] * t, p[1] + ray[1] * t];

		if (cur[0] >= dims[0] || cur[1] >= dims[1] || cur[0] < 0 || cur[1] < 0) 
			return maxangle;

		var distance = Vec3.dist([p[0] - cur[0], p[1] - cur[1]]);
		if (distance < 1) continue;

		// buffer index
		var curIndex = (m.floor(cur[1]) * width) + m.floor(cur[0]);
		var elevation = (zbuf[curIndex] - zbuf[index]) * 0.002; // 1/500

		maxangle = m.max(maxangle, elevation / distance);
	}

	return maxangle;
}