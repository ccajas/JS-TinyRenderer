
// Model functions

Model = (function()
{
	// OBJ properties

	function Model()
	{ 
		this.verts = [];
		this.faces = [];
		this.normals = [];
		this.texcoords = [];
	}

	Model.parseOBJ = function(lines, model)
	{
		var splitLn = function(i) { return lines[i].split(' ').splice(1, 3); }

		// Read each line
		for (var i = 0; i < lines.length; i++)
		{
			// Find vertex positions

			var mtype = lines[i].substr(0, 2);
			var mdata = (mtype == 'v ') ? model.verts : 
				 		(mtype == 'vn') ? model.normals : 
				 		(mtype == 'vt') ? model.texcoords : null;

			// Otherwise, add vertex data as normal
			if (mdata)
				mdata.push(new f32a(splitLn(i)));
		}

		// Read again for face data
		for (var i = 0; i < lines.length; i++)
		{
			// Special case for parsing face indices
			if (lines[i].substr(0, 2) == 'f ')
			{
				idx = splitLn(i);						
				for (j = 0; j < 3; j++)
					idx[j] = idx[j].split('/')
						.map(function(i) { return parseInt(i - 1) });

				model.faces.push(idx);
			}
		}
	}

	Model.prototype =
	{
		// Get vertex data from face

		vert: function(f_index, v)
		{
			var face = model.faces[f_index];
			var vert = model.verts[face[v][0]];
			var vt = (model.texcoords.length > 0) ? model.texcoords[face[v][1]] : [0, 0];
			var vn = (model.normals.length > 0)   ? model.normals[face[v][2]]   : [1, 0, 0];

			// Return vertex data
			return [vert, vt, vn];
		}
	}

	return Model;

})();
