import * as THREE from 'three';
import Hammer from 'hammerjs';
import extinctionJson from './extinction.json';
import '../styles/main.scss';

let camera, scene, renderer, yearTimeout, displayedYear, raycaster, tooltip;
const data = {};
let mouse = new THREE.Vector2(),
  INTERSECTED;
let mousePosition = { x: 0, y: 0 };
const START_YEAR = 1450;
const END_YEAR = 2020;
let xDown = null;
let yDown = null;

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
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222);
  scene.fog = new THREE.FogExp2(0x222, 0.0018);

  raycaster = new THREE.Raycaster();

  renderer = new THREE.WebGLRenderer({ antialias: true });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  const threeContainer = document.getElementById('three');
  document.getElementById('three').appendChild(renderer.domElement);

  const hammertime = new Hammer(document.body);
  hammertime.get('pinch').set({ enable: true });
  hammertime.on('pinch', function (ev) {
    console.log('event', ev);
  });

  document.getElementById('three');

  const yearUI = document.createElement('div');
  yearUI.classList.add('year');
  document.getElementById('top-ui').appendChild(yearUI);

  tooltip = document.createElement('div');
  tooltip.classList.add('tooltip');
  document.getElementById('tooltip-container').appendChild(tooltip);
  document.addEventListener('mousemove', onDocumentMouseMove, false);
  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );

  camera.position.set(0, 100, 0);

  // controls

  function onMouseWheel(e, swipeDisplacement) {
    const displacement = swipeDisplacement ? - swipeDisplacement * 10 : e.wheelDeltaY;
    const year = parseInt(camera.position.z / -10 + START_YEAR, 10);
    const nextyear = parseInt(
      (camera.position.z + displacement) / -10 + START_YEAR,
      10
    );
    if (nextyear > START_YEAR - 10 && nextyear < END_YEAR) {
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
      onMouseWheel(evt, yDiff);
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

  document.addEventListener('wheel', onMouseWheel, false);
  document.addEventListener('DOMMouseScroll', onMouseWheel, false);
  document.addEventListener('onmousewheel', onMouseWheel, false);
  document.addEventListener('touchstart', handleTouchStart, false);
  document.addEventListener('touchmove', handleTouchMove, false);

  // world

  var geometry = new THREE.BoxBufferGeometry(1, 1, 1);
  geometry.translate(0, 0.5, 0);
  const createMaterial = (color) =>
    new THREE.MeshPhongMaterial({
      color,
    });

  extinctionJson
    .filter((d) => d.year)
    .forEach((d, i) => {
      const kingdomColors = {
        ANIMALIA: 0xffaaaa,
        PLANTAE: 0xaaffcc,
      };
      const material = () => {
        if (d.redlistCategory === 'Extinct') {
          return createMaterial(0xffffff);
        }
        return createMaterial(kingdomColors[d.kingdomName] || 0xffffff);
      };

      var mesh = new THREE.Mesh(geometry, material());
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
      mesh.updateMatrix();
      mesh.matrixAutoUpdate = false;

      scene.add(mesh);

      data[mesh.uuid] = { ...d };
    });

  // lights

  var light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1);
  scene.add(light);

  var light = new THREE.DirectionalLight(0x002288);
  light.position.set(-1, -1, -1);
  scene.add(light);

  var light = new THREE.AmbientLight(0x222222);
  scene.add(light);

  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
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
  tooltip.innerHTML = `<div>${data.name}</div>`;
}

function clearTooltip() {
  tooltip.classList.remove('visible');
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

  renderer.render(scene, camera);
}
