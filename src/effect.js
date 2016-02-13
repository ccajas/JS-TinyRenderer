
// Shader effect object

var Effect = 
{
	vertex: null,

	fragment: function(bar, color)
	{
		color[0] = 0xff0000;
		return false;
	}
};