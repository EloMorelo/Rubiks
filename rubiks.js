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
async function rotateWall(wall, clockwise) {
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

    let tween = new TWEEN.Tween({ kat: 0 })
        .to({ kat: angle }, 64)
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
        })
        .start();

        await sleep(100);
        counter++;
        //console.log('count:', counter);

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
            const targetColor = 0xffffff;
            checkColorDirection(clickedObject, targetColor);
            changeFaceColor(clickedObject, faceIndex, faceColor);
        } else {
        }
    }
}

function getFaceIndexFromIntersection(object, intersect) {
    if (object.geometry instanceof THREE.BoxGeometry) {
        const localIntersect = object.worldToLocal(intersect.point.clone());
        const size = object.geometry.parameters.width / 2;


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

function getCubeletAtPosition(xTarget, yTarget, zTarget) {
    for (const cubelet of cubelets) {
        const { x, y, z } = cubelet.position;

        if (x === xTarget && y === yTarget && z === zTarget) {
            return cubelet;
        }
    }

    return null;
}


function changeFaceColor(cubelet, faceIndex, color) {
    if (cubelet.material && cubelet.material.length > faceIndex) {
        const originalColor = cubelet.material[faceIndex].color.getHex();
        const blackColor = 0x000000;

        if (originalColor === blackColor) {
            return;
        }

        cubelet.material[faceIndex].color.set(color);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
            return dominantAxis;
        }
    }

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
        }
    }
    if (cubelet.position.y === 0) 
        {
        const colorWall = getCubeletWallColorFace(cubelet);
        if (colorWall !== 'unknown') {
            if(getRelativePositionOnWall(cubelet, colorWall) === 'left'){
                await rotateWall(colorWall, true); 
                await rotateWall('top', false);
                await rotateWall(colorWall, false);
            }
            else if(getRelativePositionOnWall(cubelet, colorWall) === 'right'){
                await rotateWall(colorWall, false); 
                await rotateWall('top', false);
                await rotateWall(colorWall, true);
            }
        }
    }
    if (cubelet.position.y === 1 && checkColorDirection(cubelet, 0xffffff) !== '+y')
    {
        let whiteWall = getCubeletWallWhiteFace(cubelet);
        await rotateWall(whiteWall, false);
        const colorWall = getCubeletWallColorFace(cubelet);
        await rotateWall(colorWall, false);
        whiteWall = getCubeletWallWhiteFace(cubelet);
        const saveWall = getCubeletWallColorFace(cubelet);
        await rotateWall(whiteWall, false);
        await rotateWall(saveWall, true);
    }
    else
    {
        console.log('Cubelet is already in the top layer.');
    }
}


async function rotateTopLayerToCorrectPosition(cubelet, targetPos) {
    while (!(cubelet.position.x === targetPos.x && cubelet.position.z === targetPos.z)) {
        await rotateWall('top', true); 
    }
}

async function movePieceDownToCorrectPosition(cubelet) {
    const wall = getCubeletWallColorFace(cubelet);
    await rotateWall(wall, true);
    await rotateWall(wall, true);
    
}

async function solveWhiteCorners() {
    const WhiteCorners = document.getElementById('WhiteCorners');
    WhiteCorners.disabled = true;
    
    try {
    const cornerPieces = [
        { color1: 0xffffff, color2: 0xff0000, color3: 0x0000ff, targetPos: { x: 1, y: -1, z: 1 } }, // White-Red-Blue
        { color1: 0xffffff, color2: 0xff0000, color3: 0x009b48, targetPos: { x: 1, y: -1, z: -1 } }, // White-Red-Green
        { color1: 0xffffff, color2: 0x009b48, color3: 0xffa500, targetPos: { x: -1, y: -1, z: -1 } }, // White-Green-Orange
        { color1: 0xffffff, color2: 0xffa500, color3: 0x0000ff, targetPos: { x: -1, y: -1, z: 1 } }  // White-Orange-Blue
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
                await rotateWall('top', true);
                await rotateWall(RightWall, false);
            }
            else
            {
                const adjwall = getAdjacentWallToWhiteFace(cubelet);
                const whitewall = getCubeletWallWhiteFace(cubelet);
                if (getRelativePositionOnWall(cubelet, whitewall) === 'bottom-left-corner') {
                    await rotateWall(adjwall.adjacentWall1, false);
                    await rotateWall('top', true);
                    await rotateWall(adjwall.adjacentWall1, true);
                }
                else
                {
                    await rotateWall(adjwall.adjacentWall1, true);
                    await rotateWall('top', false);
                    await rotateWall(adjwall.adjacentWall1, false);
                }
            }
    }
    if(cubelet.position.y === 1 && checkColorDirection(cubelet, 0xffffff) === '+y')
    {  
        while (!(cubelet.position.x === targetPos.x && cubelet.position.z === targetPos.z)) {
            await rotateWall('top', true); 
        }
        const RightWall = getRightWallCorner(cubelet);
        await rotateWall(RightWall, true);
        await rotateWall('top', true);
        await rotateWall('top', true);
        await rotateWall(RightWall, false);
    }

}

