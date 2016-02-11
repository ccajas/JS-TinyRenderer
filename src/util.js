
// Utility functions

// Find bounding box from a set of 2D points
// Returns an array of 2 points (min and max bounds)

findBbox = function(points, img_dims)
{
	var boxMin = [img_dims[0] + 1, img_dims[1] + 1];
	var boxMax = [-1, -1];

	// Find X and Y dimensions for each
	for (var i = 0; i < points.length; i++)
		for (var j = 0; j < 2; j++) 
		{
			boxMin[j] = Math.min(points[i][j], boxMin[j]);
			boxMax[j] = Math.max(points[i][j], boxMax[j]);
		}

	return [boxMin, boxMax];
}

// Add two vectors

vecAdd = function(a, b)
{
	var diff = [];
	for (var i = 0; i < a.length; i++)
		diff[i] = a[i] + b[i];

	return diff;
}

// Subtract two vectors

vecSub = function(a, b)
{
	var diff = [];
	for (var i = 0; i < a.length; i++)
		diff[i] = a[i] - b[i];

	return diff;
}

// Clamp between two values

clamp = function(x, a, b) 
{
	return Math.min(Math.max(x, a), b);
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

	return Math.sqrt(sum);
}

// Normalize a vector

normalize = function(v)
{
	var length = dist(v);
	var res = [];

	for (var i = 0; i < v.length; i++)
		res[i] = v[i] / length;

	return res;
}

// Barycentric coordinates from three points

barycentric = function(pts, point) 
{
	var u = cross(
		[pts[2][0]-pts[0][0], pts[1][0]-pts[0][0], pts[0][0]-point[0]],  // (x2-x0, x1-x0, x0-p.x)
		[pts[2][1]-pts[0][1], pts[1][1]-pts[0][1], pts[0][1]-point[1]]   // (y2-y0, y1-y0, y0-p.y)
	);

	// triangle is degenerate, return a position with negative coordinates 
	if (Math.abs(u[2]) < 1) return [-1, 1, 1];

	// (1 - (u.x + u.y), u.y, u.x)
	return [1 - ((u[0] + u[1]) / u[2]), u[1] / u[2], u[0] / u[2]];
} 

max_elevation_angle = function(zbuffer, index, p, dims, ray, log2width)
{
	var maxangle = 0;
	for (var t = 0; t < 20; t++) 
	{
		var cur = vecAdd(p, [ray[0] * t, ray[1] * t]);
		if (cur[0] >= dims[0] || cur[1] >= dims[1] || cur[0] < 0 || cur[1] < 0) return maxangle;

		var distance = dist(vecSub(p, cur));
		if (distance < 1) continue;

		// buffer index
		var curIndex = ((dims[1] - Math.floor(cur[1])) << log2width) + Math.floor(cur[0]);
		var elevation = zbuffer[curIndex] - zbuffer[index];

		maxangle = Math.max(maxangle, Math.atan(elevation / distance));
	}

	return maxangle;
}