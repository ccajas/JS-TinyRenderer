
// Utility functions

var Util = new Object();

// Find bounding box from a set of 2D points
// Returns an array of 2 points (min and max bounds)

Util.findBbox = function(points, img_dims)
{
	var boxMin = [img_dims[0] + 1, img_dims[1] + 1];
	var boxMax = [-1, -1];

	// Find X and Y dimensions for each
	for (var i = 0; i < points.length; i++)
	{
		for (var j = 0; j < 2; j++) 
		{ 
			boxMin[j] = Math.min(points[i][j], boxMin[j]);
			boxMax[j] = Math.max(points[i][j], boxMax[j]);
		}
	}

	return [boxMin, boxMax];
}

// cross product of two 3D vectors

Util.cross = function(a, b)
{
	// (a.x, a.y, a.z) x (b.x, b.y, b.z)
	return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

// Get barycentric coordinates from three points

Util.barycentric = function(pts, point) 
{
    var u = this.cross(
    	[pts[2][0]-pts[0][0], pts[1][0]-pts[0][0], pts[0][0]-point[0]],  // (x2-x0, x1-x0, x0-p.x)
    	[pts[2][1]-pts[0][1], pts[1][1]-pts[0][1], pts[0][1]-point[1]]   // (y2-y0, y1-y0, y0-p.y)
    );

    // triangle is degenerate, return a position with negative coordinates 
    if (Math.abs(u[2]) < 1) return [-1, 1, 1];

	// (1 - (u.x + u.y), u.y, u.x)
    return [1 - ((u[0] + u[1]) / u[2]), u[1] / u[2], u[0] / u[2]];
} 