async function rotateCornerPieceToCorrectPosition(cubelet, targetPos) {
    while (!(cubelet.position.x === targetPos.x && cubelet.position.z === targetPos.z)) {
        await rotateWall('top', true); 
    }
}

async function moveCornerPieceDownToCorrectPosition(cubelet) {
    const whiteWall = getCubeletWallWhiteFace(cubelet);
    const adjwall = getAdjacentWallToWhiteFace(cubelet);
    if(getRelativePositionOnWall(cubelet, whiteWall) === 'top-right-corner'){
        await rotateWall('top',true);
        await rotateWall(adjwall.adjacentWall1, true);
        await rotateWall('top', false);
        await rotateWall(adjwall.adjacentWall1, false);
    }
    else
    {
        await rotateWall('top',false);
        await rotateWall(adjwall.adjacentWall1, false);
        await rotateWall('top', true);
        await rotateWall(adjwall.adjacentWall1, true);
    }
}

async function SolveMiddleLayer() {

    const edgePieces = [
        { color1: 0x009b48, color2: 0xff0000, targetPos: { x: 1, y: 0, z: -1 } }, // Green-Red
        { color1: 0xff0000, color2: 0x0000ff, targetPos: { x: 1, y: 0, z: 1 } }, // Red-Blue
        { color1: 0xffa500, color2: 0x009b48, targetPos: { x: -1, y: 0, z: -1 } }, // Orange-Green
        { color1: 0xffa500, color2: 0x0000ff, targetPos: { x: -1, y: 0, z: 1 } }  // Blue-Orange
    ];

    for (const piece of edgePieces) {
        const cubelet = findWallPiece(piece.color1, piece.color2);

        if (isCubeletAtPosition(cubelet, piece.targetPos.x, piece.targetPos.y, piece.targetPos.z) && checkPieceIfMiddleMatch(cubelet, piece.color1)) {
            console.log(`Piece with colors ${piece.color1} and ${piece.color2} is already in the correct position.`);
            continue;
        }
        console.log(`------------------------------------Piece with colors ${piece.color1} and ${piece.color2} is currently Moving`);
        await MoveMiddleLayerToTop(cubelet,piece.color1);
        console.log('Middle Layer to top');
        await RotateMiddleLayerToCorrectPosition(cubelet,piece.color1,piece.color2);
        console.log('Middle Layer to correct position');
        await MoveMiddleLayerDownToCorrectPosition(cubelet,piece.color1,piece.color2);
        console.log('Middle Layer down to correct position');


    }
    

}

async function MiddleToLeft(primary,opposite){
    await rotateWall('top', false); 
    await rotateWall(opposite, false);
    await rotateWall('top', true);
    await rotateWall(opposite, true);
    await rotateWall('top', true);
    await rotateWall(primary, true);
    await rotateWall('top', false);
    await rotateWall(primary, false);
}

async function MiddleToRight(primary,opposite){
    await rotateWall('top', true); 
    await rotateWall(opposite, true);
    await rotateWall('top', false);
    await rotateWall(opposite, false);
    await rotateWall('top', false);
    await rotateWall(primary, false);
    await rotateWall('top', true);
    await rotateWall(primary, true);
}

async function MoveMiddleLayerToTop(cubelet,color1) {
    if(cubelet.position.y === 0)
    {
        const wall = getCubeletWallMiddleFace(cubelet,color1);
        if (wall.primaryWall !== 'unknown') {
            if(getRelativePositionOnWall(cubelet, wall.primaryWall) === 'left'){
                await MiddleToLeft(wall.primaryWall,wall.oppositeWall);
            }
            else if(getRelativePositionOnWall(cubelet, wall.primaryWall) === 'right'){
                await MiddleToRight(wall.primaryWall,wall.oppositeWall);
            }
        }
    }
    
}

