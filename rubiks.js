
import * as THREE from 'three';
import { OrbitControls } from '../../../node_modules/three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

//cubelet section
function createCubelet(x, y, z, rightColor, leftColor, topColor, bottomColor, frontColor, backColor) {
    const spacing = 1.0; 
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

    cubelet.position.set(x * spacing, y * spacing, z * spacing);

    return cubelet;
}
const cubelets = [];
// black 0x000000 white 0xffffff red 0xff0000  yellow 0xFFFF00 blue 0x0000ff green 0x009b48 orange 0xffa500 
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

//grouping
const LeftGroup = new THREE.Group();
const backFaceGroup = new THREE.Group();

cubelets.forEach(cubelet => {
    const { x, y, z } = cubelet.position;
    if (z === -1) {
        LeftGroup.add(cubelet); 
    } else if (x === 1) {
        backFaceGroup.add(cubelet); 
    }
});


scene.add(LeftGroup);
scene.add(backFaceGroup);




//rotation section
function rotateLeft(clockwise) {
    const angle = clockwise ? Math.PI / 2 : -Math.PI / 2;
    LeftGroup.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), angle);
}

const rotateLeftButton = document.getElementById('rotateLeftButton');
rotateLeftButton.addEventListener('click', () => {
    console.log('Button clicked.');
    rotateLeft(true);
});

const rotateLeftcounter = document.getElementById('rotateLeftcounter');
rotateLeftcounter.addEventListener('click', () => {
    console.log('Button clicked.');
    rotateLeft(false);
});

//Camera section
camera.position.z = 10;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableDamping = true;

controls.target.set(0, 0, 0);

renderer.domElement.addEventListener('contextmenu', function (event) {
    event.preventDefault();
}, false);


function animate() {
    //console.log('All cubelets positions:', cubelets.map(cubelet => cubelet.position));
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();