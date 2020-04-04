import * as THREE from 'three';
// import Hammer from 'hammerjs';
import extinctionJson from './extinction.json';
import '../styles/main.scss';
import githubImage from '../images/icon-github.png';

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

const isMobileOrTablet = function () {
  var check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};


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
  intro.classList.add("start")
  outro.classList.add("start")
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x08151E);
  scene.fog = new THREE.FogExp2(0x08151E, 0.0018);

  raycaster = new THREE.Raycaster();

  renderer = new THREE.WebGLRenderer({ antialias: true });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  const threeContainer = document.getElementById('three');
  document.getElementById('three').appendChild(renderer.domElement);

  // const hammertime = new Hammer(document.body);
  // hammertime.get('pinch').set({ enable: true });
  // hammertime.on('pinch', function (ev) {
  // });

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
    if (INTERSECTED && !isMobileOrTablet()) {
      window.open(
        `https://en.wikipedia.org/wiki/${data[INTERSECTED.uuid].name}`,
        '_blank'
      );
    }
  }

  document.addEventListener('wheel', onMouseWheel, false);
  document.addEventListener('DOMMouseScroll', onMouseWheel, false);
  document.addEventListener('onmousewheel', onMouseWheel, false);
  document.addEventListener('touchstart', handleTouchStart, false);
  document.addEventListener('touchmove', handleTouchMove, false);
  document.addEventListener('click', handleClick, false);

  // world

  const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
  const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

  geometry.translate(0, 0, 0);
  const createMaterial = (color) =>
    new THREE.MeshPhongMaterial({
      color,
    });

  extinctionJson
    .filter((d) => d.year)
    .forEach((d, i) => {
      const kingdomColors = {
        ANIMALIA: 0x552222,
        PLANTAE: 0x73956f,
      };

      const material = () => createMaterial(kingdomColors[d.kingdomName] || 0xffffff);

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

  var light = new THREE.AmbientLight(0x08151e);
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
  tooltip.parentElement.style.cursor = 'pointer';

  tooltip.innerHTML = `
    <div class="tooltip-item">
      <div class="tooltip-name">
      ${data.name}
      </div>
      <div class="kingdom-name">
        ${data.kingdomName} - ${data.speciesClassName}
      </div>
      ${isMobileOrTablet() ? '' : `<div class="tooltip-message">Click to open wikipedia page</div>`}
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

  renderer.render(scene, camera);
}
