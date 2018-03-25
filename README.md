# JS TinyRenderer
A small software renderer written in JavaScript.

![Screen-Space Ambient Occlusion rendering](http://ccajas.github.io/JS-TinyRenderer/jstr-sample.png)

This renderer is based off Dmitry's [TinyRenderer](https://github.com/ssloy/tinyrenderer), using the same concepts and goal of keeping 
the application small while still retaining the core features of a software renderer. Currently fits in less than 8k of code! I'll try to keep it small. For technical info on how it's implemented, see [Scratchapixel's article on rasterization](https://www.scratchapixel.com/lessons/3d-basic-rendering/rasterization-practical-implementation/rasterization-stage). 

## Current Features

* Triangle drawing with scanline algorithm
* 3D transformations and Z-buffer
* Custom shader support with external scripts
* Loading different content types (models, textures, shaders)
* Screen-space effects (SSAO included as an example)

## Implementation

### Renderer
 * Programmable pipeline using Effect objects with vertex and fragment operations
   * Effect parameters are mapped from object keys
 * Math library with common vector, matrix, and quaternion operations 
 * Triangle rasterization algorithm
   * Edge function for testing points that lie inside a triangle
    * Barycentric coordinates for texel, depth and color interpolation
    * Z-buffer for depth checking
 * Float32 typed array for storing model coordinates provides faster performance
 * Uint8 and Uint32 arrays for framebuffer storage
 * OBJ model parser that supports vertex, texture, and normal coordinates
 * Texture loader and nearest-neighbor sampler using an "off-screen" Canvas image
### Boilerplate code
 * Mouse functions for rotating model
 * Content manager
   * Asynchronous loading for content
   * Currying as a generic loader for various types eg. `content.load('type')('path_to_content','handle')`

## Overview

JS TinyRenderer emulates the basic steps of a hardware renderer, by reading geometric data from an array source, transforming triangle vertices to screen space, and rasterization of those triangles. It does this using the HTML5 Canvas element to represent the backbuffer, using only the ImageData interface and pixel setting/getting functions to render an image. No built-in Canvas functions for drawing lines or shapes are used. Of course, WebGL is not used either.

As this is a software renderer, the entire application is CPU bound, but there is a lot of potential to add more features. It is currently a single threaded application, and might be difficult to add multithreading support due to the language, but it's something I would still consider.

### Todo
* Render to Texture
* Perspective view camera
* Anti-aliasing using edge detection
* Support multiple materials

## Installing

[Grunt](http://gruntjs.com/getting-started) is required to build the application.
The Package.json and Gruntfile already provide the build setup. Just run these commands in the repo folder:

```
npm install grunt --save-dev
npm install grunt-contrib-watch --save-dev
npm install grunt-contrib-uglify --save-dev
```

Run `grunt watch` to start watching the changes in the source code, which will bundle the files and `uglify` the code when a file is saved.
