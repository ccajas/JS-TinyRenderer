(function() 
{
	// Shorthand
	m = Math;
	doc = document;
	f32x4 = Float32Array;

	// Globals
	startProfile = null;
	frames = 0;

	// Set canvas
	var canvas = doc.getElementById('render');
	//model = Object.create(OBJmodel);

	renderer = new Renderer();
	content = new ContentManager();

	if (canvas.getContext)
	{
		content.load('Model')('assets/obj/diablo3/diablo3.obj', 'model');
		content.load('Model')('assets/obj/head/head.obj', 'head');
		content.load('Effect')('assets/shaders/defaultEffect.js');
		//renderer.modelReady(model, canvas)

		// Call update after content is loaded
		content.finishedLoading(
		{
		    numRequest: 3,
		    callback: renderer.modelReady(content.contentCollection(), canvas)
		});
	}
	else
		console.error("Canvas context not supported!");

}).call(this);