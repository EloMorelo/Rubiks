import { setFaceColor } from "./rubiks.js";

var page1Button = document.getElementById('page1Button');
var page2Button = document.getElementById('page2Button');
var page3Button = document.getElementById('page3Button');
var manualRotation = document.getElementById('manual-rotation');
var aligment = document.getElementById('aligment');
var coloring = document.getElementById('coloring');
var menu = document.getElementById('menu');
var goback = document.getElementById('go-back-button');



page1Button.addEventListener('click', () => {
    console.log('page1Button clicked');
    manualRotation.style.display = 'block';
    goback.style.display = 'block';
    menu.style.display = 'none';
});

page2Button.addEventListener('click', () => {
    console.log('page2Button clicked');
    coloring.style.display = 'block';
    goback.style.display = 'block';
    menu.style.display = 'none';
});

page3Button.addEventListener('click', () => {
    console.log('page3Button clicked');
    aligment.style.display = 'block';
    goback.style.display = 'block';
    menu.style.display = 'none';
});

goback.addEventListener('click', () => {
    console.log('goback clicked');
    manualRotation.style.display = 'none';
    coloring.style.display = 'none';
    aligment.style.display = 'none';
    goback.style.display = 'none';
    menu.style.display = 'block';
    setFaceColor(null);
});