async function RotateMiddleLayerToCorrectPosition(cubelet,color1,color2) {
    if(cubelet.position.y === 1)
    {
    while((doesFaceMatchCenter(cubelet,color1,color2))!=true){
        await rotateWall('top',true);
    }
    }
}

async function MoveMiddleLayerDownToCorrectPosition(cubelet,color1,color2) {
    if(cubelet.position.y === 1)
    {
    const { matchesLeft, matchesRight } = doesOtherFaceMatchSideWalls(cubelet, color1, color2);    
    const wall = getCubeletWallMiddleFace(cubelet,color1);
    const sidewall = CheckColorRightLeft(wall.primaryWall);
    if(matchesLeft)
    {
        await MiddleToLeft(wall.primaryWall,sidewall.leftWall);
    }
    if(matchesRight)
    {
        await MiddleToRight(wall.primaryWall,sidewall.rightWall);
    }
}
}


async function SolveYellowCross() {
    if (detectYellowDot()) {
        console.log("Detected Yellow Dot. Applying algorithm for yellow dot...");
        await applyYellowCrossAlgorithm();
    }

    if (detectYellowL()) {
        await rotateTopToAlignL();
        console.log("Detected Yellow L. Applying algorithm for yellow L...");
        await applyYellowCrossAlgorithm();
    }

    if (detectYellowLine()) {
        await rotateTopLayerForHorizontalLine();
        console.log("Detected Yellow Line. Applying algorithm for yellow line...");
        await applyYellowCrossAlgorithm();
    }

    if (detectYellowCross()) {
        console.log("Detected Yellow Cross. The yellow face is solved!");
    }
}

function detectYellowDot() {
    const topCenter = getCubeletAtPosition(0, 1, 0);
    if (checkColorDirection(topCenter, 0xffff00) === '+y') {
        const yellowEdges = detectYellowEdges();
        if (yellowEdges.length === 0) {
            yellowEdges.length = 0;
            return true;
        }
    }
    return false;
}

function detectYellowL() {
    const yellowEdges = detectYellowEdges();
    if (yellowEdges.length === 2) {
        const edge1 = yellowEdges[0];
        const edge2 = yellowEdges[1];


            if(!(edge1.position.x === 0 && edge2.position.x === 0) && !(edge1.position.z === 0 && edge2.position.z === 0))
            {
            console.log('Yellow L detected');
            yellowEdges.length = 0;
            return true;
            }
    }
    return false;
}

function detectYellowLine() {
    const yellowEdges = detectYellowEdges();
    if (yellowEdges.length === 2) {
        const edge1 = yellowEdges[0];
        const edge2 = yellowEdges[1];
        if ((edge1.position.z === edge2.position.z && edge1.position.x !== edge2.position.x) ||
            (edge1.position.x === edge2.position.x && edge1.position.z !== edge2.position.z)) {
            console.log('Yellow line detected');
            yellowEdges.length = 0;
            return true;
        }
    }
    return false;
}

function detectYellowCross() {
    const yellowEdges = detectYellowEdges();
    if (yellowEdges.length === 4) {
        return true;
    }
    return false;
}

function detectYellowEdges() {
    const topEdges = [
        { position: { x: 0, y: 1, z: 1 }, face: '+y' },  // Front edge
        { position: { x: 1, y: 1, z: 0 }, face: '+y' },  // Right edge
        { position: { x: 0, y: 1, z: -1 }, face: '+y' }, // Back edge
        { position: { x: -1, y: 1, z: 0 }, face: '+y' }  // Left edge
    ];

    let yellowEdges = [];

    for (const edge of topEdges) {
        const cubelet = getCubeletAtPosition(edge.position.x, edge.position.y, edge.position.z);
        if (checkColorDirection(cubelet, 0xffff00) === edge.face) {
            yellowEdges.push(edge);
        }
    }
    // console.log('detectYellowEdges:');
    // console.log(yellowEdges);
    return yellowEdges;
}





async function applyYellowCrossAlgorithm() {
    await rotateWall('front', true);
    await rotateWall('right', true);
    await rotateWall('top', true);
    await rotateWall('right', false);
    await rotateWall('top', false);
    await rotateWall('front', false);
}

