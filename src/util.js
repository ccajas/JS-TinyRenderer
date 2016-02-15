
// Camera functions

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

// Matrix functions

function Matrix()
{
	var mat = 
	{
		rows: [],
	}

	mat.identity()
	{
		mat.rows = [
			[1, 0, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 1, 0],
			[0, 0, 0, 1]
		];
		return mat.rows;
	}

	mat.row(r)
	{
		return mat.rows[r];
	}

	mat.col(c)
	{
		var col = [];
		for (var i = 0; i < mat.rows.length; i++)
			col[i] = mat.at(i, c);
		return col;
	}

	mat.at(row, col)
	{
		return mat.rows[row][col];
	}

	mat.mul = function(rhs)
	{
		var result = [];
    	for (var i = 0; i < mat.rows.length; i++)
        	for (var j = 0; j < mat.rows[0].length; j++)
        		result[i][j] = 
        			dot(mat.row(i), rhs.col(j));

    	return result;
	}

	return mat;
}

// Vector functions

// Add two vectors

vecAdd = function(a, b)
{
	var r = [];
	for (var i = 0; i < a.length; i++)
		r.push(a[i] + b[i]);

	return r;
}

// Subtract two vectors

vecSub = function(a, b)
{
	var r = [];
	for (var i = 0; i < a.length; i++)
		r.push(a[i] - b[i]);

	return r;
}

// Dot product of two vectors

dot = function(a, b)
{
	var r;
	for (var i = a.length; i--; r += a[i] * b[i]);
	return r;
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
	for (var t = 1; t < 40; t += 2) 
	{
		// Current position of the ray traveled, and check for out of bounds
		var cur = vecAdd(p, [ray[0] * t, ray[1] * t]);
		if (cur[0] >= dims[0] || cur[1] >= dims[1] || cur[0] < 0 || cur[1] < 0) return maxangle;

		var distance = dist(vecSub(p, cur));
		if (distance < 1) continue;

		// buffer index
		var curIndex = ((dims[1] - m.floor(cur[1])) << log2width) + m.floor(cur[0]);
		var elevation = (zbuffer[curIndex] - zbuffer[index]) * 0.002; // 1/500

		maxangle = m.max(maxangle, elevation / distance);
	}

	return maxangle;
}