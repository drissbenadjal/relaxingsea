import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.min.js';
import { fragmentShaderImage, vertexShaderImage } from './Shaders/BirdShader.js';
import { fragmentShaderBg, vertexShaderBg } from './Shaders/BgShader.js';
import { fragmentShaderWater, vertexShaderWater } from './Shaders/WaterShader.js';
import { fragmentShaderWaterNight, vertexShaderWaterNight } from './Shaders/WaterShaderNight.js';
import { fragmentShaderSun, vertexShaderSun } from './Shaders/SunShader.js';
import { fragmentShaderMoon, vertexShaderMoon } from './Shaders/MoonShader.js';
import { OrbitControls } from './OrbitControls.js';
import { GLTFLoader } from './GLTFLoader.js';

const DOLPHIN_COUNT = 3
const dolphins = []

let kaarisMode = false;

//regarder le local time pour le soleil
let baseTime = new Date();
let time = baseTime.getHours();

//0 is day mode and 1 is night mode
let mode = time > 18 || time < 6 ? 1 : 0;

const btnStart = document.querySelector('#start');
const startScreen = document.querySelector('.start_screen');

let audioMute = true;

let audio = new Audio('../assets/soundbg.mp3');
let mouetteAudio = new Audio('../assets/mouettes.mp3');
let waveAudio = new Audio('../assets/soundwave.mp3');
let relaxingAudio = new Audio('../assets/relaxingsong.mp3');

//attendre que tout les son soit charger faire disparaitre le loader
let audioLoaded = 0;
let audioTab = [audio, mouetteAudio, waveAudio, relaxingAudio];
audioTab.forEach(audio => {
    audio.addEventListener('loadeddata', () => {
        audioLoaded++;
        if (audioLoaded === 4) {
            setTimeout(() => {
                document.querySelector('.loader').style.opacity = 0;
                setTimeout(() => {
                    document.querySelector('.loader').style.display = 'none';
                }, 1000);
            }, 1200);
        }
    });
});

document.querySelectorAll('.togglesound').forEach(btn => {
    btn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            mouetteAudio.play();
            waveAudio.play();
            relaxingAudio.play();

            btn.classList.remove('mute');
            btn.classList.add('unmute');
            audioMute = false;
        } else {
            audio.pause();
            mouetteAudio.pause();
            waveAudio.pause();
            relaxingAudio.pause();

            btn.classList.remove('unmute');
            btn.classList.add('mute');
            audioMute = true;
        }
    });
});

document.addEventListener('keydown', (event) => {
    if (event.key === 's') {
        if (audio.paused) {
            audio.play();
            mouetteAudio.play();
            waveAudio.play();
            relaxingAudio.play();

            document.querySelector('.togglesound').classList.remove('mute');
            document.querySelector('.togglesound').classList.add('unmute');
            audioMute = false;
        } else {
            audio.pause();
            mouetteAudio.pause();
            waveAudio.pause();
            relaxingAudio.pause();

            document.querySelector('.togglesound').classList.remove('unmute');
            document.querySelector('.togglesound').classList.add('mute');
            audioMute = true;
        }
    }
});

btnStart.addEventListener('click', () => {
    audio.play();
    audio.loop = true;
    audio.volume = 0.3;

    mouetteAudio.play();
    mouetteAudio.loop = true;
    mouetteAudio.volume = 0.1;

    waveAudio.play();
    waveAudio.loop = true;
    waveAudio.volume = 0.2;

    relaxingAudio.play();
    relaxingAudio.loop = true;
    relaxingAudio.volume = 0.2;

    audioMute = false;

    document.querySelector('.togglesound').classList.remove('mute');
    document.querySelector('.togglesound').classList.add('unmute');

    startScreen.style.opacity = 0;
    setTimeout(() => {
        startScreen.style.display = 'none';
    }, 1000);
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
// const orbit = new OrbitControls(camera, renderer.domElement);


//mettre le fond de la scene en blanc
scene.background = new THREE.Color(0x000000);

// // Définir la couleur du brouillard et son intensité
// const fogColor = 0xc9e2f5; // Couleur bleu clair
// const fogDensity = 2.02; // Densité du brouillard
// scene.fog = new THREE.FogExp2(fogColor, fogDensity);
// renderer.setClearColor(fogColor); // Associer la couleur de fond avec celle du brouillard

// Ajouter une lumière directionnelle
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Lumière d'appoint
const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(50, 50, 50);
scene.add(pointLight);

// Lumière d'ambiance plus douce
const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Lumière ambiante avec une couleur douce
scene.add(ambientLight);

//faire un rectangle noir qui englobe le reste avec une fasse ouverte
const rectGeometry = new THREE.BoxGeometry(200, 117, 210);
const rectMaterials = [
    // 0x000000
    // 0xfffffff
    new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide })
];
const rect = new THREE.Mesh(rectGeometry, rectMaterials);
rect.position.set(0, 0, 0);
rect.position.z = -5;
rect.position.y = 45;
scene.add(rect);

