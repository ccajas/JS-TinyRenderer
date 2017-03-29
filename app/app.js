(function() 
{
	// Globals
	startProfile = null;
	frames = 0;

	// Application entry point

	App = (function()
	{
		// Internal variables
		var thetaX = m.PI;
		var thetaY = m.PI;
		var ctx = null;
		var ssaoToggle = doc.getElementById('ssao-toggle');
		var ssaoEnabled = false;

		// Mouse control
		var mouseDown = false;
		var mouseMoved = false;
		var lastMouseX = 0;
		var lastMouseY = 0;

		function App()
		{
			//this.renderer = null;			
			this.init();
		}

		// Mouse event handling

		App.handleMouseEvents = function(canvas)
		{
			canvas.onmousedown = App.onMouseDown;
			document.onmouseup = App.onMouseUp;
			document.onmousemove = App.onMouseMove;
		}

		App.onMouseDown = function(event) 
		{
			mouseDown = true;
			lastMouseX = event.clientX;
			lastMouseY = event.clientY;
		}

		App.onMouseUp = function(event) 
		{
			mouseDown = false;
		}

		// Only detect mouse movement when button is pressed

		App.onMouseMove = function(event) 
		{
			if (!mouseDown) return;

			var newX = event.clientX;
			var newY = event.clientY;

			thetaX += (newX - lastMouseX) / (m.PI * 90);
			thetaY += (newY - lastMouseY) / (m.PI * 60);

			lastMouseX = newX;
			lastMouseY = newY;
		}

		App.prototype =
		{
			init: function()
			{
				// Set canvas
				var canvas = doc.getElementById('render');

				content = new ContentManager();

				if (canvas.getContext)
				{
					//content.load('Model')('assets/models/tank1/Tank1.obj', 'model');
					//content.load('Texture')('assets/models/tank1/engine_diff_tex_small.png', 'model_diff');
					content.load('Model')('assets/models/testmodel/model.obj', 'model');
					content.load('Texture')('assets/models/testmodel/model_pose_diffuse.png', 'model_diff');
					content.load('Texture')('assets/models/testmodel/model_pose_nm.png', 'model_nrm');

					content.load('Effect')('assets/shaders/defaultEffect.js');

					// Call update after content is loaded
					content.finishedLoading(this.ready(canvas));
				}
				else
					console.error("Canvas context not supported!");
			},

			// Display render button

			ready: function(canvas)
			{
				var self = this;
				console.log('ready to render!');

				return function(content)
				{
					model = content.model;

					// Create texture and effects
					effect = new DefaultEffect();
					var texture = content.model_diff;
					var texture_nrm = content.model_nrm;

					// Set context
					ctx = canvas.getContext('2d');
					var el = doc.getElementById('render-start');

					buffer = new Buffer(ctx, canvas.width, canvas.height);
					self.renderer = new Renderer(content);
					App.handleMouseEvents(canvas);

					// Font setup
					ctx.fillStyle = '#888';
					ctx.font = '16px Helvetica';

					// Set shader parameters
					effect.setParameters({
						scr_w: buffer.w,
						scr_h: buffer.h,
						texture: texture,
						texture_nrm: texture_nrm
					});

					// Begin render button
					el.style.display = 'inline';
					el.disabled = false;
					el.value = "Render";
					el.onclick = function() 
					{
						console.log('Begin render!');
						el.disabled = true;
						el.value = "Rendering";
						startProfile = new Date();
						self.update(self.renderer);
					}

					// Toggle SSAO button
					ssaoToggle.onclick = function()
					{
						//simdEnabled = !simdEnabled;
						ssaoEnabled = !ssaoEnabled;
						ssaoToggle.value = 'SSAO is ' +
							((ssaoEnabled) ? 'on' : 'off');
					}
				}
			},

			// Update loop

			update: function(renderer)
			{
				var self = this;

				// Set up effect params
				start = new Date();

				var rotateX = Matrix.rotation(Quaternion.fromAxisAngle(1, 0, 0, thetaY));
				var rotateY = Matrix.rotation(Quaternion.fromAxisAngle(0, 1, 0, thetaX));
				var scale = Matrix.scale(1, 1, 1);

				var world = Matrix.mul(rotateX, rotateY);

				effect.setParameters({
					m_world: world
				});

				// Render
				buffer.clear(ssaoEnabled ? [255, 255, 255] : [5, 5, 5]);
				renderer.drawGeometry(buffer);

				if (ssaoEnabled) buffer.postProc();
				buffer.draw();

				// Update rotation angle
				//theta += m.max((0.001 * (new Date().getTime() - start.getTime())), 1/60);

				// Display stats and info
				var execTime = "Frame time: "+ (new Date().getTime() - start.getTime()) +" ms";
				var infoText = "Drag mouse to rotate";
				var calls = "Pixels drawn/searched: "+ buffer.calls +'/'+ buffer.pixels;

				ctx.fillText(infoText, 4, buffer.h - 44);
				ctx.fillText(execTime, 4, buffer.h - 26);
				ctx.fillText(calls, 4, buffer.h - 8);

				// Reset stats
				buffer.calls = 0;
				buffer.pixels = 0;

				requestAnimationFrame(function() {
					self.update(renderer);
				});
			}
		}

		return App;

	})();

	// Start the application
	var app = new App();

}).call(this);