async function rotateTopToAlignL() {
    let yellowEdges = detectYellowEdges();

    if (yellowEdges.length !== 2) {
        console.error("Yellow L not detected");
        return;
    }

    let edge1 = yellowEdges[0];
    let edge2 = yellowEdges[1];

    const TargetPos1 = 
        { x: 0, y: 1, z: -1 };
    const TargetPos2 = 
        { x: -1, y: 1, z: 0 };


    while(!((edge1.position.x === TargetPos1.x && edge1.position.z === TargetPos1.z) && (edge2.position.x === TargetPos2.x && edge2.position.z === TargetPos2.z)) || 
    ((edge1.position.x === TargetPos2.x && edge1.position.z === TargetPos2.z) && (edge2.position.x === TargetPos1.x && edge2.position.z === TargetPos1.z)))
    {
        console.log("Rotating top layer to align L...");
        await rotateWall('top', true);
        yellowEdges = detectYellowEdges();
        edge1 = yellowEdges[0];
        edge2 = yellowEdges[1];
        
    }
    yellowEdges.length = 0;
    console.log("Yellow L is now facing left.");
}

async function rotateTopLayerForHorizontalLine() {

    let yellowEdges = detectYellowEdges();

    if (yellowEdges.length !== 2) {
        console.error("Yellow line not detected");
        return;
    }

    let edge1 = yellowEdges[0];
    let edge2 = yellowEdges[1];

    const TargetPos1 = 
        { x: 1, y: 1, z: 0 };
    const TargetPos2 = 
        { x: -1, y: 1, z: 0 };


    while(!( (edge1.position.x === TargetPos1.x && edge1.position.z === TargetPos1.z) && (edge2.position.x === TargetPos2.x && edge2.position.z === TargetPos2.z)) || 
    ((edge1.position.x === TargetPos2.x && edge1.position.z === TargetPos2.z) && (edge2.position.x === TargetPos1.x && edge2.position.z === TargetPos1.z)))
    {
        await rotateWall('top', true);
        yellowEdges = detectYellowEdges();
        edge1 = yellowEdges[0];
        edge2 = yellowEdges[1];
    }
    yellowEdges.length = 0;
    
}




async function CheckYellowCrossAlignment() {
    console.log('Yellow Edges:');

    const Pieces = [
        { color1: 0xffff00, color2: 0xff0000, targetPos: { x: 1, y: 1, z: 0 } }, // Yellow-Red
        { color1: 0xffff00, color2: 0x0000ff, targetPos: { x: 0, y: 1, z: 1 } }, // Yellow-Blue
        { color1: 0xffff00, color2: 0x009b48, targetPos: { x: 0, y: 1, z: -1 } }, // Yellow-Green
        { color1: 0xffff00, color2: 0xffa500, targetPos: { x: -1, y: 1, z: 0 } }  // Yellow-Orange
    ];

    let highest = 0;
    let correct = 0;
    let maxRotation = 0;
    let correctCubelets = {};

    for (let i = 0; i < 3; i++) { 
        correct = 0;
        let currentCorrectCubelets = {}; 

        for (let j = 0; j < Pieces.length; j++) {
            const piece = Pieces[j];
            const cubelet = findWallPiece(piece.color1, piece.color2);

            if (isCubeletAtPosition(cubelet, piece.targetPos.x, piece.targetPos.y, piece.targetPos.z) && checkPieceIfMiddleMatch(cubelet, piece.color2)) {
                correct++;
                currentCorrectCubelets[`cubelet${correct}`] = cubelet;  
            }
        }

        if (correct > highest) {
            highest = correct;
            maxRotation = i;
            correctCubelets = currentCorrectCubelets;  
        }

        await rotateWall('top', true);
        await sleep(200); 
    }

    console.log('Highest:', highest, 'Max Rotation:', maxRotation);
    console.log('Correct cubelets:', correctCubelets);

    for (let i = 0; i < (3 - maxRotation); i++) {
        await rotateWall('top', false);
        await sleep(200); 
    }

    return correctCubelets;
}

async function AllignYellowWalls() {
    const Pieces = await CheckYellowCrossAlignment();
    const pieceCount = Object.keys(Pieces).length;
    if(pieceCount  === 2)
    {
        console.log('Length is 2');
    }
    else if(pieceCount  === 4)
    {
        console.log('Length is 4');
    }
}



