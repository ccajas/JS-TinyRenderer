(function() 
{
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
		content.load('Model')('assets/obj/head/head.obj', 'test');
		content.load('Texture')('assets/obj/diablo3/diablo3_pose_nm.png', 'model_nrm');
		content.load('Texture')('assets/obj/diablo3/diablo3_pose_diffuse.png', 'model_diff');

		content.load('Effect')('assets/shaders/defaultEffect.js');

		// Call update after content is loaded
		content.finishedLoading(
		{
		    callback: renderer.modelReady(content.collection(), canvas)
		});
	}
	else
		console.error("Canvas context not supported!");

}).call(this);