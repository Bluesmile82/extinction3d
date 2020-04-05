import * as THREE from 'three';
import extinctionJson from './extinction.json';
import '../styles/main.scss';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import githubImage from '../images/icon-github.png';
import { isMobileOrTablet } from './utils';
// import Hammer from 'hammerjs';

const postprocessing = {};
let camera, scene, renderer, yearTimeout, displayedYear, raycaster, tooltip;
const data = {};
let mouse = new THREE.Vector2(),
  INTERSECTED;
let mousePosition = { x: 0, y: 0 };
const START_YEAR = 1450;
const END_YEAR = 2015;
let xDown = null;
let yDown = null;
let introVisible = true;
let outroVisible = false;

const intro = document.getElementById('intro');
const outro = document.getElementById('outro');

const mobileOrTablet = isMobileOrTablet();

document.getElementById('credit-image').src = githubImage;

init();
animate();


function handleTouchStart(evt) {
  xDown = evt.touches[0].clientX;
  yDown = evt.touches[0].clientY;
};

function onDocumentMouseMove(event) {
  event.preventDefault();
  mousePosition = { x: event.clientX, y: event.clientY };
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function init() {
  intro.classList.add("start");
  outro.classList.add("start");

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x08151E);
  scene.fog = new THREE.FogExp2(0x08151E, 0.0009);
  raycaster = new THREE.Raycaster();
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.getElementById('three').appendChild(renderer.domElement);

  // const hammertime = new Hammer(document.body);
  // hammertime.get('pinch').set({ enable: true });
  // hammertime.on('pinch', function (ev) {
  // });

  const yearUI = document.createElement('div');
  yearUI.classList.add('year');
  document.getElementById('top-ui').appendChild(yearUI);

  tooltip = document.createElement('div');
  tooltip.classList.add('tooltip');
  document.getElementById('tooltip-container').appendChild(tooltip);

  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(0, 100, 0);

  const cameraLight = new THREE.PointLight(0xffffff, 4, 1000);
  cameraLight.position.set(0, 100, 0);
  scene.add(cameraLight);

  // controls

  function onMouseWheel(e, swipeDisplacement) {
    const displacement = swipeDisplacement ? - swipeDisplacement * 10 : e.wheelDeltaY;
    const year = parseInt(camera.position.z / -10 + START_YEAR, 10);
    const nextyear = parseInt(
      (camera.position.z + displacement) / -10 + START_YEAR,
      10
    );
    if (nextyear > START_YEAR - 10 && nextyear < END_YEAR) {
      if (introVisible) {
        intro.classList.add('out');
        introVisible = false;
      }
      if (!introVisible && nextyear <= START_YEAR) {
        intro.classList.remove('out');
        intro.classList.add('in');
        introVisible = true;
      }

      if (!outroVisible && nextyear >= END_YEAR - 10) {
        clearTimeout(yearTimeout);
        yearUI.classList.add('out');
        outro.classList.remove('out');
        outro.classList.add('in');
        outroVisible = true;
      }
      if (outroVisible && nextyear < END_YEAR - 10) {
        const outro = document.getElementById('outro');
        outro.classList.add('out');
        outroVisible = false;
      }

      const roundedYear = Math.round(year / 10) * 10;

      if (
        (displayedYear !== roundedYear && roundedYear % 100 === 0) ||
        (roundedYear > 1890 && roundedYear % 10 === 0)
      ) {
        clearTimeout(yearTimeout);
        yearUI.classList.remove('in');
        yearUI.classList.remove('out');
        yearUI.innerHTML = `${roundedYear}`;
        yearUI.classList.add('in');
        yearTimeout = setTimeout(function () {
          yearUI.classList.add('out');
        }, 2000);

        displayedYear = roundedYear;
      }
      cameraLight.position.set(
        camera.position.x,
        camera.position.y,
        camera.position.z + displacement
      );
      camera.position.set(
        camera.position.x,
        camera.position.y,
        camera.position.z + displacement
      );
    }
  }

  function handleTouchMove(evt) {
    if (!xDown || !yDown) {
      return;
    }
    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;
    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      /*most significant*/
      if (xDiff > 0) {
        /* left swipe */
      } else {
        /* right swipe */
      }
    } else {
      const displacement = parseInt(Math.abs(yDiff), 10);

      for (let i = parseInt(displacement, 10); i-- ; i > 0) {
        setTimeout(() => {
          onMouseWheel(evt, yDiff / 5);
        }, i * 50);
      }
      if (yDiff > 0) {
        /* up swipe */
      } else {
        /* down swipe */
      }
    }
    /* reset values */
    xDown = null;
    yDown = null;
  }

  const handleClick = () => {
    if (INTERSECTED && !mobileOrTablet) {
      window.open(
        `https://en.wikipedia.org/wiki/${data[INTERSECTED.uuid].name}`,
        '_blank'
      );
    }
  }

  document.addEventListener('mousemove', onDocumentMouseMove, false);
  document.addEventListener('wheel', onMouseWheel, false);
  document.addEventListener('DOMMouseScroll', onMouseWheel, false);
  document.addEventListener('onmousewheel', onMouseWheel, false);
  document.addEventListener('touchstart', handleTouchStart, false);
  document.addEventListener('touchmove', handleTouchMove, false);
  document.addEventListener('click', handleClick, false);

  // WORLD

  const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
  const sphereGeometry = new THREE.SphereGeometry(1, 10, 10);

  geometry.translate(0, 0, 0);
  const createMaterial = (color) =>
    new THREE.MeshStandardMaterial({
      color,
      metalness: 0.5,
      roughness: 0.2
    });

  extinctionJson
    .filter((d) => d.year)
    .forEach((d, i) => {
      const kingdomColors = {
        ANIMALIA: 0x552222,
        PLANTAE: 0x73956f,
      };

      const material = () => {
        const createdMaterial = createMaterial(kingdomColors[d.kingdomName] || 0xffffff);
        return createdMaterial;
      }

      var mesh = new THREE.Mesh(
        d.redlistCategory === 'Extinct' ? geometry : sphereGeometry,
        material()
      );
      mesh.position.z = (START_YEAR - d.year) * 10;
      mesh.position.y = Math.random() * 200;
      mesh.position.x = Math.random() * 250 - 100;
      mesh.rotation.y = Math.random() * 90;
      mesh.rotation.z = Math.random() * 90;
      const scale =
        Math.random() * 8 + (d.redlistCategory === 'Extinct' ? 8 : 1);
      mesh.scale.x = scale;
      mesh.scale.y = scale;
      mesh.scale.z = scale;
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();

      scene.add(mesh);

      data[mesh.uuid] = { ...d };
    });

  // LIGHTS

  var light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(-100, 1, 1);
  scene.add(light);

  var backLight = new THREE.DirectionalLight(0xfffff, 5);
  backLight.position.set(10, 1, -100);
  scene.add(backLight);

  // var light = new THREE.DirectionalLight(0x002288);
  // light.position.set(-1, -1, -1);
  // scene.add(light);


  var light = new THREE.AmbientLight(0x08151e);
  scene.add(light);

  window.addEventListener('resize', onWindowResize, false);


  initPostprocessing();
  renderer.autoClear = false;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  postprocessing.composer.setSize(window.innerWidth, window.innerHeight);
}