function doesFaceMatchCenter(cubelet, color1, color2) {
    const direction1 = checkColorDirection(cubelet, color1);
    const direction2 = checkColorDirection(cubelet, color2);
    let wall1 = getCubeletWallMiddleFace(cubelet, color1).primaryWall;
    let wall2 = getCubeletWallMiddleFace(cubelet, color2).primaryWall;

    const colorwall1 = CheckColorOfWall(wall1);
    const colorwall2 = CheckColorOfWall(wall2);


    if (direction1 === '+y') {
        return colorwall2 === color2;
    } else if (direction2 === '+y') {
        return colorwall1 === color1;
    }
    
    console.log('No match found.');
    return false;
}


function CheckColorOfWall(wall){
    if(wall === 'right')
    {
        return 0xff0000;
    }
    else if(wall === 'back')
    {
        return 0x009b48;
    }
    else if(wall === 'front')
    {
        return 0x0000ff;
    }
    else if(wall === 'left')
    {
        return 0xffa500;
    }
}

function CheckColorRightLeft (wall)
{
    let leftWall = 'unknown';
    let rightWall = 'unknown';

    switch (wall){
    case 'right':
        leftWall = 'front';
        rightWall = 'back';
        break;
    case 'left':
        leftWall = 'back';
        rightWall = 'front';
        break;
    case 'front':
        leftWall = 'left';
        rightWall = 'right';
        break;
    case 'back':
        leftWall = 'right';
        rightWall = 'left';
        break;
    default:
        break;
    }
    return {leftWall, rightWall};
}

function doesOtherFaceMatchSideWalls(cubelet, primaryColor, otherColor) {
    const primaryWall = getCubeletWallMiddleFace(cubelet, primaryColor).primaryWall;
    const direction1 = checkColorDirection(cubelet, primaryColor);
    const direction2 = checkColorDirection(cubelet, otherColor);
    const { leftWall, rightWall } = CheckColorRightLeft(primaryWall);
    const leftWallColor = CheckColorOfWall(leftWall);
    const rightWallColor = CheckColorOfWall(rightWall);

    if(direction1 === '+y')
    {
        const matchesLeft = leftWallColor === primaryColor;
        const matchesRight = rightWallColor === primaryColor;
        return { matchesLeft, matchesRight };
    }
    else if(direction2 === '+y')
    {
        const matchesLeft = leftWallColor === otherColor;
        const matchesRight = rightWallColor === otherColor;
        return { matchesLeft, matchesRight };
    }


}



