import * as THREE from "three";
import { OrbitControls as ThreeOrbitControls } from "three/examples/jsm/controls/OrbitControls";
import ThreeGlobe from "three-globe";
import globeData from "./data/data.json";
import mapData from "./data/map.json";

import "normalize.css";
import "./base.css";

const height = 800;
const width = 800;

let controls;
let camera = new THREE.PerspectiveCamera();
let scene = new THREE.Scene();
let clock = new THREE.Clock();
let renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});;

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update(clock.getDelta());
  renderer.render(scene, camera);
}

window.onload = () => {
  const container = document.createElement('div');
  const wrapper = document.getElementById('wrapper');

  container.classList.add('container');
  container.style.height = height;
  container.style.width = width;

  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  container.appendChild(renderer.domElement);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  const primaryLight = new THREE.DirectionalLight(0xffffff, 0.8);
  primaryLight.position.set(-800, 2000, 400);
  camera.add(primaryLight);

  const secondaryLight = new THREE.DirectionalLight(0x7982f6, 1);
  secondaryLight.position.set(-200, 500, 200);
  camera.add(secondaryLight);

  const tertiaryLight = new THREE.PointLight(0x8566cc, 0.5);
  tertiaryLight.position.set(-200, 500, 200);
  camera.add(tertiaryLight);

  camera.position.z = 320;
  camera.position.x = 0;
  camera.position.y = 0;

  controls = new ThreeOrbitControls(camera, renderer.domElement);

  controls.enabled = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.15;

  renderer.setSize(width, height);

  scene.visible = true;
  scene.background = null;
  scene.add(new THREE.AmbientLight(0xbbbbbb, 0.3));
  scene.fog = new THREE.Fog(0x535ef3, 400, 2000);

  scene.add(camera);

  const arcsData = [];
  const pointsData = [];
  const ringsData = [];

  const colorInterpolator = (t) => `rgba(200, 200, 200, ${1 - t})`;

  for (let i = 1; i <= 5; i += 1) {
    const { data } = mapData;
    const startPoint = data[Math.floor(Math.random() * data.length)];
    let endPoint = data[Math.floor(Math.random() * data.length)];

    while (JSON.stringify(endPoint) === JSON.stringify(startPoint)) {
      endPoint = data[Math.floor(Math.random() * data.length)];
    }

    const startLat = startPoint.lat;
    const endLat = endPoint.lat;
    const startLng = startPoint.lng;
    const endLng = endPoint.lng;

    arcsData.push({
      order: i,
      startLat,
      endLat,
      startLng,
      endLng,
    });

    pointsData.push(
      ...[
        {
          lat: startLat,
          lng: startLng,
        },
        {
          lat: endLat,
          lng: endLng,
        },
      ]
    );

    ringsData.push(
      ...[
        {
          lat: startLat,
          lng: startLng,
        },
        {
          lat: endLat,
          lng: endLng,
        },
      ]
    );
  }

  const globe = new ThreeGlobe({
    waitForGlobeReady: true,
    animateIn: true,
  })
    .hexPolygonsData(globeData.features)
    .hexPolygonColor(() => "rgba(255,255,255, 1)")
    .hexPolygonResolution(3)
    .hexPolygonMargin(0.7)
    .showAtmosphere(true)
    .atmosphereColor("#3a228a")
    .atmosphereAltitude(0.25);

  setTimeout(() => {
    globe
      .arcsData(arcsData)
      .arcColor(() => "rgba(255, 3, 212, 0.85)")
      .arcStroke(() => 0.75)
      .arcDashLength(0.9)
      .arcDashGap(4)
      .arcDashAnimateTime(4500)
      .arcsTransitionDuration(4500)
      .arcDashInitialGap((e) => e.order * 1)
      .pointsData(pointsData)
      .pointColor(() => "#30b0ff")
      .pointsMerge(true)
      .pointAltitude(0.045)
      .pointRadius(0.05)
      .pointsTransitionDuration(3500)
      .ringsData(ringsData)
      .ringColor(() => colorInterpolator)
      .ringMaxRadius(3.25)
      .ringPropagationSpeed(0.5)
      .ringRepeatPeriod(2400);
  }, 1500);

  const globeMaterial = globe.globeMaterial();
  globeMaterial.color = new THREE.Color(0x3a228a);
  globeMaterial.emissive = new THREE.Color(0x220038);
  globeMaterial.emissiveIntensity = 0.1;
  globeMaterial.shininess = 0.7;

  scene.add(globe);
  wrapper.appendChild(container);

  animate();

  window.addEventListener("resize", onWindowResize, false);
};
