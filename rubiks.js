
import * as THREE from 'three';
import { OrbitControls } from '../../../node_modules/three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);


function createCubelet(x, y, z, rightColor, leftColor, topColor, bottomColor, frontColor, backColor) {
    const spacing = 1.8; 
    const cubeSize = 0.9; 

    const materials = [
        new THREE.MeshStandardMaterial({ color: rightColor }), // Right side
        new THREE.MeshStandardMaterial({ color: leftColor }), // Left side
        new THREE.MeshStandardMaterial({ color: topColor }), // Top side
        new THREE.MeshStandardMaterial({ color: bottomColor }), // Bottom side
        new THREE.MeshStandardMaterial({ color: frontColor }), // Front side
        new THREE.MeshStandardMaterial({ color: backColor }) // Back side
    ];

    const cubeletGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const cubelet = new THREE.Mesh(cubeletGeometry, materials);

    // Adjust the position of the cubelet
    cubelet.position.set(x * spacing, y * spacing, z * spacing);

    return cubelet;
}
const cubelets = [];
// czarny 0x000000 biały 0xffffff czerwony 0xff0000  żółty 0xFFFF00 niebieski 0x0000ff zielony 0x009b48 pomarancz 0xffa500 
cubelets.push(createCubelet(-1, -1, -1,  0x000000  , 0xffffff, 0x000000, 0xff0000, 0x000000, 0x009b48));
cubelets.push(createCubelet(-1, -1, 0, 0x000000  , 0xffffff, 0x000000, 0xff0000, 0x000000, 0x000000));
cubelets.push(createCubelet(-1, -1, 1, 0x000000  , 0xffffff, 0x000000, 0xff0000, 0x0000ff, 0x000000));
cubelets.push(createCubelet(-1, 0, -1, 0x000000  , 0xffffff, 0x000000, 0x000000, 0x000000, 0x009b48 ));
cubelets.push(createCubelet(-1, 0, 0, 0x000000  , 0xffffff, 0x000000, 0x000000, 0x000000, 0x000000 ));
cubelets.push(createCubelet(-1, 0, 1, 0x000000  , 0xffffff, 0x000000, 0x000000, 0x0000ff, 0x000000 ));
cubelets.push(createCubelet(-1, 1, -1, 0x000000  , 0xffffff, 0xffa500, 0x000000, 0x000000, 0x009b48 ));
cubelets.push(createCubelet(-1, 1, 0, 0x000000  , 0xffffff, 0xffa500, 0x000000, 0x000000, 0x000000 ));
cubelets.push(createCubelet(-1, 1, 1, 0x000000  , 0xffffff, 0xffa500, 0x000000, 0x0000ff, 0x000000 ));
cubelets.push(createCubelet(0, -1, -1, 0x000000  , 0x000000, 0x000000, 0xff0000, 0x000000, 0x009b48 ));
cubelets.push(createCubelet(0, -1, 0, 0x000000  , 0x000000, 0x000000, 0xff0000, 0x000000, 0x000000 ));
cubelets.push(createCubelet(0, -1, 1, 0x000000  , 0x000000, 0x000000, 0xff0000, 0x0000ff, 0x000000 ));
cubelets.push(createCubelet(0, 0, -1, 0x000000  , 0x000000, 0x000000, 0x000000, 0x000000, 0x009b48 ));
cubelets.push(createCubelet(0, 0, 0, 0x000000  , 0x000000, 0x000000, 0x000000, 0x000000, 0x000000 ));
cubelets.push(createCubelet(0, 0, 1, 0x000000  , 0x000000, 0x000000, 0x000000, 0x0000ff, 0x000000 ));
cubelets.push(createCubelet(0, 1, -1, 0x000000  , 0x000000, 0xffa500, 0x000000, 0x000000, 0x009b48 ));
cubelets.push(createCubelet(0, 1, 0, 0x000000  , 0x000000, 0xffa500, 0x000000, 0x000000, 0x000000 ));
cubelets.push(createCubelet(0, 1, 1, 0x000000  , 0x000000, 0xffa500, 0x000000, 0x0000ff, 0x000000 ));
cubelets.push(createCubelet(1, -1, -1, 0xFFFF00  , 0x000000, 0x000000, 0xff0000, 0x000000, 0x009b48 ));
cubelets.push(createCubelet(1, -1, 0, 0xFFFF00  , 0x000000, 0x000000, 0xff0000, 0x000000, 0x000000 ));
cubelets.push(createCubelet(1, -1, 1, 0xFFFF00  , 0x000000, 0x000000, 0xff0000, 0x0000ff, 0x000000 ));
cubelets.push(createCubelet(1, 0, -1, 0xFFFF00  , 0x000000, 0x000000, 0x000000, 0x000000, 0x009b48 ));
cubelets.push(createCubelet(1, 0, 0, 0xFFFF00  , 0x000000, 0x000000, 0x000000, 0x000000, 0x000000 ));
cubelets.push(createCubelet(1, 0, 1, 0xFFFF00  , 0x000000, 0x000000, 0x000000, 0x0000ff, 0x000000 ));
cubelets.push(createCubelet(1, 1, -1, 0xFFFF00  , 0x000000, 0xffa500, 0x000000, 0x000000, 0x009b48 ));
cubelets.push(createCubelet(1, 1, 0, 0xFFFF00  , 0x000000, 0xffa500, 0x000000, 0x000000, 0x000000 ));
cubelets.push(createCubelet(1, 1, 1, 0xFFFF00  , 0x000000, 0xffa500, 0x000000, 0x0000ff, 0x000000 ));

cubelets.forEach(cubelet => scene.add(cubelet));








camera.position.z = 10;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableDamping = true;

controls.target.set(0, 0, 0);

renderer.domElement.addEventListener('contextmenu', function (event) {
    event.preventDefault();
}, false);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();