function initPostprocessing() {
  var renderPass = new RenderPass(scene, camera);

  var bokehPass = new BokehPass(scene, camera, {
    focus: 20.0,
    aperture: 1.1 * 0.00001,
    maxblur: 0.0125,
    width: window.innerWidth,
    height: window.innerHeight,
  });

  var composer = new EffectComposer(renderer);

  composer.addPass(renderPass);
  composer.addPass(bokehPass);

  postprocessing.composer = composer;
  postprocessing.bokeh = bokehPass;
}

function animate() {
  requestAnimationFrame(animate);
  // controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
  render();
}

function showTooltip(data) {
  tooltip.classList.add('visible');
  tooltip.style.left = `${mousePosition.x}px`;
  tooltip.style.top = `${mousePosition.y}px`;
  tooltip.parentElement.style.cursor = 'pointer';

  tooltip.innerHTML = `
    <div class="tooltip-item">
      <div class="tooltip-name">
      ${data.name}
      </div>
      <div class="kingdom-name">
        ${data.kingdomName} - ${data.speciesClassName}
      </div>
      ${mobileOrTablet ? '' : `<div class="tooltip-message">Click to open wikipedia page</div>`}
    </div>
  `;
}

function clearTooltip() {
  tooltip.classList.remove('visible');
  tooltip.parentElement.style.cursor = 'auto';
}

function render() {
  // find intersections

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    if (INTERSECTED !== intersects[0].object) {
      if (INTERSECTED) {
        INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
      }
      INTERSECTED = intersects[0].object;
      INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      INTERSECTED.material.emissive.setHex(0xfffff);
      showTooltip(data[INTERSECTED.uuid]);
    }
  } else {
    if (INTERSECTED) {
      INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
      showTooltip(data[INTERSECTED.uuid]);
    } else {
      clearTooltip();
    }
    INTERSECTED = null;
  }

	postprocessing.composer.render(0.1);
  // renderer.render(scene, camera);
}
