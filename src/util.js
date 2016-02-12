
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
	return res = [v[0] / length, v[1] / length, v[2] / length];
}

// Barycentric coordinates from three points

barycentric = function(pts, point) 
{
	var u = cross(
		vecSub([pts[2][0], pts[1][0], pts[0][0]], [pts[0][0], pts[0][0], point[0]]), // (x2-x0, x1-x0, x0-p.x)
		vecSub([pts[2][1], pts[1][1], pts[0][1]], [pts[0][1], pts[0][1], point[1]])  // (y2-y0, y1-y0, y0-p.y)
	);

	if (m.abs(u[2]) > 1e-2)
	{
		var inv_u = 1 / u[2];
		return [1 - ((u[0] + u[1]) * inv_u), u[1] * inv_u, u[0] * inv_u]; // (1 - (u.x + u.y), u.y, u.x)
	}

	// triangle is degenerate, return a position with negative coordinates 	
	return [-1, 1, 1];
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
		var elevation = (zbuffer[curIndex] - zbuffer[index]) * 0.007874; // 1/127

		maxangle = m.max(maxangle, m.atan(elevation / distance));
	}

	return maxangle;
}