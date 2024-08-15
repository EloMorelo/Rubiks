import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js';
import { pushCubelets } from './Cube.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth * 0.5 / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth / 2 , window.innerHeight);
document.body.appendChild(renderer.domElement);
const originalColors = new Map();


scene.background = new THREE.Color(0x808080);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const cubelets = pushCubelets();
cubelets.forEach(cubelet => scene.add(cubelet));

const webglContainer = document.getElementById('webgl-container');

function setRendererSize() {
    renderer.setSize(webglContainer.clientWidth, webglContainer.clientHeight);
    camera.aspect = webglContainer.clientWidth / webglContainer.clientHeight;
    camera.updateProjectionMatrix();
}

setRendererSize();
webglContainer.appendChild(renderer.domElement);


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

const raycaster = new THREE.Raycaster();
const faceNames = ['right', 'left', 'top', 'bottom', 'front', 'back'];
const pointer = new THREE.Vector2();
document.addEventListener('mousedown', onMouseDown);


let faceColor = 0xffffff;


function onMouseDown(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const intersect = intersects[0];
        const faceIndex = getFaceIndexFromIntersection(clickedObject, intersect);
        if (faceIndex >= 0 && faceIndex < faceNames.length) {
            console.log('Clicked face:', faceNames[faceIndex]);
            console.log(`Cubelet ID: ${clickedObject.userData.id}`);

            changeFaceColor(clickedObject, faceIndex, faceColor);
        } else {
            console.error('Invalid face index:', faceIndex);
        }
    }
}

function getFaceIndexFromIntersection(object, intersect) {
    if (object.geometry instanceof THREE.BoxGeometry) {
        const localIntersect = object.worldToLocal(intersect.point.clone());
        const size = object.geometry.parameters.width / 2;

        //console.log("Local Intersect:", localIntersect);

        const tolerance = 0.1;
        if (Math.abs(localIntersect.x - size) < tolerance) return 0; // Right face
        if (Math.abs(localIntersect.x + size) < tolerance) return 1; // Left face
        if (Math.abs(localIntersect.y - size) < tolerance) return 2; // Top face
        if (Math.abs(localIntersect.y + size) < tolerance) return 3; // Bottom face
        if (Math.abs(localIntersect.z - size) < tolerance) return 4; // Front face
        if (Math.abs(localIntersect.z + size) < tolerance) return 5; // Back face
    }
    return undefined;
}




function changeFaceColor(cubelet, faceIndex, color) {
    if (cubelet.material && cubelet.material.length > faceIndex) {
        const originalColor = cubelet.material[faceIndex].color.getHex();
        const blackColor = 0x000000;

        if (originalColor === blackColor) {
            console.log('Cannot change color of black face.');
            return;
        }

        cubelet.material[faceIndex].color.set(color);
    } else {
        console.error('Could not change face color, invalid faceIndex:', faceIndex);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//primary white or yellow secondary red, blue, green, orange
function findWallPiece(primary, secondary){
    
    for (const cubelet of cubelets) {
        const { right, left, top, bottom, front, back } = getColorsFromCubelet(cubelet);
        const nonBlackColors = [right, left, top, bottom, front, back].filter(color => color !== 0x000000);

        if (nonBlackColors.length === 2 && nonBlackColors.includes(primary) && nonBlackColors.includes(secondary)) {
            return cubelet;
        }
    }
    return null;

}

function getColorsFromCubelet(cubelet) {
    return {
        right: cubelet.material[0].color.getHex(),
        left: cubelet.material[1].color.getHex(),
        top: cubelet.material[2].color.getHex(),
        bottom: cubelet.material[3].color.getHex(),
        front: cubelet.material[4].color.getHex(),
        back: cubelet.material[5].color.getHex(),
    };
}

//time to rotate a wall 100ms
async function moveWallPiece(){
    rotateWall('front', true);
    await sleep(101);
    rotateWall('right', false);
}



const edgePiece = findWallPiece(0xffffff,0xff0000);

const test = document.getElementById('test');
test.addEventListener('click', () => {
//find wall piece -> check side centers if matching -> if yes rotate wall -> adjuct rotation and move wall to top layer -> rotate top layer and corresponding wall






    if (edgePiece) {
        const { x, y, z } = edgePiece.position;
        console.log(`Found edge piece: ${edgePiece.userData.id}, Coordinates: (${x}, ${y}, ${z})`);
        console.log('direction of white face:' + result.sign + result.axis);
    } else {
        console.log('Edge piece not found');
    }
});








//Button section
const YellowButton = document.getElementById('YellowButton');
YellowButton.addEventListener('click', () => {
    faceColor = 0xFFFF00;
});

const RedButton = document.getElementById('RedButton');
RedButton.addEventListener('click', () => {
    faceColor = 0xff0000;
});

const GreenButton = document.getElementById('GreenButton');
GreenButton.addEventListener('click', () => {
    faceColor = 0x009b48;
});

const BlueButton = document.getElementById('BlueButton');
BlueButton.addEventListener('click', () => {
    faceColor = 0x0000ff;
});

const WhiteButton = document.getElementById('WhiteButton');
WhiteButton.addEventListener('click', () => {
    faceColor = 0xffffff;
});

const OrangeButton = document.getElementById('OrangeButton');
OrangeButton.addEventListener('click', () => {
    faceColor = 0xffa500;
});

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
    controls.update();
    renderer.render(scene, camera);
    TWEEN.update();

}

animate();