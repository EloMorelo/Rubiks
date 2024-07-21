import * as THREE from 'three';
import { OrbitControls } from '../../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { pushCubelets } from './Cube.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.background = new THREE.Color(0x808080);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const cubelets = pushCubelets();
cubelets.forEach(cubelet => scene.add(cubelet));


function rotateWall(wall, clockwise) {
    let cubeletsInWall;
    let axis, angle;

    switch(wall) {
        case 'left':
            cubeletsInWall = cubelets.filter(cubelet => cubelet.position.x === -1);
            axis = new THREE.Vector3(1, 0, 0); 
            break;
        case 'right':
            cubeletsInWall = cubelets.filter(cubelet => cubelet.position.x === 1);
            axis = new THREE.Vector3(-1, 0, 0);
            break;
        case 'top':
            cubeletsInWall = cubelets.filter(cubelet => cubelet.position.y === 1);
            axis = new THREE.Vector3(0, -1, 0);
            break;
        case 'bottom':
            cubeletsInWall = cubelets.filter(cubelet => cubelet.position.y === -1);
            axis = new THREE.Vector3(0, 1, 0); 
            break;
        case 'front':
            cubeletsInWall = cubelets.filter(cubelet => cubelet.position.z === 1);
            axis = new THREE.Vector3(0, 0, -1); 
            break;
        case 'back':
            cubeletsInWall = cubelets.filter(cubelet => cubelet.position.z === -1);
            axis = new THREE.Vector3(0, 0, 1); 
            break;
        default:
            console.error('Invalid wall specified');
            return;
    }

    angle = clockwise ? Math.PI / 2 : -Math.PI / 2;
    let tempGroup = new THREE.Group();
    scene.add(tempGroup);
    
    cubeletsInWall.forEach(cubelet => {
        tempGroup.attach(cubelet);
    });
    //console.log('Initial positions:', cubeletsInWall.map(cubelet => cubelet.position.clone()));

    let tween = new TWEEN.Tween({ kat: 0 })
        .to({ kat: angle }, 100)
        .onUpdate(({ kat }) => {
            tempGroup.setRotationFromAxisAngle(axis, kat);
        })
        .onComplete(() => {
            cubeletsInWall.forEach(cubelet => {
                scene.attach(cubelet);
                cubelet.position.x = Math.round(cubelet.position.x);
                cubelet.position.y = Math.round(cubelet.position.y);
                cubelet.position.z = Math.round(cubelet.position.z);
                cubelet.updateMatrixWorld();
            });
            scene.remove(tempGroup);
            //console.log('Final positions:', cubeletsInWall.map(cubelet => cubelet.position.clone()));   
        })
        .start();
}





//Button section
const rotateLeftButton = document.getElementById('rotateLeftButton');
rotateLeftButton.addEventListener('click', () => {
    rotateWall('left', true);
});

const rotateLeftcounter = document.getElementById('rotateLeftcounter');
rotateLeftcounter.addEventListener('click', () => {
    rotateWall('left', false);
});

const rotateRightButton = document.getElementById('rotateRightButton');
rotateRightButton.addEventListener('click', () => {
    rotateWall('right', true);
});

const rotateRightcounter = document.getElementById('rotateRightcounter');
rotateRightcounter.addEventListener('click', () => {
    rotateWall('right', false);
});

const rotateBottomButton = document.getElementById('rotateBottomButton');
rotateBottomButton.addEventListener('click', () => {
    rotateWall('bottom', true);
});

const rotateBottomButtoncounter = document.getElementById('rotateBottomButtoncounter');
rotateBottomButtoncounter.addEventListener('click', () => {
    rotateWall('bottom', false);
});

const rotateTopButton = document.getElementById('rotateTopButton');
rotateTopButton.addEventListener('click', () => {
    rotateWall('top', true);
});

const rotateTopButtoncounter = document.getElementById('rotateTopButtoncounter');
rotateTopButtoncounter.addEventListener('click', () => {
    rotateWall('top', false);
});

const rotateFrontButton = document.getElementById('rotateFrontButton');
rotateFrontButton.addEventListener('click', () => {
    rotateWall('front', true);
});

const rotateFrontButtoncounter = document.getElementById('rotateFrontButtoncounter');
rotateFrontButtoncounter.addEventListener('click', () => {
    rotateWall('front', false);
});

const rotateBackButton = document.getElementById('rotateBackButton');
rotateBackButton.addEventListener('click', () => {
    rotateWall('back', true);
});

const rotateBackButtoncounter = document.getElementById('rotateBackButtoncounter');
rotateBackButtoncounter.addEventListener('click', () => {
    rotateWall('back', false);
});
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
    TWEEN.update();

}

animate();