import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TextureLoader } from 'three';

window.Webflow ||= [];
window.Webflow.push(() => {
  init3D();
});

function init3D() {
  const viewport = document.querySelector('[data-id="diver"]');

  //renderer
  const renderer = new THREE.WebGLRenderer( { alpha: true } );

  renderer.setSize(viewport.clientWidth, viewport.clientHeight);
  renderer.setClearColor( 0x000000, 0 );
  viewport.appendChild(renderer.domElement);

  //camera
  const camera = new THREE.PerspectiveCamera(
    75, //fov
    viewport.clientWidth / viewport.clientHeight, //aspect ratio
    0.1, // near
    100 // far
  );

  //controls
  const controls = new OrbitControls( camera, renderer.domElement );
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  camera.position.z = 10;

  //scene
  const scene = new THREE.Scene();

  //rendering
  let clock = new THREE.Clock();
  let mixer = null;

  function animate() {
    requestAnimationFrame(animate); //calls one every 60th of a second
    controls.update();

    if (mixer !== null) {
      mixer.update(clock.getDelta());
    }

    renderer.render(scene, camera);
  }

  animate();

  // -- load 3d async
  const assets = load();
  assets.then((data) => {
    const diver = data.diver.scene;
    const animations = data.diver.animations;

    diver.traverse((child) =>{
      if (child.isMesh) {
        child.material = new THREE.MeshBasicMaterial();
        child.material.map = data.texture;
      }
    });
    
    mixer = new THREE.AnimationMixer(diver);
    const action = mixer.clipAction(animations[0]);
    action.play();

    diver.position.y = -3;
    scene.add(diver);
  });
}

/* Loader Function */
async function load() {
  const diver = await loadModel(
    'https://uploads-ssl.webflow.com/645df11dd579216c12c55566/64b41bcf676a8a5eb648eef3_datdigital-diver.glb.txt'
  );

  const texture = await loadTexture(
    'https://uploads-ssl.webflow.com/645df11dd579216c12c55566/64b142dadee67f20f060a62a_Diffuse_taucher.jpg'
  );

  return { diver, texture };
}

const textureLoader = new TextureLoader();
const modelLoader = new GLTFLoader();

function loadTexture(url) {
  return new Promise((resolve) => {
    textureLoader.load(url, (data) => {
      data.needsUpdate = true;
      data.flipY = false;
      resolve(data);
    });
  });
}

function loadModel(url, id) {
  return new Promise((resolve, reject) => {
    modelLoader.load(url, (gltf) => {
      const scene = gltf.scene;
      const animations = gltf.animations;
      resolve({scene, animations});
    });
  });
}