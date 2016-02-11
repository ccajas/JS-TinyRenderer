/*! SoftwareRenderer - ver. 0.1.0 */
function drawInit(){var a=document.getElementById("render"),b=Object.create(OBJmodel);if(a.getContext){var c=a.getContext("2d"),d=drawFunc(b,c);b.load("obj/head.obj",d)}else console.error("Canvas context not supported!")}function drawFunc(a,b){return function(){var c=Object.create(Img);c.init(b),console.log("Canvas loaded");var d=0;c.clear(0),start=new Date;Math.cos(d),Math.sin(d);for(var e=0;e<a.faces.length;e++){var f=a.faces[e];a.verts[f[0]-1],a.verts[f[1]-1],a.verts[f[2]-1]}c.triangle([[20,20],[33,150],[160,160]],4294967159),end=new Date;var g="Execution took "+(end.getTime()-start.getTime())+" ms";c.flush(),document.getElementById("info").innerHTML=g,d+=.01}}var OBJmodel=new Object;OBJmodel.verts=[],OBJmodel.faces=[],OBJmodel.request=function(a){return new Promise(function(b,c){var d=new XMLHttpRequest;d.open("GET",a,!0),d.onload=function(){200==d.status?b(d.response):c(Error(d.statusText))},d.onerror=c,d.send(null)})},OBJmodel.load=function(a,b){var c=this;c.request(a).then(function(a){var d=a.split("\n");c.parse(d),b()},function(a){console.error("request failed!")})},OBJmodel.parse=function(a){for(var b=0;b<a.length;b++){if(0==a[b].indexOf("v ")){var c=a[b].split(" ").splice(1,3);this.verts.push(c)}if(0==a[b].indexOf("f ")){for(var d=a[b].split(" ").splice(1,3),e=0;3>e;e++)d[e]=d[e].split("/")[0];this.faces.push(d)}}console.log("total verts: "+this.verts.length),console.log("total faces: "+this.faces.length)};var Img=new Object;Img.ctx=null,Img.imgData=null,Img.util=null,Img.init=function(a){this.ctx=a,this.util=Object.create(Util),this.calls=0;var b=a.canvas.clientWidth;for(this.log2width=1;b>>=1;)this.log2width++;b=1<<this.log2width,this.w=a.canvas.clientWidth,this.h=a.canvas.clientHeight,this.imgData=a.createImageData(b,this.h),this.buf=new ArrayBuffer(this.imgData.data.length),this.buf8=new Uint8ClampedArray(this.buf),this.buf32=new Uint32Array(this.buf)},Img.clear=function(a){const b=this.buf32.length;for(var c=0;b>c;c++)this.buf32[c]=a+(255<<24)},Img.set=function(a,b,c){const d=(this.h-b<<this.log2width)+a;this.buf32[d]=c+(255<<24)},Img.get=function(a,b){const c=(this.h-b<<this.log2width)+a;return this.buf32[c]},Img.line=function(a,b,c,d,e){var f=!1;Math.abs(a-c)<Math.abs(b-d)&&(b=[a,a=b][0],d=[c,c=d][0],f=!0),a>c&&(c=[a,a=c][0],d=[b,b=d][0]);const g=c-a,h=d-b,i=Math.abs(h/g);for(var j=0,k=b,l=a;c>=l;l++)f?this.set(l,k,e):this.set(k,l,e),j+=i,j>.5&&(k+=d>b?1:-1,j--);this.calls+=c-a+1},Img.triangle=function(a,b){const c=this.util.findBbox(a,[this.w,this.h]);var d=[-1,-1];for(d[0]=c[0][0];d[0]<=c[1][0];d[0]++)for(d[1]=c[0][1];d[1]<=c[1][1];d[1]++){var e=this.util.barycentric(a,d);e[0]<0||e[1]<0||e[2]<0||(this.set(d[0],d[1],b),this.calls++)}},Img.flush=function(){this.imgData.data.set(this.buf8),this.ctx.putImageData(this.imgData,0,0),console.log("Pixel draw calls: "+this.calls),this.calls=0};var Util=new Object;Util.findBbox=function(a,b){for(var c=[b[0]+1,b[1]+1],d=[-1,-1],e=0;e<a.length;e++)for(var f=0;2>f;f++)c[f]=Math.min(a[e][f],c[f]),d[f]=Math.max(a[e][f],d[f]);return[c,d]},Util.cross=function(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]},Util.barycentric=function(a,b){var c=this.cross([a[2][0]-a[0][0],a[1][0]-a[0][0],a[0][0]-b[0]],[a[2][1]-a[0][1],a[1][1]-a[0][1],a[0][1]-b[1]]);return Math.abs(c[2])<1?[-1,1,1]:[1-(c[0]+c[1])/c[2],c[1]/c[2],c[0]/c[2]]};