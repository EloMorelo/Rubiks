import { pushCubelets } from './Cube.js';
import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import { cubelets } from './rubiks.js';



// const cubelets = pushCubelets();



export function getCubeletAtPosition(xTarget, yTarget, zTarget) {
    for (const cubelet of cubelets) {
        const { x, y, z } = cubelet.position;

        if (x === xTarget && y === yTarget && z === zTarget) {
            return cubelet;
        }
    }

    return null;
}

export function findWallPiece(primary, secondary){
    
    for (const cubelet of cubelets) {
        const { right, left, top, bottom, front, back } = getColorsFromCubelet(cubelet);
        const nonBlackColors = [right, left, top, bottom, front, back].filter(color => color !== 0x000000);

        if (nonBlackColors.length === 2 && nonBlackColors.includes(primary) && nonBlackColors.includes(secondary)) {
            return cubelet;
        }
    }
    return null;

}

export function findCornerPiece(primary, secondary, tertiary) {
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

export function getColorsFromCubelet(cubelet) {
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
export function checkColorDirection(cubelet, targetColor) {
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

export function isCubeletAtPosition(cubelet, xTarget, yTarget, zTarget) {
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

export function getRelativePositionOnWall(cubelet, wall) {
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

export function getCubeletWallWhiteFace(cubelet, whiteColor = 0xffffff) {
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


export function getCubeletWallColorFace(cubelet, whiteColor = 0xffffff) {
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

export function getCubeletWallMiddleFace(cubelet, color) {
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


export function getCubeletWall(cubelet) {
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

export function doesOtherFaceMatchSideWalls(cubelet, primaryColor, otherColor) {
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



export function checkPieceIfMiddleMatch(cubelet, color) {
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


export function getAdjacentWallToWhiteFace(cubelet, whiteColor = 0xffffff) {
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


export function getRightWallCorner(cubelet) {
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

export function CornerTwoWalls(cubelet)
{
    const { x, y, z } = cubelet.position;
    if (x === 1 && z === 1) {
        return {front:'front', right: 'right'};
    }
    else if (x === 1 && z === -1) {
            return {front:'right', right: 'back'};
    }
    else if (x === -1 && z === -1) {
            return {front:'back', right: 'left'};
    }
    else if (x === -1 && z === 1) {
            return {front:'left', right: 'front'};
    }
    else {
        return 'unknown';
    }
}

export function doesFaceMatchCenter(cubelet, color1, color2) {
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


export function CheckColorOfWall(wall){
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

export function CheckColorRightLeft (wall)
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