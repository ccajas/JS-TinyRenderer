
// Model functions

Model = (function()
{
	// OBJ properties

	function Model()
	{ 
		this.v = [];
		this.f = [];
		this.vn = [];
		this.vt = [];
	}

	Model.parseOBJ = function(lines, model)
	{
		var splitLn = function(i) { return lines[i].split(' ').splice(1, 3); }

		// Read each line
		for (var i = 0; i < lines.length; i++)
		{
			// Find vertex positions

			var mtype = lines[i].substr(0, 2);
			var mdata = (mtype === 'v ') ? model.v : 
				 		(mtype === 'vn') ? model.vn : 
				 		(mtype === 'vt') ? model.vt : null;

			// Special case for parsing face indices
			if (lines[i].substr(0, 2) === 'f ')
			{
				idx = splitLn(i);						
				for (j = 0; j < 3; j++)
					idx[j] = idx[j].split('/')
						.map(function(i) { return parseInt(i - 1) });

				model.f.push(idx);
			}

			// Otherwise, add vertex data as normal
			if (mdata)
				mdata.push(new f32a(splitLn(i)));
		}
	}

	Model.prototype =
	{
		// Get vertex data from face

		vert: function(f_index, v)
		{
			var face = model.f[f_index];
			var vert = model.v[face[v][0]];
			var vt = (model.vt.length > 0) ? model.vt[face[v][1]] : [0, 0];
			var vn = (model.vn.length > 0) ? model.vn[face[v][2]] : [1, 0, 0];

			// Return vertex data
			return [vert, vt, vn];
		}
	}

	return Model;

})();
