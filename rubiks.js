import * as THREE from 'three';
import { OrbitControls } from '../../../node_modules/three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.background = new THREE.Color(0x808080);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

//cubelet section
function createCubelet(id, x, y, z, rightColor, leftColor, topColor, bottomColor, frontColor, backColor) {
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
    
    cubelet.userData.id = id; // Assigning ID to the cubelet

    cubelet.position.set(x * spacing, y * spacing, z * spacing);

    return cubelet;
}
const cubelets = [];
// black 0x000000 white 0xffffff red 0xff0000  yellow 0xFFFF00 blue 0x0000ff green 0x009b48 orange 0xffa500 grey 0x808080 
//top layer
cubelets.push(createCubelet('oyg', -1, 1, -1, 0x000000  , 0xffa500, 0xFFFF00, 0x000000, 0x000000, 0x009b48 ));
cubelets.push(createCubelet('oy', -1, 1, 0, 0x000000  , 0xffa500, 0xFFFF00, 0x000000, 0x000000, 0x000000 ));
cubelets.push(createCubelet('oyb', -1, 1, 1, 0x000000  , 0xffa500, 0xFFFF00, 0x000000, 0x0000ff, 0x000000 ));
cubelets.push(createCubelet('ryg', 1, 1, -1, 0xff0000  , 0x000000, 0xFFFF00, 0x000000, 0x000000, 0x009b48 ));
cubelets.push(createCubelet('rg', 1, 1, 0, 0xff0000  , 0x000000, 0xFFFF00, 0x000000, 0x000000, 0x000000 ));
cubelets.push(createCubelet('ryb', 1, 1, 1, 0xff0000  , 0x000000, 0xFFFF00, 0x000000, 0x0000ff, 0x000000 ));
cubelets.push(createCubelet('yg', 0, 1, -1, 0x000000  , 0x000000, 0xFFFF00, 0x000000, 0x000000, 0x009b48 ));
cubelets.push(createCubelet('y', 0, 1, 0, 0x000000  , 0x000000, 0xFFFF00, 0x000000, 0x000000, 0x000000 ));
cubelets.push(createCubelet('yb', 0, 1, 1, 0x000000  , 0x000000, 0xFFFF00, 0x000000, 0x0000ff, 0x000000 ));

//middle
cubelets.push(createCubelet('wg', -1, 0, -1, 0x000000  , 0xffa500, 0x000000, 0x000000, 0x000000, 0x009b48 ));
cubelets.push(createCubelet('w', -1, 0, 0, 0x000000  , 0xffa500, 0x000000, 0x000000, 0x000000, 0x000000 ));
cubelets.push(createCubelet('wb', -1, 0, 1, 0x000000  , 0xffa500, 0x000000, 0x000000, 0x0000ff, 0x000000 ));
cubelets.push(createCubelet('g', 0, 0, -1, 0x000000  , 0x000000, 0x000000, 0x000000, 0x000000, 0x009b48 ));
cubelets.push(createCubelet('center', 0, 0, 0, 0x000000  , 0x000000, 0x000000, 0x000000, 0x000000, 0x000000 ));
cubelets.push(createCubelet('b', 0, 0, 1, 0x000000  , 0x000000, 0x000000, 0x000000, 0x0000ff, 0x000000 ));
cubelets.push(createCubelet('yg', 1, 0, -1, 0xff0000  , 0x000000, 0x000000, 0x000000, 0x000000, 0x009b48 ));
cubelets.push(createCubelet('y', 1, 0, 0, 0xff0000  , 0x000000, 0x000000, 0x000000, 0x000000, 0x000000 ));
cubelets.push(createCubelet('yb', 1, 0, 1, 0xff0000  , 0x000000, 0x000000, 0x000000, 0x0000ff, 0x000000 ));