//mettre un plane par terre
const planeGeometry = new THREE.PlaneGeometry(1000, 200, 30, 30);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.position.y = -113.5;
plane.position.x = 110;
//le raprocher de la camera
plane.position.z = 100;
scene.add(plane);

// Créer une sphère et charger l'image de fond
const geometryBG = new THREE.DodecahedronGeometry(98, 150);
const textureBG = new THREE.TextureLoader().load('assets/skycrepuscule.png');

const materialBG = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 100.0 },
        uTexture: { value: textureBG }
    },
    fragmentShader: fragmentShaderBg,
    vertexShader: vertexShaderBg,
    side: THREE.BackSide // Rend les faces internes de la sphère visibles
});

const planeBG = new THREE.Mesh(geometryBG, materialBG);
scene.add(planeBG);

// Placer comme si c'était le ciel
planeBG.position.z = -1;

const textureSun = new THREE.TextureLoader().load('assets/sun.png');
const geometrySun = new THREE.SphereGeometry(5, 222, 222);
const materialSun = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
        time: { value: 100.0 },
        uTexture: { value: textureSun },
    },
    fragmentShader: fragmentShaderSun,
    vertexShader: vertexShaderSun,
});

const planeSun = new THREE.Mesh(geometrySun, materialSun);
planeSun.position.z = -130; // Positionner le soleil en arrière-plan
planeSun.position.y = -10;
//faire un rendom en -60 et 20
planeSun.position.x = Math.random() * 40 - 15;
planeSun.scale.set(10, 10, 10);
scene.add(planeSun);

// Créer un plan pour le sol (eau)
const textureGround = new THREE.TextureLoader().load('assets/watercrepuscule_four.png');
textureGround.wrapS = THREE.RepeatWrapping;
textureGround.wrapT = THREE.RepeatWrapping;
const geometryGround = new THREE.PlaneGeometry(200, 230, 30, 30); // Plus de subdivisions pour des vagues plus douces
const materialGround = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 1.0 },
        amplitude: { value: 0.95 },
        frequency: { value: 4.5 },
        speed: { value: 1.5 },
        opacity: { value: 1.0 },
        uTexture: { value: textureGround },
        night: { value: false }
    },
    fragmentShader: fragmentShaderWater,
    vertexShader: vertexShaderWater,
    side: THREE.DoubleSide,
    transparent: true
});

const planeGround = new THREE.Mesh(geometryGround, materialGround);
planeGround.rotation.x = -Math.PI / 2;
planeGround.position.y = -10;
scene.add(planeGround);

// Créer un oiseau
const geometry = new THREE.PlaneGeometry(1.2, 3);
const texture = new THREE.TextureLoader().load('assets/bird.png');

const createNewBird = ({ birdNight }) => {
    const material = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
            time: { value: 1.0 },
            birdNight: { value: birdNight },
            uTexture: { value: texture },
        },
        fragmentShader: fragmentShaderImage,
        vertexShader: vertexShaderImage,
        side: THREE.DoubleSide
    });

    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.z = Math.PI / 2;
    if (birdNight) {
        //decaler les oiseaux sur la droite
        plane.position.x = Math.random() * 170 + 150;
    } else {
        plane.position.x = Math.random() * 80 - 35;
    }
    plane.position.y = Math.random() * 2 - 0;
    plane.position.z = Math.random() * 10 - 10.5;
    const scale = Math.random() * 5.5;
    plane.scale.set(scale, scale, scale);

    scene.add(plane);
};

// Créer plusieurs oiseaux
for (let i = 0; i < 10; i++) {
    let birdNight = false;
    createNewBird({ birdNight });
}

for (let i = 0; i < 10; i++) {
    let birdNight = true;
    createNewBird({ birdNight });
}




const rectSecondGeometry = new THREE.BoxGeometry(200, 117, 210);
const rectSecond = new THREE.Mesh(rectSecondGeometry, rectMaterials);
//decaler la box la mettre cote a cote a droite
rectSecond.position.set(0, 0, 0);
rectSecond.position.z = -5;
rectSecond.position.y = 45;
rectSecond.position.x = 200;
scene.add(rectSecond);

