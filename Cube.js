import * as THREE from 'three';


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
    
    cubelet.userData.id = id;

    cubelet.position.set(x * spacing, y * spacing, z * spacing);

    return cubelet;
}
const cubelets = [];
// black 0x000000 white 0xffffff red 0xff0000  yellow 0xFFFF00 blue 0x0000ff green 0x009b48 orange 0xffa500 grey 0x808080 
//top layer
export function pushCubelets(){
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

cubelets.push(createCubelet('XXX', 4, 0, 0, 0x00ffff  , 0x00ffff, 0x00ffff, 0x00ffff, 0x00ffff, 0x00ffff ));
cubelets.push(createCubelet('YYY', 0, 4, 0, 0x4b0082  , 0x4b0082, 0x4b0082, 0x4b0082, 0x4b0082, 0x4b0082 ));
cubelets.push(createCubelet('ZZZ', 0, 0, 4, 0xabc12  , 0xabc12, 0xabc12, 0xabc12, 0xabc12, 0xabc12 ));

return cubelets;
}