//bottom section
cubelets.push(createCubelet('wrg',-1, -1, -1,  0x000000  , 0xffa500, 0x000000, 0xffffff, 0x000000, 0x009b48));
cubelets.push(createCubelet('wr', -1, -1, 0, 0x000000  , 0xffa500, 0x000000, 0xffffff, 0x000000, 0x000000));
cubelets.push(createCubelet('wrb', -1, -1, 1, 0x000000  , 0xffa500, 0x000000, 0xffffff, 0x0000ff, 0x000000));
cubelets.push(createCubelet('rg', 0, -1, -1, 0x000000  , 0x000000, 0x000000, 0xffffff, 0x000000, 0x009b48 ));
cubelets.push(createCubelet('r', 0, -1, 0, 0x000000  , 0x000000, 0x000000, 0xffffff, 0x000000, 0x000000 ));
cubelets.push(createCubelet('rb', 0, -1, 1, 0x000000  , 0x000000, 0x000000, 0xffffff, 0x0000ff, 0x000000 ));
cubelets.push(createCubelet('yrg', 1, -1, -1, 0xff0000  , 0x000000, 0x000000, 0xffffff, 0x000000, 0x009b48 ));
cubelets.push(createCubelet('yr', 1, -1, 0, 0xff0000  , 0x000000, 0x000000, 0xffffff, 0x000000, 0x000000 ));
cubelets.push(createCubelet('yrb', 1, -1, 1, 0xff0000  , 0x000000, 0x000000, 0xffffff, 0x0000ff, 0x000000 ));

cubelets.forEach(cubelet => scene.add(cubelet));

    

function rotateLeft(clockwise) {
    let leftCubelets = cubelets.filter(cubelet => cubelet.position.x === -1);

    let center = new THREE.Vector3();
    leftCubelets.forEach(cubelet => {
        center.add(cubelet.position);
    });
    leftCubelets.forEach((cubelet, index) => {
    cubelet.position.sub(center);

    // Rotate
    let y = cubelet.position.y;
    let z = cubelet.position.z;
    let angle = clockwise ? -Math.PI / 2 : Math.PI / 2;
    cubelet.position.y = parseFloat((y * Math.cos(angle) - z * Math.sin(angle)).toFixed(2));
    cubelet.position.z = parseFloat((y * Math.sin(angle) + z * Math.cos(angle)).toFixed(2));

    // Rotate cubelet around its own axis
    cubelet.rotateOnAxis(new THREE.Vector3(1, 0, 0), angle);
    cubelet.position.add(center);

    console.log(`Cubelet ${index} position after left rotation:`, cubelet.position);
});
}

function rotateBottom(clockwise) {
    let bottomCubelets = cubelets.filter(cubelet => cubelet.position.y === -1);

    let center = new THREE.Vector3();
    bottomCubelets.forEach(cubelet => {
        center.add(cubelet.position);
    });
    center.divideScalar(bottomCubelets.length);

    bottomCubelets.forEach((cubelet, index) => {
        cubelet.position.sub(center);
    
        let x = cubelet.position.x;
        let z = cubelet.position.z;
        let angle = clockwise ? Math.PI / 2 : -Math.PI / 2;
        cubelet.position.x = parseFloat((x * Math.cos(angle) - z * Math.sin(angle)).toFixed(2));
        cubelet.position.z = parseFloat((x * Math.sin(angle) + z * Math.cos(angle)).toFixed(2));
    
        cubelet.rotateOnAxis(new THREE.Vector3(0, -1, 0), angle);
            cubelet.position.add(center);
    
        console.log(`Cubelet ${index} position after bottom rotation:`, cubelet.position);
    });
}

//Button section
const rotateLeftButton = document.getElementById('rotateLeftButton');
rotateLeftButton.addEventListener('click', () => {
    rotateLeft(true);
});

const rotateLeftcounter = document.getElementById('rotateLeftcounter');
rotateLeftcounter.addEventListener('click', () => {
    rotateLeft(false);
});

const rotateRightButton = document.getElementById('rotateRightButton');
rotateRightButton.addEventListener('click', () => {
    rotateRight(true);
});

const rotateBottomButton = document.getElementById('rotateBottomButton');
rotateBottomButton.addEventListener('click', () => {
    rotateBottom(true);
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
    //console.log('All cubelets positions:', cubelets.map(cubelet => cubelet.position))
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();