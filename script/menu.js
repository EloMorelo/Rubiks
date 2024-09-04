import { setFaceColor } from "./rubiks.js";

var page1Button = document.getElementById('page1Button');
var page2Button = document.getElementById('page2Button');
var page3Button = document.getElementById('page3Button');
var manualRotation = document.getElementById('manual-rotation');
export var aligment = document.getElementById('aligment');
var coloring = document.getElementById('coloring');
var menu = document.getElementById('menu');
var goback = document.getElementById('go-back-button');
var rotationSpeed = document.getElementById('rotation-speed-div');


page1Button.addEventListener('click', () => {
    console.log('page1Button clicked');
    manualRotation.style.display = 'block';
    goback.style.display = 'block';
    menu.style.display = 'none';
    rotationSpeed.style.display = 'block';
});

page2Button.addEventListener('click', () => {
    console.log('page2Button clicked');
    coloring.style.display = 'block';
    goback.style.display = 'block';
    menu.style.display = 'none';
    rotationSpeed.style.display = 'block';
});

page3Button.addEventListener('click', () => {
    console.log('page3Button clicked');
    aligment.style.display = 'block';
    goback.style.display = 'block';
    menu.style.display = 'none';
    rotationSpeed.style.display = 'block';
});

goback.addEventListener('click', () => {
    console.log('goback clicked');
    manualRotation.style.display = 'none';
    coloring.style.display = 'none';
    aligment.style.display = 'none';
    goback.style.display = 'none';
    menu.style.display = 'block';
    rotationSpeed.style.display = 'none';
    setFaceColor(null);
});