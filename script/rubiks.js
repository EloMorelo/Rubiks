import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js';
import { pushCubelets } from './Cube.js';
import { getCubeletAtPosition, findWallPiece, findCornerPiece, getColorsFromCubelet , checkColorDirection, isCubeletAtPosition,
 getRelativePositionOnWall, getCubeletWall, getCubeletWallMiddleFace , getCubeletWallColorFace, getCubeletWallWhiteFace , checkPieceIfMiddleMatch , getAdjacentWallToWhiteFace,
 getRightWallCorner, CornerTwoWalls, doesFaceMatchCenter, CheckColorOfWall, CheckColorRightLeft, doesOtherFaceMatchSideWalls} from './GetInfo.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth * 0.5 / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth / 2 , window.innerHeight);
document.body.appendChild(renderer.domElement);
const originalColors = new Map();


scene.background = new THREE.Color(0x808080);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

export const cubelets = pushCubelets();
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
        console.log(faceIndex);
        if (faceIndex >= 0 && faceIndex < faceNames.length) {
            const targetColor = 0xffffff;
            checkColorDirection(clickedObject, targetColor);
            changeFaceColor(clickedObject, faceIndex, faceColor);
            console.log('Face color changed');
        } else {
        }
    }
}

function getFaceIndexFromIntersection(object, intersect) {
    if (object.geometry instanceof THREE.BoxGeometry) {
        const localIntersect = object.worldToLocal(intersect.point.clone());
        const size = object.geometry.parameters.width / 2;
        console.log(localIntersect);

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
        if (originalColor === blackColor || (cubelet.position.x === 0 && (cubelet.position.y === 1 || cubelet.position.y === -1 ) && cubelet.position.z === 0)
        ||  (cubelet.position.z === 0 && (cubelet.position.x === 1 || cubelet.position.x === -1 ) && cubelet.position.y === 0) || (cubelet.position.x === 0 && (cubelet.position.z === 1 || cubelet.position.z === -1 ) && cubelet.position.y === 0) ) {
            return;
        }

        cubelet.material[faceIndex].color.set(color);
    }
}



