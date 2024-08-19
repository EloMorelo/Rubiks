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

let counter = 0;
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
        counter++;
        console.log('count:', counter);

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
            const targetColor = 0xffffff;
            checkColorDirection(clickedObject, targetColor);
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

        console.log("Local Intersect:", localIntersect);

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

function findCornerPiece(primary, secondary, tertiary) {
    for (const cubelet of cubelets) {
        const { right, left, top, bottom, front, back } = getColorsFromCubelet(cubelet);
        const nonBlackColors = [right, left, top, bottom, front, back].filter(color => color !== 0x000000);

        if (nonBlackColors.length === 3 
            && nonBlackColors.includes(primary) 
            && nonBlackColors.includes(secondary) 
            && nonBlackColors.includes(tertiary)) {
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


//relateive to world axis
function checkColorDirection(cubelet, targetColor) {
    const tolerance = 0.001;

    if (!cubelet || !targetColor) {
        console.error("Invalid cubelet or targetColor");
        return null;
    }

    const materials = cubelet.material;
    if (!materials || materials.length !== 6) {
        console.error("Cubelet does not have the expected materials.");
        return null;
    }

    const localNormals = [
        new THREE.Vector3(1, 0, 0),  // Right face (+x)
        new THREE.Vector3(-1, 0, 0), // Left face (-x)
        new THREE.Vector3(0, 1, 0),  // Top face (+y)
        new THREE.Vector3(0, -1, 0), // Bottom face (-y)
        new THREE.Vector3(0, 0, 1),  // Front face (+z)
        new THREE.Vector3(0, 0, -1)  // Back face (-z)
    ];

    const worldMatrix = cubelet.matrixWorld;

    for (let i = 0; i < materials.length; i++) {
        const materialColor = materials[i].color.getHex();

        if (Math.abs(materialColor - targetColor) < tolerance) {
            const worldNormal = localNormals[i].clone().applyMatrix4(worldMatrix).normalize();
            const dominantAxis = getDominantAxis(worldNormal);
            console.log(`The color ${targetColor.toString(16)} on cubelet ${cubelet.userData.id} is facing ${dominantAxis}.`);
            return dominantAxis;
        }
    }

    console.log(`The color ${targetColor.toString(16)} is not found on cubelet ${cubelet.userData.id}.`);
    return null;
}

function getDominantAxis(normal) {
    const absX = Math.abs(normal.x);
    const absY = Math.abs(normal.y);
    const absZ = Math.abs(normal.z);

    if (absX > absY && absX > absZ) {
        return normal.x > 0 ? '+x' : '-x';
    } else if (absY > absX && absY > absZ) {
        return normal.y > 0 ? '+y' : '-y';
    } else if (absZ > absX && absZ > absY) {
        return normal.z > 0 ? '+z' : '-z';
    }

    return null; 
}

function isCubeletAtPosition(cubelet, xTarget, yTarget, zTarget) {
    if (!cubelet) {
        console.error('Cubelet is not defined');
        return false;
    }

    if (!(cubelet instanceof THREE.Mesh)) {
        console.error('Provided object is not a THREE.Mesh');
        return false;
    }

    const position = cubelet.position;
    return position.x === xTarget && position.y === yTarget && position.z === zTarget;
}


async function solveWhiteCross() {
    const WhiteCross = document.getElementById('WhiteCross');
    WhiteCross.disabled = true;


    try {
    const edgePieces = [
        { color1: 0xffffff, color2: 0xff0000, targetPos: { x: 1, y: -1, z: 0 } }, // White-Red
        { color1: 0xffffff, color2: 0x0000ff, targetPos: { x: 0, y: -1, z: 1 } }, // White-Blue
        { color1: 0xffffff, color2: 0x009b48, targetPos: { x: 0, y: -1, z: -1 } }, // White-Green
        { color1: 0xffffff, color2: 0xffa500, targetPos: { x: -1, y: -1, z: 0 } }  // White-Orange
    ];

    for (const piece of edgePieces) {
        const cubelet = findWallPiece(piece.color1, piece.color2);

        if (isCubeletAtPosition(cubelet, piece.targetPos.x, piece.targetPos.y, piece.targetPos.z) && checkColorDirection(cubelet, piece.color1) === '-y') {
            console.log(`Piece with colors ${piece.color1} and ${piece.color2} is already in the correct position.`);
            continue;
        }

        await movePieceToTopLayer(cubelet);
        await rotateTopLayerToCorrectPosition(cubelet, piece.targetPos);
        await movePieceDownToCorrectPosition(cubelet);
    }

    console.log('White cross solved!');
} catch (error) {
    console.error('An error occurred while solving the white cross:', error);
} finally {
    
    WhiteCross.disabled = false;
}
}

async function movePieceToTopLayer(cubelet) {
    if (cubelet.position.y === -1) 
    {
        const wall = getCubeletWall(cubelet);
                if (wall !== 'unknown') {
            await rotateWall(wall, true); 
            await sleep(200);
        }
    }
    if (cubelet.position.y === 0) 
        {
        const colorWall = getCubeletWallColorFace(cubelet);
        if (colorWall !== 'unknown') {
            if(getRelativePositionOnWall(cubelet, colorWall) === 'left'){
                await rotateWall(colorWall, true); 
                await sleep(200);
                rotateWall('top', false);
                await sleep(200);
                rotateWall(colorWall, false);
                await sleep(200);
            }
            else if(getRelativePositionOnWall(cubelet, colorWall) === 'right'){
                await rotateWall(colorWall, false); 
                await sleep(200);
                rotateWall('top', false);
                await sleep(200);
                rotateWall(colorWall, true);
                await sleep(200);
            }
        }
    }
    if (cubelet.position.y === 1 && checkColorDirection(cubelet, 0xffffff) !== '+y')
    {
        let whiteWall = getCubeletWallWhiteFace(cubelet);
        console.log('whiteWall:', whiteWall);
        await rotateWall(whiteWall, false);
        await sleep(200);
        const colorWall = getCubeletWallColorFace(cubelet);
        console.log('colorWall:', colorWall);
        await rotateWall(colorWall, false);
        await sleep(200);
        //whiteWall = getCubeletWallWhiteFace(cubelet);
        //console.log('whiteWall:', whiteWall);
        //await rotateWall(whiteWall, true);
        //await sleep(2000);
        whiteWall = getCubeletWallWhiteFace(cubelet);
        const saveWall = getCubeletWallColorFace(cubelet);
        console.log('whiteWall:', whiteWall);
        await rotateWall(whiteWall, false);
        await sleep(200);
        console.log('saveWall:', saveWall);
        await rotateWall(saveWall, true);
        await sleep(200);
    }
    else
    {
        console.log('Cubelet is already in the top layer.');
    }
}


async function rotateTopLayerToCorrectPosition(cubelet, targetPos) {
    while (!(cubelet.position.x === targetPos.x && cubelet.position.z === targetPos.z)) {
        await rotateWall('top', true); 
        await sleep(200);
    }
}

async function movePieceDownToCorrectPosition(cubelet) {
    const wall = getCubeletWallColorFace(cubelet);
    await rotateWall(wall, true);
    await sleep(200);
    await rotateWall(wall, true);
    await sleep(200);
    
}

async function solveCorners() {
    const WhiteCorners = document.getElementById('WhiteCorners');
    WhiteCorners.disabled = true;
    
    try {
    const cornerPieces = [
        { color1: 0xffffff, color2: 0xff0000, color3: 0x0000ff, targetPos: { x: 1, y: -1, z: 1 } }, // White-Red-Blue
        { color1: 0xffffff, color2: 0xff0000, color3: 0x009b48, targetPos: { x: 1, y: -1, z: -1 } }, // White-Red-Green
        { color1: 0xffffff, color2: 0x009b48, color3: 0xffa500, targetPos: { x: -1, y: -1, z: -1 } }, // White-Green-Orange
        { color1: 0xffffff, color2: 0xffa500, color3: 0x0000ff, targetPos: { x: -1, y: -1, z: 1 } }  // White-Orange-Red
    ];
    for(const piece of cornerPieces){
        const cubelet = findCornerPiece(piece.color1, piece.color2, piece.color3);
        if (isCubeletAtPosition(cubelet, piece.targetPos.x, piece.targetPos.y, piece.targetPos.z) && checkColorDirection(cubelet, piece.color1) === '-y') {
            console.log(`Piece with colors ${piece.color1}, ${piece.color2}, and ${piece.color3} is already in the correct position.`);
            continue;
        }

        await moveCornerPieceToTopLayer(cubelet,piece.targetPos);
        await rotateCornerPieceToCorrectPosition(cubelet, piece.targetPos);
        await moveCornerPieceDownToCorrectPosition(cubelet);
    }

}
 catch (error) {
    console.error('An error occurred while solving the white cross:', error);
} finally {
    
    WhiteCorners.disabled = false;
}
}


async function moveCornerPieceToTopLayer(cubelet,targetPos) {
    if(cubelet.position.y === -1)
        {
        if(checkColorDirection(cubelet, 0xffffff) === '-y')
            {
                const RightWall = getRightWallCorner(cubelet);
                await rotateWall(RightWall, true);
                await sleep(200);
                await rotateWall('top', true);
                await sleep(200);
                await rotateWall(RightWall, false);
                await sleep(200);
            }
            else
            {
                const adjwall = getAdjacentWallToWhiteFace(cubelet);
                const whitewall = getCubeletWallWhiteFace(cubelet);
                if (getRelativePositionOnWall(cubelet, whitewall) === 'bottom-left-corner') {
                    await rotateWall(adjwall.adjacentWall1, false);
                    await sleep(200);
                    await rotateWall('top', true);
                    await sleep(200);
                    await rotateWall(adjwall.adjacentWall1, true);
                    await sleep(200);
                }
                else
                {
                    await rotateWall(adjwall.adjacentWall1, true);
                    await sleep(200);
                    await rotateWall('top', false);
                    await sleep(200);
                    await rotateWall(adjwall.adjacentWall1, false);
                    await sleep(200);
                }
            }
    }
    if(cubelet.position.y === 1 && checkColorDirection(cubelet, 0xffffff) === '+y')
    {  
        while (!(cubelet.position.x === targetPos.x && cubelet.position.z === targetPos.z)) {
            await rotateWall('top', true); 
            await sleep(200);
        }
        await sleep(200);
        const RightWall = getRightWallCorner(cubelet);
        await rotateWall(RightWall, true);
        await sleep(200);
        await rotateWall('top', true);
        await sleep(200);
        await rotateWall('top', true);
        await sleep(200);
        await rotateWall(RightWall, false);
        await sleep(200);
    }

}

async function rotateCornerPieceToCorrectPosition(cubelet, targetPos) {
    while (!(cubelet.position.x === targetPos.x && cubelet.position.z === targetPos.z)) {
        await rotateWall('top', true); 
        await sleep(200);
    }
}

async function moveCornerPieceDownToCorrectPosition(cubelet) {
    const whiteWall = getCubeletWallWhiteFace(cubelet);
    const adjwall = getAdjacentWallToWhiteFace(cubelet);
    if(getRelativePositionOnWall(cubelet, whiteWall) === 'top-right-corner'){
        await rotateWall('top',true);
        await sleep(200);
        await rotateWall(adjwall.adjacentWall1, true);
        await sleep(200);
        await rotateWall('top', false);
        await sleep(200);
        await rotateWall(adjwall.adjacentWall1, false);
        await sleep(200);
    }
    else
    {
        await rotateWall('top',false);
        await sleep(200);
        await rotateWall(adjwall.adjacentWall1, false);
        await sleep(200);
        await rotateWall('top', true);
        await sleep(200);
        await rotateWall(adjwall.adjacentWall1, true);
        await sleep(200);
    }
}
function getAdjacentWallToWhiteFace(cubelet, whiteColor = 0xffffff) {
    const whiteDirection = checkColorDirection(cubelet, whiteColor);
    const { x, y, z } = cubelet.position;

    switch (whiteDirection) {
        case '+x': 
            if (z === 1) return { adjacentWall1: 'front', adjacentWall2: 'top' };
            if (z === -1) return { adjacentWall1: 'back', adjacentWall2: 'top' };
            break;
        case '-x': 
            if (z === 1) return { adjacentWall1: 'front', adjacentWall2: 'bottom' };
            if (z === -1) return { adjacentWall1: 'back', adjacentWall2: 'bottom' };
            break;
        case '+y': 
            if (x === 1) return { adjacentWall1: 'right', adjacentWall2: 'null' };
            if (x === -1) return { adjacentWall1: 'left', adjacentWall2: 'null' };
            if (z === 1) return { adjacentWall1: 'front', adjacentWall2: 'null' };
            if (z === -1) return { adjacentWall1: 'back', adjacentWall2: 'null' };
            break;
        case '-y':
            if (x === 1) return { adjacentWall1: 'right', adjacentWall2: 'null' };
            if (x === -1) return { adjacentWall1: 'left', adjacentWall2: 'null' };
            if (z === 1) return { adjacentWall1: 'front', adjacentWall2: 'null' };
            if (z === -1) return { adjacentWall1: 'back', adjacentWall2: 'null' };
            break;
        case '+z': 
            if (x === 1) return { adjacentWall1: 'right', adjacentWall2: 'top' };
            if (x === -1) return { adjacentWall1: 'left', adjacentWall2: 'top' };
            break;
        case '-z': 
            if (x === 1) return { adjacentWall1: 'right', adjacentWall2: 'bottom' };
            if (x === -1) return { adjacentWall1: 'left', adjacentWall2: 'bottom' };
            break;
    }

    return 'unknown';
}

function getRightWallCorner(cubelet) {
    const { x, y, z } = cubelet.position;

    if (x === 1 && z === 1) {
        return 'right';
    } else if (x === 1 && z === -1) {
        return 'back';
    } else if (x === -1 && z === -1) {
        return 'left';
    } else if (x === -1 && z === 1) {
        return 'front';
    } else {
        return 'unknown';
    }
}



function getCubeletWallWhiteFace(cubelet, whiteColor = 0xffffff) {
    const whiteDirection = checkColorDirection(cubelet, whiteColor);
    const { x, y, z } = cubelet.position;

    if (y === -1 && whiteDirection === '-y') {
        return 'bottom';
    }
    
    if (y === 1 && whiteDirection === '+y') {
        return 'top';
    }
    
    if (x === -1 && whiteDirection === '-x') {
        return 'left';
    }
    
    if (x === 1 && whiteDirection === '+x') {
        return 'right';
    }
    
    if (z === 1 && whiteDirection === '+z') {
        return 'front';
    }
    
    if (z === -1 && whiteDirection === '-z') {
        return 'back';
    }

    if (whiteDirection === '+z') {
        return 'front';
    }
    
    if (whiteDirection === '-z') {
        return 'back';
    }
    
    if (whiteDirection === '+x') {
        return 'right';
    }
    
    if (whiteDirection === '-x') {
        return 'left';
    }

    return 'unknown';
}


function getCubeletWallColorFace(cubelet, whiteColor = 0xffffff) {
    const whiteDirection = checkColorDirection(cubelet, whiteColor);
    const { x, y, z } = cubelet.position;

    switch (whiteDirection) {
        case '-y':
            if (x === 1) return 'right';
            if (x === -1) return 'left';
            if (z === 1) return 'front';
            if (z === -1) return 'back';
            break;
        case '+y':
            if (x === 1) return 'right';
            if (x === -1) return 'left';
            if (z === 1) return 'front';
            if (z === -1) return 'back';
            break;
        case '-x':
            if (y === 1) return 'top';
            if (y === -1) return 'bottom';
            if (z === 1) return 'front';
            if (z === -1) return 'back';
            break;
        case '+x':
            if (y === 1) return 'top';
            if (y === -1) return 'bottom';
            if (z === 1) return 'front';
            if (z === -1) return 'back';
            break;
        case '-z':
            if (y === 1) return 'top';
            if (y === -1) return 'bottom';
            if (x === 1) return 'right';
            if (x === -1) return 'left';
            break;
        case '+z':
            if (y === 1) return 'top';
            if (y === -1) return 'bottom';
            if (x === 1) return 'right';
            if (x === -1) return 'left';
            break;
    }

    return 'unknown';
}

function getCubeletWall(cubelet) {
    const { x, z } = cubelet.position;

    if (x === 1) {
        return 'right';
    } else if (x === -1) {
        return 'left';
    } else if (z === 1) {
        return 'front';
    } else if (z === -1) {
        return 'back';
    } else {
        return 'unknown';
    }
}

function getRelativePositionOnWall(cubelet, wall) {
    const { x, y, z } = cubelet.position;

    switch (wall) {
        case 'front':
            if (y === 1 && x === 1) return 'top-right-corner';
            if (y === 1 && x === -1) return 'top-left-corner';
            if (y === -1 && x === 1) return 'bottom-right-corner';
            if (y === -1 && x === -1) return 'bottom-left-corner';
            if (y === 1) return 'top';
            if (y === -1) return 'bottom';
            if (x === 1) return 'right';
            if (x === -1) return 'left';
            break;

        case 'back':
            if (y === 1 && x === -1) return 'top-right-corner';
            if (y === 1 && x === 1) return 'top-left-corner';
            if (y === -1 && x === -1) return 'bottom-right-corner';
            if (y === -1 && x === 1) return 'bottom-left-corner';
            if (y === 1) return 'top';
            if (y === -1) return 'bottom';
            if (x === -1) return 'right'; 
            if (x === 1) return 'left';
            break;

        case 'left':
            if (y === 1 && z === 1) return 'top-right-corner';
            if (y === 1 && z === -1) return 'top-left-corner';
            if (y === -1 && z === 1) return 'bottom-right-corner';
            if (y === -1 && z === -1) return 'bottom-left-corner';
            if (y === 1) return 'top';
            if (y === -1) return 'bottom';
            if (z === -1) return 'left'; 
            if (z === 1) return 'right';
            break;

        case 'right':
            if (y === 1 && z === -1) return 'top-right-corner';
            if (y === 1 && z === 1) return 'top-left-corner';
            if (y === -1 && z === -1) return 'bottom-right-corner';
            if (y === -1 && z === 1) return 'bottom-left-corner';
            if (y === 1) return 'top';
            if (y === -1) return 'bottom';
            if (z === 1) return 'left';
            if (z === -1) return 'right';
            break;

        case 'top':
            if (z === -1 && x === 1) return 'top-right-corner';
            if (z === -1 && x === -1) return 'top-left-corner';
            if (z === 1 && x === 1) return 'bottom-right-corner';
            if (z === 1 && x === -1) return 'bottom-left-corner';
            if (z === 1) return 'bottom';
            if (z === -1) return 'top';
            if (x === 1) return 'right';
            if (x === -1) return 'left';
            break;

        case 'bottom':
            if (z === 1 && x === -1) return 'top-left-corner';
            if (z === 1 && x === 1) return 'top-right-corner';
            if (z === -1 && x === -1) return 'bottom-left-corner';
            if (z === -1 && x === 1) return 'bottom-right-corner';
            if (z === 1) return 'top';
            if (z === -1) return 'bottom';
            if (x === -1) return 'left';
            if (x === 1) return 'right';
            break;

        default:
            return 'unknown';
    }
    
    return 'center';
}



async function Randomzie()
{
    const Randomize = document.getElementById('Randomize');
    Randomize.disabled = true;

    try{
    await sleep(200);
    await rotateWall('right', true);
    await sleep(200);
    await rotateWall('top', true);
    await sleep(200);
    await rotateWall('front', true);
    await sleep(200);
    await rotateWall('left', true);
    await sleep(200);
    await rotateWall('back', true);
    await sleep(200);
    await rotateWall('bottom', true);
    await sleep(200);
    await rotateWall('right', true);
    await sleep(200);
    await rotateWall('top', true);
    await sleep(200);
    await rotateWall('front', true);
    await sleep(200);
    await rotateWall('left', true);
    await sleep(200);
    await rotateWall('back', true);
    await sleep(200);
    await rotateWall('bottom', true);
    await sleep(200);
    await rotateWall('right', true);
    await sleep(200);
    await rotateWall('front', true);
    await sleep(200);
    await rotateWall('front', true);
    await sleep(200);
    await rotateWall('left', true);
    await sleep(200);
    await rotateWall('top', true);
    }
    catch (error) {
        console.error('An error occurred while randomizing the cube:', error);
    } finally {
        Randomize.disabled = false;
    }
}


const Random = document.getElementById('Randomize');
Random.addEventListener('click', () => {
Randomzie();
});

const test = document.getElementById('test');
test.addEventListener('click', () => {
    const WhiteBlueOrange = findCornerPiece(0xffffff, 0x0000ff, 0xffa500);
    moveCornerPieceToTopLayer(WhiteBlueOrange);
});



WhiteCross.addEventListener('click', async () => {
    solveWhiteCross();
    await sleep(200);
    console.log('count:', counter);
});

WhiteCorners.addEventListener('click', async () => {
    solveCorners();
    console.log('count:', counter);
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