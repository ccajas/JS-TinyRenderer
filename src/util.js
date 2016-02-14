
// Utility functions

// Add two vectors

vecAdd = function(a, b)
{
	var sum = [];
	for (var i = 0; i < a.length; i++)
		sum.push(a[i] + b[i]);

	return sum;
}

// Subtract two vectors

vecSub = function(a, b)
{
	var diff = [];
	for (var i = 0; i < a.length; i++)
		diff.push(a[i] - b[i]);

	return diff;
}

// Dot product of two 3D vectors

dot = function(a, b)
{
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

// Cross product of two 3D vectors

cross = function(a, b)
{
	// (a.x, a.y, a.z) x (b.x, b.y, b.z)
	return [
		a[1] * b[2] - a[2] * b[1], 
		a[2] * b[0] - a[0] * b[2], 
		a[0] * b[1] - a[1] * b[0]
	];
}

// Distance of a vector

dist = function(v)
{
	var sum = 0;
	for (var i = 0; i < v.length; i++)
		sum += (v[i] * v[i]);

	return m.sqrt(sum);
}

// Normalize a 3D vector

normalize = function(v)
{
	var length = dist(v);
	return [v[0] / length, v[1] / length, v[2] / length];
}

// Barycentric coordinates from three 2D points

barycentric = function(pts, point)
{
    var v0 = vecSub(pts[1], pts[0]), 
    v1 = vecSub(pts[2], pts[0]), 
    v2 = vecSub(point, pts[0]);

    var dn1 = 1 / (v0[0] * v1[1] - v1[0] * v0[1]);

    v = (v2[0] * v1[1] - v1[0] * v2[1]) * dn1;
    w = (v0[0] * v2[1] - v2[0] * v0[1]) * dn1;
    u = 1 - v - w;

    return [u, v, w];
}

// Get the max elevation angle from a point in the z-buffer (as a heightmap)

max_elevation_angle = function(zbuffer, index, p, dims, ray, log2width)
{
	var maxangle = 0;
	for (var t = 0; t < 30; t++) 
	{
		// Current position of the ray traveled, and check for out of bounds
		var cur = vecAdd(p, [ray[0] * t, ray[1] * t]);
		if (cur[0] >= dims[0] || cur[1] >= dims[1] || cur[0] < 0 || cur[1] < 0) return maxangle;

		var distance = dist(vecSub(p, cur));
		if (distance < 1) continue;

		// buffer index
		var curIndex = ((dims[1] - m.floor(cur[1])) << log2width) + m.floor(cur[0]);
		var elevation = (zbuffer[curIndex] - zbuffer[index]) * 0.0078125; // 1/128

		maxangle = m.max(maxangle, elevation / distance);
	}

	return maxangle;
}