const skyNight = new THREE.TextureLoader().load('assets/sky_night.png');
const geometryNight = new THREE.DodecahedronGeometry(98, 150);
const materialNight = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 100.0 },
        uTexture: { value: skyNight },
    },
    fragmentShader: fragmentShaderBg,
    vertexShader: vertexShaderBg,
    side: THREE.BackSide
});

const planeNight = new THREE.Mesh(geometryNight, materialNight);
scene.add(planeNight);
planeNight.rotation.y = 30;
planeNight.position.z = -1;
planeNight.position.x = 200;


const textureMoon = new THREE.TextureLoader().load('assets/moon.png');
const geometryMoon = new THREE.SphereGeometry(5, 222, 222);
const materialMoon = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
        time: { value: 1.0 },
        uTexture: { value: textureMoon },
    },
    fragmentShader: fragmentShaderMoon,
    vertexShader: vertexShaderMoon,
});

const planeMoon = new THREE.Mesh(geometryMoon, materialMoon);
planeMoon.position.z = -80;
planeMoon.position.y = 48;
planeMoon.position.x = 150;
planeMoon.scale.set(2, 2, 2);
planeMoon.rotation.y = -120;

scene.add(planeMoon);

const textureWaterNight = new THREE.TextureLoader().load('assets/water_night.png');
const geometryWaterNight = new THREE.PlaneGeometry(200, 200, 30, 30);
const materialWaterNight = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 1.0 },
        amplitude: { value: 0.95 },
        frequency: { value: 4.5 },
        speed: { value: 1.5 },
        opacity: { value: 1.0 },
        uTexture: { value: textureWaterNight },
        night: { value: true }
    },
    fragmentShader: fragmentShaderWaterNight,
    vertexShader: vertexShaderWaterNight,
    side: THREE.DoubleSide
});

const planeWaterNight = new THREE.Mesh(geometryWaterNight, materialWaterNight);
planeWaterNight.rotation.x = -Math.PI / 2;
planeWaterNight.position.y = -10;
planeWaterNight.position.x = 200;
scene.add(planeWaterNight);



// Variable to store the dolphin object
let dolphinMesh = null;

// Load the dolphin model and store it in the variable
const dolphinLoader = new GLTFLoader();
dolphinLoader.load('assets/dolphin.glb', (gltf) => {
    dolphinMesh = gltf.scene;
    dolphinMesh.scale.set(2, 2, 2);

    dolphinMesh.rotation.y = 1.5;

    // dolphinGroup.add(dolphinMesh)

    // Adjust the dolphin material if necessary
    const { map } = dolphinMesh.children[0].material;
    dolphinMesh.children[0].material = new THREE.MeshBasicMaterial({ map });

    for (let i = 0; i < DOLPHIN_COUNT; i++) {
        const angle = Math.random();



        const dolphinGroup = new THREE.Group();

        dolphinGroup.add(dolphinMesh.clone());
        if (i == 0) {
            dolphinGroup.position.set(30, -20, -80);
        } else if (i == 1) {
            dolphinGroup.position.set(-30, -20, -30);
        } else {
            dolphinGroup.position.set(20, -20, 10);
        }
        dolphins.push(dolphinGroup);

        scene.add(dolphinGroup)
    }
});

// scene.add(dolphinGroup)

let animDolphin = false;
let dolphinAudio = new Audio('../assets/dolphinsound.mp3');


const animateDolphin = () => {
    // if (mode === 1) return;
    if (animDolphin) return;
    animDolphin = true;
    dolphinAudio.play();
    dolphinAudio.volume = 0.5;
    setTimeout(() => {
        dolphinAudio.pause();
        dolphinAudio.currentTime = 0;
        animDolphin = false;
    }, 3000);
};

//quand on clique sur la touche d sa fait tourner le dauphin
document.addEventListener('keydown', (event) => {
    if (event.key === 'd') {
        animateDolphin();
    }
});

document.querySelector('#dkeyimg').addEventListener('click', () => {
    animateDolphin();
});


if (mode === 0) {
    camera.position.set(-4, -1.0373190074615026, 60.036474208242726);
    // camera.lookAt(planeMoon.position);
} else {
    camera.position.set(200, -1.0373190074615026, 60.036474208242726);
}

const centerViewPointNight = new THREE.Vector3(200, 0, 0);
const centerViewPoint = new THREE.Vector3(0, 0, 0);

camera.lookAt(centerViewPoint);
// camera.position.set(200, -1.0373190074615026, 60.036474208242726);

const initialCameraPosition = new THREE.Vector3(
    camera.position.x,
    camera.position.y,
    camera.position.z
);