function checkPieceIfMiddleMatch(cubelet, color) {
    const wall = getCubeletWallMiddleFace(cubelet, color);
    switch (wall.primaryWall) {
        case 'back':
        if (color === 0x009b48) {
            return true;
        }
        break;
        case 'front':
        if (color === 0x0000ff) {
            return true;
        }
        break;
        case 'left':
        if (color === 0xffa500) {
            return true;
        }
        break;
        case 'right':
        if (color === 0xff0000) {
            return true;
        }
        break;
        }
    return false;
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

function getCubeletWallMiddleFace(cubelet, color) {
    const colorDirection = checkColorDirection(cubelet, color);
    const { x, y, z } = cubelet.position;

    let primaryWall = 'unknown';
    let oppositeWall = 'unknown';

    if (y === -1 && x === 1 && colorDirection === '-y') {
        // primaryWall = 'bottom';
        // oppositeWall = 'front';
        primaryWall = 'front';
        oppositeWall = 'bottom';
    } else if (y === -1 && x === -1 && colorDirection === '-y') {
        // primaryWall = 'bottom';
        // oppositeWall = 'back';
        primaryWall = 'back';
        oppositeWall = 'bottom';
    } else if (y === -1 && z === 1 && colorDirection === '-y') {
        // primaryWall = 'bottom';
        // oppositeWall = 'right';
        primaryWall = 'right';
        oppositeWall = 'bottom';
    } else if (y === -1 && z === -1 && colorDirection === '-y') {
        // primaryWall = 'bottom';
        // oppositeWall = 'left';
        primaryWall = 'left';
        oppositeWall = 'bottom';
    } else if (y === 1 && x === 1 && colorDirection === '+y') {
        // primaryWall = 'top';
        // oppositeWall = 'front';
        primaryWall = 'right';
        oppositeWall = 'top';
    } else if (y === 1 && x === -1 && colorDirection === '+y') {
        // primaryWall = 'top';
        // oppositeWall = 'back';
        primaryWall = 'left';
        oppositeWall = 'top';
    } else if (y === 1 && z === 1 && colorDirection === '+y') {
        // primaryWall = 'top';
        // oppositeWall = 'right';
        primaryWall = 'front';
        oppositeWall = 'top';
    } else if (y === 1 && z === -1 && colorDirection === '+y') {    
        // primaryWall = 'top';
        // oppositeWall = 'left';
        primaryWall = 'back';
        oppositeWall = 'top';
    } // ---------------------
     else if (z === 1 && y === 0 && colorDirection === '-x') {
        primaryWall = 'left';
        oppositeWall = 'front';
    } else if (z === 0 && y === 1 && colorDirection === '-x') {
        primaryWall = 'left';
        oppositeWall = 'top';
    } else if (z === 0 && y === -1 && colorDirection === '-x') {
        primaryWall = 'left';
        oppositeWall = 'bottom';
    } else if (z === -1 && y === 0 && colorDirection === '-x') {
        primaryWall = 'left';
        oppositeWall = 'back';
    } //-------------------------
    else if (z === 1 && y === 0 && colorDirection === '+x') {
        primaryWall = 'right';
        oppositeWall = 'front';
    } else if (z === 0 && y === 1 && colorDirection === '+x') {
        primaryWall = 'right';
        oppositeWall = 'top';
    } else if (z === 0 && y === -1 && colorDirection === '+x') {
        primaryWall = 'right';
        oppositeWall = 'bottom';
    } else if (z === -1 && y === 0 && colorDirection === '+x') {
        primaryWall = 'right';
        oppositeWall = 'back';
    } //-------------------------
    else if (x === 1 && y === 0 && colorDirection === '-z') {
        primaryWall = 'back';
        oppositeWall = 'right';
    } else if (x === 0 && y === 1 && colorDirection === '-z') {
        primaryWall = 'back';
        oppositeWall = 'top';
    } else if (x === 0 && y === -1 && colorDirection === '-z') {
        primaryWall = 'back';
        oppositeWall = 'bottom';
    } else if (x === -1 && y === 0 && colorDirection === '-z') {
        primaryWall = 'back';
        oppositeWall = 'left';
    } //-------------------------
    else if (x === 1 && y === 0 && colorDirection === '+z') {
        primaryWall = 'front';
        oppositeWall = 'right';
    } else if (x === 0 && y === 1 && colorDirection === '+z') {
        primaryWall = 'front';
        oppositeWall = 'top';
    } else if (x === 0 && y === -1 && colorDirection === '+z') {
        primaryWall = 'front';
        oppositeWall = 'bottom';
    } else if (x === -1 && y === 0 && colorDirection === '+z') {
        primaryWall = 'front';
        oppositeWall = 'left';
    } //-------------------------

    return { primaryWall, oppositeWall };
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



const Resetbutton = document.getElementById('resetButton');
Resetbutton.addEventListener('click', async () => {
    await applyYellowCrossAlgorithm();
});

async function Randomzie()
{
    const Randomize = document.getElementById('Randomize');
    Randomize.disabled = true;

    try{
    await rotateWall('right', true);
    await rotateWall('top', true);
    await rotateWall('front', true);
    await rotateWall('left', true);
    await rotateWall('back', true);
    await rotateWall('bottom', true);
    await rotateWall('right', true);
    await rotateWall('top', true);
    await rotateWall('front', true);
    await rotateWall('left', true);
    await rotateWall('back', true);
    await rotateWall('bottom', true);
    await rotateWall('right', true);
    await rotateWall('front', true);
    await rotateWall('front', true);
    await rotateWall('left', true);
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
//Randomzie();
//CheckYellowCrossAlignment();
AllignYellowWalls();
});

const SolveMiddle = document.getElementById('SolveMiddle');
SolveMiddle.addEventListener('click', async () => {
    await SolveMiddleLayer();
});


const YelloCross = document.getElementById('YellowCross');
YelloCross.addEventListener('click', async () => {
    await SolveYellowCross();

});

const Solve = document.getElementById('Solve');
Solve.addEventListener('click', async () => {
    await solveWhiteCross();
    await solveWhiteCorners();
    await SolveMiddleLayer();

});




WhiteCross.addEventListener('click', async () => {
    solveWhiteCross();
    console.log('count:', counter);
});

WhiteCorners.addEventListener('click', async () => {
    solveWhiteCorners();
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