// Effect object implementation

Effect = (function()
{
	function Effect() {}

	Effect.prototype = 
	{
		// Vertex and fragment shaders

		vertex: function(vs_in) { },

		fragment: function(ps_in, color) { },

		// Map parameters to effect

		setParameters: function(params)
		{
			var self = this;
			Object.keys(params).map(function(key) 
			{
				self[key] = params[key];
			});
		}
	}

	return Effect;

})();