const initialCameraPositionNight = new THREE.Vector3(
    camera.position.x + 200,
    camera.position.y,
    camera.position.z
);

// Variables pour gérer la position de la caméra
let mouseInside = true;
let targetCameraPosition = initialCameraPosition.clone();
let targetCameraPositionNight = initialCameraPositionNight.clone();
let smoothFactor = 0.05; // Facteur pour lisser la transition de la caméra

// Écouteur pour détecter la sortie de la souris de la fenêtre
document.addEventListener('mouseleave', () => {
    mouseInside = false;
    if (mode === 0) {
        targetCameraPosition.copy(initialCameraPosition);
    } else {
        targetCameraPositionNight.copy(initialCameraPositionNight);
    }
});

// Écouteur pour détecter l'entrée de la souris dans la fenêtre
document.addEventListener('mouseenter', () => {
    mouseInside = true;
});

// Parallaxe en fonction du mouvement de la souris
document.addEventListener('mousemove', (event) => {
    if (mouseInside) {
        if (mode === 0) {
            const x = event.clientX / window.innerWidth - 0.2;
            const y = event.clientY / window.innerHeight - 0.35;
            targetCameraPosition.x = x * -10;
            targetCameraPosition.y = y * -10;
            targetCameraPosition.z = camera.position.z;
        } else {
            const x = event.clientX / window.innerWidth - 0.2;
            const y = event.clientY / window.innerHeight - 0.35;
            targetCameraPositionNight.x = x * -10 + 200;
            targetCameraPositionNight.y = y * -10;
            targetCameraPositionNight.z = camera.position.z;
        }
    }
});


function smoothCameraTransition() {
    if (mode === 0) {
        camera.position.lerp(targetCameraPosition, smoothFactor);
        camera.lookAt(centerViewPoint);
    } else {
        camera.position.lerp(targetCameraPositionNight, smoothFactor);
        camera.lookAt(centerViewPointNight);
    }
}

let kaarisClickAudio = new Audio('../assets/ohclickkaaris.mp3');

const changeMode = () => {
    if (kaarisMode) {
        kaarisAudio.volume = 0.3;
        kaarisClickAudio.currentTime = 0;
        kaarisClickAudio.play();
        kaarisClickAudio.volume = 1;
        setTimeout(() => {
            kaarisAudio.volume = .7;
        }, 1500);
    }
    // console.log('mode', mode);
    mode = (mode === 0) ? 1 : 0;
    camera.position.x = (mode === 0) ? 200 : 0;
    camera.lookAt(mode === 0 ? centerViewPointNight : centerViewPoint);

    //changer la position des dauphins ajouter 200 a la position x et enlever 200
    dolphins.forEach(dolphin => {
        // console.log('dolphin', dolphin.position.x);
        dolphin.position.x = mode === 0 ? dolphin.position.x - 200 : dolphin.position.x + 200;
    });
};

//quand on appuie sur la touche m
document.addEventListener('keydown', (event) => {
    if (event.key === 'm') {
        changeMode();
    }
});

document.querySelector('#mkeyimg').addEventListener('click', () => {
    changeMode();
});


//easter egg

let kaarisPlane = null;
let kaarisPlaneNight = null;

const createKaaris = () => {
    const kaarisAspect = 1000 / 566;
    const kaarisTextured = new THREE.TextureLoader().load('assets/kaaris.jpg');
    const kaarisGeometry = new THREE.PlaneGeometry(1, 1);
    const kaarisMaterial = new THREE.MeshBasicMaterial({ map: kaarisTextured, side: THREE.DoubleSide });
    kaarisPlane = new THREE.Mesh(kaarisGeometry, kaarisMaterial);
    const kaarisSize = 120;
    kaarisPlane.scale.set(kaarisAspect * kaarisSize, kaarisSize, kaarisSize);

    // kaarisPlane.position.set(0, 0, 20);
    kaarisPlane.position.set(0, -70, -10);
    scene.add(kaarisPlane);
}


const createKaarisNight = () => {
    const kaarisAspect = 1000 / 566;
    const kaarisTextured = new THREE.TextureLoader().load('assets/kaaris.jpg');
    const kaarisGeometry = new THREE.PlaneGeometry(1, 1);
    const kaarisMaterial = new THREE.MeshBasicMaterial({ map: kaarisTextured, side: THREE.DoubleSide });
    kaarisPlaneNight = new THREE.Mesh(kaarisGeometry, kaarisMaterial);
    const kaarisSize = 120;
    kaarisPlaneNight.scale.set(kaarisAspect * kaarisSize, kaarisSize, kaarisSize);

    // kaarisPlane.position.set(0, 0, 20);
    kaarisPlaneNight.position.set(200, -70, -10);
    scene.add(kaarisPlaneNight);
}

