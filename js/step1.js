import * as THREE from "three";
import imagesLoaded from "imagesLoaded";
import EffectComposer, {
    RenderPass,
    ShaderPass,
} from '@johh/three-effectcomposer';
const createInputEvents = require('simple-input-events');


class Animation {
  constructor(img) {
    //console.log(img);
    this.camera;
    this.renderer;
    this.composer;
    this.renderPass;
    this.customPass;
    this.texture = new THREE.Vector2(0,0);
    this.geometry = new THREE.Vector2(0,0);
    this.material = new THREE.Vector2(0,0);
    this.mesh = new THREE.Vector2(0,0);
    this.event = createInputEvents(window);
    
    this.uMouse = new THREE.Vector2(0,0);
    this.img = img;
    this.paused = true;
    var that = this;
    //console.log(this.texture);
      
      img.style.opacity = 0;
      this.init();
      this.setupResize();
      this.getMousePos();
      this.play();
      this.stop();
      this.animate();
      //requestAnimationFrame(() => this.animate());
    
  }
  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.renderer.setSize(this.img.width, this.img.height);
    this.camera.updateProjectionMatrix();
    this.getMousePos();
  }
  stop() {
    this.img.addEventListener('mouseleave', (event) => {
      this.uMouse.y = -100;
      this.uMouse.y = -100;
      this.getMousePos();
      
    });
    
  }

  play() {
    this.paused = false;
  }
  getMousePos(){
    var rect = this.img.getBoundingClientRect();
    console.log(rect.top, rect.right, rect.bottom, rect.left);
    ///console.log(wrapper_div.offsetHeight);
    let that = this;

    this.img.addEventListener('mousemove', (event) => {
     // console.log(event.clientX);
        that.paused= false;
        var screenwidthhalf = window.innerWidth/2;

        if (rect.left < screenwidthhalf) {
          console.log('left');
          that.uMouse.x = event.clientX / window.innerWidth *2;
          that.uMouse.y = 1 - event.clientY / window.innerHeight;
        } else {
          console.log('right');
          that.uMouse.x = event.clientX / window.innerWidth * 2 - 1;
          that.uMouse.y = -(event.clientY / window.innerHeight)  + 1;
        }
      
        console.log(that.uMouse);
     });
    
       
      this.uMouse = that.uMouse;
    
  }
  init() {
    
    this.camera = new THREE.PerspectiveCamera( 70, this.img.width / this.img.height, 0.1, 10 );
    this.camera.position.z = .7;
     this.texture = new THREE.TextureLoader().load( this.img.src );
     this.material = new THREE.MeshBasicMaterial({
      map: this.texture
    });
    this.scene = new THREE.Scene();
    this.geometry = new THREE.PlaneBufferGeometry(1, 1);
    
    this.mesh = new THREE.Mesh( this.geometry, this.material );
    this.scene.add( this.mesh );
    
    this.renderer = new THREE.WebGLRenderer( { 
      antialias: true,
      alpha: true 
    } );
    //console.log(this.img);
    this.renderer.setSize( this.img.width, this.img.height );
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    //document.body.appendChild( renderer.domElement );
    this.img.parentNode.appendChild( this.renderer.domElement );

    // post processing
    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    var myEffect = {
      uniforms: {
        "tDiffuse": { value: null },
        "resolution": { value: new THREE.Vector2(1.,this.img.height/this.img.width) },
        "uMouse": { value: new THREE.Vector2(-100,-100) },
        "uVelo": { value: 0 },
      },
      vertexShader: `varying vec2 vUv;void main() {vUv = uv;gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );}`,
      fragmentShader: `uniform float time;
      uniform sampler2D tDiffuse;
      uniform vec2 resolution;
      varying vec2 vUv;
      uniform vec2 uMouse;
      float circle(vec2 uv, vec2 disc_center, float disc_radius, float border_size) {
        uv -= disc_center;
        uv*=resolution;
        float dist = sqrt(dot(uv, uv));
        return smoothstep(disc_radius+border_size, disc_radius-border_size, dist);
      }
      void main()  {
          vec2 newUV = vUv;
          float c = circle(vUv, uMouse, 0.0, 0.4);
          float r = texture2D(tDiffuse, newUV.xy += c * (0.1 * .5)).x;
          float g = texture2D(tDiffuse, newUV.xy += c * (0.1 * .525)).y;
          float b = texture2D(tDiffuse, newUV.xy += c * (0.1 * .55)).z;
          vec4 color = vec4(r, g, b, 1.);

          gl_FragColor = color;
      }`
    }

    this.customPass = new ShaderPass(myEffect);
    this.customPass.renderToScreen = true;
    this.composer.addPass(this.customPass);

  }
  animate() {
    
      requestAnimationFrame(() => this.animate());
    this.customPass.uniforms.uMouse.value = this.uMouse;
    //this.renderer.render( this.scene, this.camera );

    
    if(this.composer) this.composer.render()

  }
}

// Preload images
var IMAGES;
var preloadImages = new Promise((resolve, reject) => {
  imagesLoaded(document.querySelectorAll("img"), { background: true }, resolve);
});

preloadImages.then(images => {
  IMAGES = images.images;
});

const preloadEverything = [preloadImages];

// And then..
Promise.all(preloadEverything).then(() => {
    var  ani_images = document.querySelectorAll(".animated-img");
    //console.log(images);
      for (var i = 0; i < ani_images.length; i++) {
        new Animation(ani_images[i]);

      }

});
