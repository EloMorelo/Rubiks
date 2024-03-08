
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
// black 0x000000 white 0xffffff red 0xff0000  yellow 0xFFFF00 blue 0x0000ff green 0x009b48 orange 0xffa500 
cubelets.push(createCubelet('wrg',-1, -1, -1,  0x000000  , 0xffffff, 0x000000, 0xff0000, 0x000000, 0x009b48));
cubelets.push(createCubelet('wr', -1, -1, 0, 0x000000  , 0xffffff, 0x000000, 0xff0000, 0x000000, 0x000000));
cubelets.push(createCubelet('wrb', -1, -1, 1, 0x000000  , 0xffffff, 0x000000, 0xff0000, 0x0000ff, 0x000000));
cubelets.push(createCubelet('wg', -1, 0, -1, 0x000000  , 0xffffff, 0x000000, 0x000000, 0x000000, 0x009b48 ));
cubelets.push(createCubelet('w', -1, 0, 0, 0x000000  , 0xffffff, 0x000000, 0x000000, 0x000000, 0x000000 ));
cubelets.push(createCubelet('wb', -1, 0, 1, 0x000000  , 0xffffff, 0x000000, 0x000000, 0x0000ff, 0x000000 ));
cubelets.push(createCubelet('wog', -1, 1, -1, 0x000000  , 0xffffff, 0xffa500, 0x000000, 0x000000, 0x009b48 ));
cubelets.push(createCubelet('wo', -1, 1, 0, 0x000000  , 0xffffff, 0xffa500, 0x000000, 0x000000, 0x000000 ));
cubelets.push(createCubelet('wob', -1, 1, 1, 0x000000  , 0xffffff, 0xffa500, 0x000000, 0x0000ff, 0x000000 ));
cubelets.push(createCubelet('rg', 0, -1, -1, 0x000000  , 0x000000, 0x000000, 0xff0000, 0x000000, 0x009b48 ));
cubelets.push(createCubelet('r', 0, -1, 0, 0x000000  , 0x000000, 0x000000, 0xff0000, 0x000000, 0x000000 ));
cubelets.push(createCubelet('rb', 0, -1, 1, 0x000000  , 0x000000, 0x000000, 0xff0000, 0x0000ff, 0x000000 ));
cubelets.push(createCubelet('g', 0, 0, -1, 0x000000  , 0x000000, 0x000000, 0x000000, 0x000000, 0x009b48 ));
cubelets.push(createCubelet('center', 0, 0, 0, 0x000000  , 0x000000, 0x000000, 0x000000, 0x000000, 0x000000 ));
cubelets.push(createCubelet('b', 0, 0, 1, 0x000000  , 0x000000, 0x000000, 0x000000, 0x0000ff, 0x000000 ));
cubelets.push(createCubelet('og', 0, 1, -1, 0x000000  , 0x000000, 0xffa500, 0x000000, 0x000000, 0x009b48 ));
cubelets.push(createCubelet('o', 0, 1, 0, 0x000000  , 0x000000, 0xffa500, 0x000000, 0x000000, 0x000000 ));
cubelets.push(createCubelet('ob', 0, 1, 1, 0x000000  , 0x000000, 0xffa500, 0x000000, 0x0000ff, 0x000000 ));
cubelets.push(createCubelet('yrg', 1, -1, -1, 0xFFFF00  , 0x000000, 0x000000, 0xff0000, 0x000000, 0x009b48 ));
cubelets.push(createCubelet('yr', 1, -1, 0, 0xFFFF00  , 0x000000, 0x000000, 0xff0000, 0x000000, 0x000000 ));
cubelets.push(createCubelet('yrb', 1, -1, 1, 0xFFFF00  , 0x000000, 0x000000, 0xff0000, 0x0000ff, 0x000000 ));
cubelets.push(createCubelet('yg', 1, 0, -1, 0xFFFF00  , 0x000000, 0x000000, 0x000000, 0x000000, 0x009b48 ));
cubelets.push(createCubelet('y', 1, 0, 0, 0xFFFF00  , 0x000000, 0x000000, 0x000000, 0x000000, 0x000000 ));
cubelets.push(createCubelet('yb', 1, 0, 1, 0xFFFF00  , 0x000000, 0x000000, 0x000000, 0x0000ff, 0x000000 ));
cubelets.push(createCubelet('yog', 1, 1, -1, 0xFFFF00  , 0x000000, 0xffa500, 0x000000, 0x000000, 0x009b48 ));
cubelets.push(createCubelet('yo', 1, 1, 0, 0xFFFF00  , 0x000000, 0xffa500, 0x000000, 0x000000, 0x000000 ));
cubelets.push(createCubelet('yob', 1, 1, 1, 0xFFFF00  , 0x000000, 0xffa500, 0x000000, 0x0000ff, 0x000000 ));

cubelets.forEach(cubelet => scene.add(cubelet));

//grouping
const LeftGroup = new THREE.Group();
const RightGroup = new THREE.Group();
const TopGroup = new THREE.Group();
const BottomGroup = new THREE.Group();

/*cubelets.forEach(cubelet => {
    const { x, y, z } = cubelet.position;
    if (y === -1) {
        BottomGroup.add(cubelet);
    } if (z === -1) {
        LeftGroup.add(cubelet);
    }if (z === 1) {
        RightGroup.add(cubelet);
    }
}); */
function bot()
{
    cubelets.forEach(cubelet => {
        const { x, y, z } = cubelet.position;
        if (y === -1) {
            BottomGroup.add(cubelet);
        }
    });
    scene.add(BottomGroup);

}
function right()
{
    cubelets.forEach(cubelet => {
        const { x, y, z } = cubelet.position;
        if (z === 1) {
            RightGroup.add(cubelet);
        }
    });
    scene.add(RightGroup);
}
function left()
{
    cubelets.forEach(cubelet => {
        const { x, y, z } = cubelet.position;
        if (z === -1) {
            LeftGroup.add(cubelet);
        }
    });
    scene.add(LeftGroup);
}

//scene.add(TopGroup);
//rotation section



function rotateLeft(clockwise) {
    left(); // Przygotowanie grupy
    const angle = clockwise ? Math.PI / 2 : -Math.PI / 2;
    LeftGroup.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), angle);
}


function rotateRight(clockwise) {
    right();
    const angle = clockwise ? Math.PI / 2 : -Math.PI / 2;
    RightGroup.rotateOnWorldAxis(new THREE.Vector3(0, 0, -1), angle);
    console.log(RightGroup.children.map(c => c.position));

}
function rotateBottom(clockwise) {
    bot();
    console.log(BottomGroup.children.map(c => c.position));
    const angle = clockwise ? Math.PI / 2 : -Math.PI / 2;
    BottomGroup.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), angle);
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