let kaarisAudio = new Audio('../assets/kaariszoo.mp3');
// let kaarisAudio = new Audio('../assets/kaariszinzin.mp3');

//quand on fait le konami code ca lance le son de kaaris flait le konami code a la main sans lib
let konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
let konamiCodePosition = 0;
document.addEventListener('keydown', (event) => {
    if (event.keyCode === konamiCode[konamiCodePosition]) {
        konamiCodePosition++;
        if (konamiCodePosition === konamiCode.length) {
            kaarisAudio.play();
            kaarisAudio.volume = .7;
            // kaarisAudio.currentTime = 5;
            kaarisAudio.currentTime = 40;
            konamiCodePosition = 0;
            kaarisMode = true;

            createKaaris();
            createKaarisNight();

            //mettre en pause les autres sons
            audio.pause();
            mouetteAudio.pause();
            waveAudio.pause();
            relaxingAudio.pause();
        }
    } else {
        konamiCodePosition = 0;
    }
});

let lastTime = performance.now(); // Moment de départ

function animate() {
    requestAnimationFrame(animate);

    smoothCameraTransition();

    planeSun.rotation.y += 0.0001;
    planeSun.rotation.z += 0.0009;

    // Mettre à jour le temps pour l'eau
    materialGround.uniforms.time.value += 0.01;

    planeMoon.rotation.y += 0.00001;
    planeMoon.rotation.z += 0.00009;

    // Rotation douce du ciel
    planeBG.rotation.y -= 0.000009;
    planeBG.rotation.z += 0.000009;
    // planeBG.rotation.y += 0.09;

    // Rotation douce du ciel
    planeNight.rotation.y -= 0.0001;
    planeNight.rotation.z += 0.00009;

    if (kaarisPlane) {
        kaarisPlane.lookAt(camera.position);
        if (kaarisPlane.position.y <= 0) kaarisPlane.position.y += 0.3;
    }
    if (kaarisPlaneNight) {
        kaarisPlaneNight.lookAt(camera.position);
        if (kaarisPlaneNight.position.y <= 0) kaarisPlaneNight.position.y += 0.3;
    }

    const currentTime = performance.now();
    const delta = currentTime - lastTime;
    lastTime = currentTime;

    // Calcul des FPS (1 seconde = 1000 millisecondes)
    const fps = 1000 / delta;

    if (dolphins.length > 0) {
        for (let dolphin of dolphins) {
            const i = dolphins.indexOf(dolphin);
            if (animDolphin) {
                // console.log(fps);
                setTimeout(() => {
                    //si les fps sont a 120 ou plus on fait - .02 si c'est 61 ou moin on .05 et si c'est 31 ou moin on fait - 0.10
                    if (fps <= 40) {
                        // console.log('3');
                        dolphin.rotation.z -= 0.08;
                    } else if (fps <= 91) {
                        // console.log('2');
                        dolphin.rotation.z -= 0.045;
                    } else if (fps >= 92) {
                        dolphin.rotation.z -= 0.02;
                    }
                    // dolphin.rotation.z -= 0.02;
                }, (i + 1) * 200);
            } else {
                dolphin.rotation.z = -3;
            }
        }
        // Reset any unwanted rotation
        // dolphinMesh.rotation.set(0, 0, 0);
        // dolphinGroup.rotation.z -= 0.01;
    }


    // orbit.update();

    // Mettre à jour le temps pour les shaders
    scene.children.forEach((child, index) => {
        if (child.material instanceof THREE.ShaderMaterial) {
            child.material.uniforms.time.value = performance.now() / 1000;
            child.material.position = child.position;
        }
        //cibler les oiseaux et faire pour que ca fasse un peu vers le haut un peu vers le bas
        if (child.material instanceof THREE.ShaderMaterial && child.material.fragmentShader === fragmentShaderImage) {
            if (child.position.x > 150) {
                child.position.y += Math.sin(child.position.x * .001 + child.material.uniforms.time.value) * 0.01;
                child.position.x += Math.sin(child.position.y * .001 + child.material.uniforms.time.value) * 0.01;
            } else {
                child.position.y += Math.sin(child.position.x * .001 + child.material.uniforms.time.value) * 0.01;
                child.position.x += Math.sin(child.position.y * .001 + child.material.uniforms.time.value) * 0.01;
            }

        }
    });

    renderer.render(scene, camera);
}

animate();

// Mise à jour de la taille du rendu lors du redimensionnement de la fenêtre
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);