function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// 1. ----solve white cross---- fix 1 bottom' -> randomize 
async function solveWhiteCross() {
    const SolveWhiteCross = document.getElementById('SolveWhiteCross');
    SolveWhiteCross.disabled = true;


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
    
    SolveWhiteCross.disabled = false;
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

// 2. ----solve white corners----
async function solveWhiteCorners() {
    const SolveWhiteCorners = document.getElementById('SolveWhiteCorners');
    SolveWhiteCorners.disabled = true;
    
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
    
    SolveWhiteCorners.disabled = false;
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


// 3. ----solve middle layer----
async function solveMiddleLayer() {
    const SolveMiddleLayer = document.getElementById('SolveMiddleLayer');
    SolveMiddleLayer.disabled = true;

    try {

    const edgePieces = [
        { color1: 0x009b48, color2: 0xff0000, targetPos: { x: 1, y: 0, z: -1 } }, // Green-Red
        { color1: 0xff0000, color2: 0x0000ff, targetPos: { x: 1, y: 0, z: 1 } }, // Red-Blue
        { color1: 0xffa500, color2: 0x009b48, targetPos: { x: -1, y: 0, z: -1 } }, // Orange-Green
        { color1: 0xffa500, color2: 0x0000ff, targetPos: { x: -1, y: 0, z: 1 } }  // Blue-Orange
    ];

    for (const piece of edgePieces) {
        const cubelet = findWallPiece(piece.color1, piece.color2);

        if (isCubeletAtPosition(cubelet, piece.targetPos.x, piece.targetPos.y, piece.targetPos.z) && checkPieceIfMiddleMatch(cubelet, piece.color1)) {
            continue;
        }
        await MoveMiddleLayerToTop(cubelet,piece.color1);
        await RotateMiddleLayerToCorrectPosition(cubelet,piece.color1,piece.color2);
        await MoveMiddleLayerDownToCorrectPosition(cubelet,piece.color1,piece.color2);
    }
}
    catch (error) {
        console.error('An error occurred while solving the middle layer:', error);
    }
    finally {
        SolveMiddleLayer.disabled = false;
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


// 4. ----solve yellow cross----
async function solveYellowCrossPosition() {
    const SolveYellowCrossPosition = document.getElementById('SolveYellowCrossPosition');
    SolveYellowCrossPosition.disabled = true;

    try {
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
    catch (error) {
        console.error('An error occurred while solving the yellow cross:', error);
    }
    finally {
        SolveYellowCrossPosition.disabled = false;
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

    for (let i = 0; i < 4; i++) { 
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
    }
    for (let i = 0; i < (4 - maxRotation); i++) {
        await rotateWall('top', false);
    }

    return correctCubelets;
}

// 5. ----align yellow corners----
async function solveYellowCrossAlignment() {
    const SolveYellowCrossAlignment = document.getElementById('SolveYellowCrossAlignment');
    SolveYellowCrossAlignment.disabled = true;

    try {

    const Pieces = await CheckYellowCrossAlignment();
    const pieceCount = Object.keys(Pieces).length;
    if(pieceCount  === 2)
    {
        const colordirection1 = getCubeletWallMiddleFace(Pieces.cubelet1, 0xffff00);
        const colordirection2 = getCubeletWallMiddleFace(Pieces.cubelet2, 0xffff00);
        if((Pieces.cubelet1.position.x === 0 && Pieces.cubelet2.position.x === 0) || (Pieces.cubelet1.position.z === 0 && Pieces.cubelet2.position.z === 0))
        {
            const adjwall = CheckColorRightLeft(colordirection1.primaryWall);
            const rightwall = adjwall.rightWall;
            const adjwall2 = CheckColorRightLeft(colordirection2.primaryWall);
            const rightwall2 = adjwall2.rightWall;
            await rotateWall('top', true);
            await YellowMiddleAlgorithm(rightwall);
            await rotateWall('top', true);
            await YellowMiddleAlgorithm(rightwall2);
            await rotateWall('top', true);
        }
        else
        {
            const adjwalls = CheckColorRightLeft(colordirection1.primaryWall);
            const leftWall = adjwalls.leftWall;
            const rightWall = adjwalls.rightWall;
            const primaryWall1 = colordirection1.primaryWall;
            const primaryWall2 = colordirection2.primaryWall;
            if(leftWall === primaryWall2)
            {

                console.log(leftWall);
                await YellowMiddleAlgorithm(leftWall);
                await rotateWall('top', true);
            }
            if(rightWall === primaryWall2)
            {
                console.log(primaryWall1);
                await YellowMiddleAlgorithm(primaryWall1);
                await rotateWall('top', true);
            }
        }

    if(pieceCount  === 4)
    {
        console.log('All corners are already aligned.');
    }
}
    }
    catch (error) {
        console.error('An error occurred while solving the yellow cross:', error);
    }
    finally {
        SolveYellowCrossAlignment.disabled = false;
    }
}

async function YellowMiddleAlgorithm(wall) {
    await rotateWall(wall, true);
    await rotateWall('top', true);
    await rotateWall(wall, false);
    await rotateWall('top', true);
    await rotateWall(wall, true);
    await rotateWall('top', true);
    await rotateWall('top', true);
    await rotateWall(wall, false);
    
}

//6. ----solve yellow corners----this needs fixing
async function solveYelowCornersPosition() {
    const SolveYelowCornersPosition = document.getElementById('SolveYelowCornersPosition');
    SolveYelowCornersPosition.disabled = true;

    const edgePieces = [
        { color1: 0xFFFF00, color2: 0xff0000, color3: 0x009b48, targetPos: { x: 1, y: 1, z: -1 } }, // Yellow-Red-Green
        { color1: 0xFFFF00, color2: 0xff0000, color3: 0x0000ff, targetPos: { x: 1, y: 1, z: 1 } }, // Yellow-Red-Blue
        { color1: 0xFFFF00, color2: 0x0000ff, color3: 0xffa500, targetPos: { x: -1, y: 1, z: 1 } }, // Yellow-Blue-Orange
        { color1: 0xFFFF00, color2: 0x009b48, color3: 0xffa500, targetPos: { x: -1, y: 1, z: -1 } }  // Yellow-Green-Orange
    ];
    const correctCubelets = [];
    function checkCorrectPositions() {
        return edgePieces.filter(edge => {
            const cubelet = findCornerPiece(edge.color1, edge.color2, edge.color3);
            if (isCubeletAtPosition(cubelet, edge.targetPos.x, edge.targetPos.y, edge.targetPos.z)) {
                correctCubelets.push(cubelet);
                return true;
            }
            return false;
        });
    }
    let correct = checkCorrectPositions().length;
    if (correct === 0) {
        await SwapYellowCorners('front');
        correct = checkCorrectPositions().length;
    }

    if (correct === 0) {
        await SwapYellowCorners('front');
        correct = checkCorrectPositions().length;
    }

    if (correct === 1) {
        const rtccubelet = correctCubelets[0];
        const wall = CornerTwoWalls(rtccubelet);
        await SwapYellowCorners(wall.front);
        correct = checkCorrectPositions().length;

    }

    if (correct === 1) {
        const rtccubelet = correctCubelets[0];
        const wall = CornerTwoWalls(rtccubelet);
        await SwapYellowCorners(wall.front);
        correct = checkCorrectPositions().length;
    }

    try {

    }
    catch (error) {
        console.error('An error occurred while solving the yellow corners:', error);
    }
    finally {
        SolveYelowCornersPosition.disabled = false;
    }
}


// 7. ----align yellow corners---- 
async function solveYellowCornersRotation() {
    const SolveYellowCornersRotation = document.getElementById('SolveYellowCornersRotation');
    SolveYellowCornersRotation.disabled = true; 

    try {
        const cornerPieces = [
            { color1: 0xffff00, color2: 0xff0000, color3: 0x009b48, targetPos: { x: 1, y: 1, z: -1 } }, // Yellow-Red-Green
            { color1: 0xffff00, color2: 0x009b48, color3: 0xffa500, targetPos: { x: -1, y: 1, z: -1 } },  // Yellow-Green-Orange
            { color1: 0xffff00, color2: 0x0000ff, color3: 0xffa500, targetPos: { x: -1, y: 1, z: 1 } },  // Yellow-Blue-Orange
            { color1: 0xffff00, color2: 0xff0000, color3: 0x0000ff, targetPos: { x: 1, y: 1, z: 1 } }  // Yellow-Red-Blue
        ];
        let count = 0;
        const correctRotation = '+y';
        let Rightwall = null;
        for (let i = 0; i < 4; i++) { 
            const piece = cornerPieces[i];
            const cubelet = findCornerPiece(piece.color1, piece.color2, piece.color3);
            let rotation = checkColorDirection(cubelet, 0xffff00);
            if (rotation !== correctRotation) {
                if(!Rightwall)
                {
                    const walls = CornerTwoWalls(cubelet);
                    Rightwall = walls.right;
                    console.log('Rightwall is set to:', Rightwall);

                }
            }
            while (rotation !== correctRotation) {
                await RDRD(Rightwall);
                rotation = checkColorDirection(cubelet, 0xffff00); 
            }
            if(Rightwall !== null)
            {
            await rotateWall('top', true);
            count++;
            }
        }
        for (let i = 0; i < count; i++) 
            {
            await rotateWall('top', false);
        }   

        console.log('All yellow corners are correctly oriented.');

    } catch (error) {
        console.error('An error occurred while aligning the yellow edges:', error);
    } finally {
        SolveYellowCornersRotation.disabled = false;
    }
}

async function RDRD(wall) {
    await rotateWall(wall, false);
    await rotateWall('bottom', false);
    await rotateWall(wall, true);
    await rotateWall('bottom', true);
}
async function SwapYellowCorners(front) {
    const adjwall = CheckColorRightLeft(front);
    await rotateWall('top', true);
    await rotateWall(adjwall.rightWall, true);
    await rotateWall('top', false);
    await rotateWall(adjwall.leftWall, false);
    await rotateWall('top', true);
    await rotateWall(adjwall.rightWall, false);
    await rotateWall('top', false);
    await rotateWall(adjwall.leftWall, true);
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
Random.addEventListener('click', async () => {
    await Randomzie();
});


SolveWhiteCross.addEventListener('click', async () => {
    await solveWhiteCross();
    console.log('count:', counter);
});

SolveWhiteCorners.addEventListener('click', async () => {
    await solveWhiteCorners();
    console.log('count:', counter);
});

SolveMiddleLayer.addEventListener('click', async () => {
    await solveMiddleLayer();
});


SolveYellowCrossPosition.addEventListener('click', async () => {
    await solveYellowCrossPosition();

});

SolveYellowCrossAlignment.addEventListener('click', async () => {
    await solveYellowCrossAlignment();
});

SolveYelowCornersPosition.addEventListener('click', async () => {
    await solveYelowCornersPosition();
});

SolveYellowCornersRotation.addEventListener('click', async () => {
    await solveYellowCornersRotation();
});



const Solve = document.getElementById('Solve');
Solve.addEventListener('click', async () => {
    await solveWhiteCross();
    await solveWhiteCorners();
    await solveMiddleLayer();
    await solveYellowCrossPosition();
    await solveYellowCrossAlignment();
    await solveYelowCornersPosition();
    await solveYellowCornersRotation();

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