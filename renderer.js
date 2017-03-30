/*! JS-TinyRenderer - ver. 0.1.0 */
Model=function(){function a(){this.verts=[],this.faces=[],this.normals=[],this.texcoords=[]}return a.parseOBJ=function(a,b){for(var c=function(b){return a[b].split(" ").splice(1,3)},d=0;d<a.length;d++){var e=a[d].substr(0,2),f="v "==e?b.verts:"vn"==e?b.normals:"vt"==e?b.texcoords:null;f&&f.push(new f32a(c(d)))}for(var d=0;d<a.length;d++)if("f "==a[d].substr(0,2)){for(idx=c(d),j=0;j<3;j++)idx[j]=idx[j].split("/").map(function(a){return parseInt(a-1)});b.faces.push(idx)}},a.prototype={vert:function(a,b){var c=model.faces[a],d=model.verts[c[b][0]],e=model.texcoords.length>0?model.texcoords[c[b][1]]:[0,0],f=model.normals.length>0?model.normals[c[b][2]]:[1,0,0];return[d,e,f]}},a}(),Matrix=function(){function a(){}return a.identity=function(){return[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]},a.mul=function(a,b){var c=[];if(!Array.isArray(b[0])){var d=[a[0][0]*b[0]+a[0][1]*b[1]+a[0][2]*b[2]+a[0][3]*b[3],a[1][0]*b[0]+a[1][1]*b[1]+a[1][2]*b[2]+a[1][3]*b[3],a[2][0]*b[0]+a[2][1]*b[1]+a[2][2]*b[2]+a[2][3]*b[3]];return d}for(var e=0;4>e;e++)c[e]=[Vec4.dot(a[e],[b[0][0],b[1][0],b[2][0],b[3][0]]),Vec4.dot(a[e],[b[0][1],b[1][1],b[2][1],b[3][1]]),Vec4.dot(a[e],[b[0][2],b[1][2],b[2][2],b[3][2]]),Vec4.dot(a[e],[b[0][3],b[1][3],b[2][3],b[3][3]])];return c},a.scale=function(a,b,c){return[[a,0,0,0],[0,b,0,0],[0,0,c,0],[0,0,0,1]]},a.rotation=function(a){var b=a[0],c=a[1],d=a[2],e=a[3];return[[1-2*c*c-2*d*d,2*b*c+2*d*e,2*b*d-2*c*e,0],[2*b*c-2*d*e,1-2*b*b-2*d*d,2*d*c+2*b*e,0],[2*b*d+2*c*e,2*d*c-2*b*e,1-2*b*b-2*c*c,0],[0,0,0,1]]},a.view=function(b,c,d){for(var e=Vec3.normalize([b[0]-c[0],b[1]-c[1],b[2]-c[2]]),f=Vec3.normalize(Vec3.cross(d,e)),d=Vec3.normalize(Vec3.cross(e,f)),g=a.identity(),h=0;3>h;h++)g[0][h]=f[h],g[1][h]=d[h],g[2][h]=e[h];return g[3][0]=-Vec3.dot(f,b),g[3][1]=-Vec3.dot(d,b),g[3][2]=-Vec3.dot(e,b),g},a}(),Quaternion=function(){function a(){}return a.fromEuler=function(a,b,c){var d,e,f,g,h,i;return g=m.sin(.5*a),d=m.cos(.5*a),h=m.sin(.5*b),e=m.cos(.5*b),i=m.sin(.5*c),f=m.cos(.5*c),[d*e*f+g*h*i,g*e*f-d*h*i,d*h*f+g*e*i,d*e*i-g*h*f]},a.fromAxisAngle=function(a,b,c,d){var e=m.sin(d/2);return[a*e,b*e,c*e,m.cos(d/2)]},a}(),Vec3=function(){function a(){}return a.dot=function(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]},a.cross=function(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]},a.reflect=function(b,c){var d=a.dot(b,c),e=[2*c[0]*d,2*c[1]*d,2*c[2]*d];return[e[0]-b[0],e[1]-b[1],e[2]-b[2]]},a.dist=function(a){for(var b=0,c=0;c<a.length;c++)b+=a[c]*a[c];return m.sqrt(b)},a.normalize=function(b){var c=1/a.dist(b);return[b[0]*c,b[1]*c,b[2]*c]},a}(),Vec4=function(){function a(){}return a.dot=function(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3]},a}(),orient2d=function(a,b,c){return(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])},max_elevation_angle=function(a,b,c,d,e,f){for(var g=0,h=0;f/30>h;h+=f/360){var i=[c[0]+e[0]*h,c[1]+e[1]*h];if(i[0]>=d[0]||i[1]>=d[1]||i[0]<0||i[1]<0)return g;var j=Vec3.dist([c[0]-i[0],c[1]-i[1]]);if(!(1>j)){var k=(i[1]|0)*f+(i[0]|0),l=.005*(a[k]-a[b]);g=m.max(g,l/j)}}return g},Buffer=function(){function a(a,b,c){this.ctx=a,this.w=b,this.h=c,this.calls=0,this.pixels=0,this.imgData=a.createImageData(this.w,this.h),this.buf=new ArrayBuffer(this.imgData.data.length),this.buf8=new Uint8ClampedArray(this.buf),this.buf32=new Uint32Array(this.buf),this.zbuf=new Uint32Array(this.imgData.data.length)}return a.prototype={clear:function(a){for(var b=0;b<=this.h;b++)for(var c=0;c<this.w;c++){var d=b*this.w+c;this.set(c,b,a),this.zbuf[d]=0}},set:function(a,b,c){var d=255&c[0]|(255&c[1])<<8|(255&c[2])<<16;this.buf32[b*this.w+a]=4278190080|d},get:function(a,b){return this.buf32[b*this.w+a]},drawTriangle:function(a,b){for(var c=[a[0][0],a[1][0],a[2][0]],d=[a[0][1],a[1][1],a[2][1]],e=[a[0][2],a[1][2],a[2][2]],f=[this.w+1,this.h+1],g=[-1,-1],h=0;h<c.length;h++)for(var i=0;2>i;i++)f[i]=m.min(c[h][i],f[i]),g[i]=m.max(c[h][i],g[i]);if(!(f[0]>this.w||g[0]<0||f[1]>this.h||g[1]<0)){f[0]<0&&(f[0]=0),g[0]>this.w&&(g[0]=this.w);for(var j,k,l,n,o=[],p=[],q=c[0][1]-c[1][1],r=c[1][0]-c[0][0],s=c[1][1]-c[2][1],t=c[2][0]-c[1][0],u=c[2][1]-c[0][1],v=c[0][0]-c[2][0],w=c[1][1]-c[0][1],x=c[2][1]-c[1][1],y=1/(r*x-t*w),z=orient2d(c[1],c[2],f),A=orient2d(c[2],c[0],f),B=orient2d(c[0],c[1],f),C=[0,0,0],D=f[1];D<=g[1];D++){for(var E=[z,A,B],F=f[0];F<=g[0];F++){if(this.pixels++,(E[0]|E[1]|E[2])>0){p[0]=E[0]*y,p[1]=E[1]*y,p[2]=E[2]*y;for(var h=0,n=0;3>h;h++)n+=c[h][2]*p[h];var G=D*this.w+F;if(this.zbuf[G]<n){var j,k,l;o[0]=p[0]*d[0][0]+p[1]*d[1][0]+p[2]*d[2][0],o[1]=p[0]*d[0][1]+p[1]*d[1][1]+p[2]*d[2][1],j=p[0]*e[0][0]+p[1]*e[1][0]+p[2]*e[2][0],k=p[0]*e[0][1]+p[1]*e[1][1]+p[2]*e[2][1],l=p[0]*e[0][2]+p[1]*e[1][2]+p[2]*e[2][2];var H=b.fragment([o,[j,k,l],a[0][3]],C);if(!H){this.zbuf[G]=n,this.set(F,D,C),this.calls++}}}E[0]+=s,E[1]+=u,E[2]+=q}z+=t,A+=v,B+=r}}},draw:function(){this.imgData.data.set(this.buf8),this.ctx.putImageData(this.imgData,0,0)},postProc:function(){for(var c=[],d=0;d<2*m.PI-1e-4;d+=m.PI/(9))c.push([m.sin(d),m.cos(d)]);for(var a=0;a<this.h;a++)for(var b=0;b<this.w;b++){/*for var c=[]*/var e=a*this.w+b;if(!(this.zbuf[e]<1e-5)){for(var f=0,g=0;g<c.length;g++)f+=m.PI*0.5-m.atan(max_elevation_angle(this.zbuf,e,[b,a],[this.w,this.h],c[g],this.w));f/=m.PI*0.5*c.length,f*=1.05,f>1&&(f=1);var h=this.get(b,a);/*16777215*/var i=(255&h)*f,j=(h>>8&255)*f,k=(h>>16&255)*f;this.set(b,a,[i,j,k]),this.calls++}}}},a}(),Effect=function(){function a(){}return a.prototype={vertex:function(a){},fragment:function(a,b){},setParameters:function(a){var b=this;Object.keys(a).map(function(c){b[c]=a[c]})}},a}(),Texture=function(){function a(a,b){this.source=a,this.texData=b,this.sample=function(a,b){var c=4*((this.texData.height-m.ceil(b[1]*this.texData.height))*this.texData.width+m.ceil(b[0]*this.texData.width));return[this.texData.data[c],this.texData.data[c+1],this.texData.data[c+2],this.texData.data[c+3]]}}return a.load=function(b){texCanvas=document.createElement("canvas"),ctx=texCanvas.getContext("2d"),texCanvas.width=b.width,texCanvas.height=b.height,ctx.drawImage(b,0,0),b.style.display="none";var c=ctx.getImageData(0,0,b.width,b.height);return new a(b.src,c)},a}(),function(){m=Math,doc=document,f32a=Float32Array,f64a=Float64Array,Renderer=function(){function a(){}return true,a.prototype={setEffect:function(a){this.effect=a},drawGeometry:function(a){for(var b=0;b<model.faces.length;b++){for(var c=[],d=0;3>d;d++)c.push(effect.vertex(model.vert(b,d)));a.drawTriangle(c,effect)}}},a}()}();