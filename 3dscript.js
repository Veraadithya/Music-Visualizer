const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(150, 150, 150);
camera.lookAt(scene.position);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1));


const bars = [];
const cubeSize = 12;
const spacing = 12; 
for (let x = 0; x < cubeSize; x++) {
  for (let y = 0; y < cubeSize; y++) {
    for (let z = 0; z < cubeSize; z++) {
     
      const geometry = new THREE.BoxGeometry(3, 1, 3);
      geometry.translate(0, 0.5, 0); 
      const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x000000,
        emissiveIntensity: 0.5,
      });
      const bar = new THREE.Mesh(geometry, material);
      bar.position.set(
        (x - cubeSize / 2) * spacing,
        (y - cubeSize / 2) * spacing,
        (z - cubeSize / 2) * spacing
      );
      scene.add(bar);
      bars.push(bar);
    }
  }
}


let audio,
  audioContext,
  source,
  analyser,
  dataArray,
  isPlaying = false;

document.getElementById("upload").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    if (audio) {
      audio.pause();
      if (source) source.disconnect();
      if (analyser) analyser.disconnect();
      if (audioContext) audioContext.close();
    }

    audio = new Audio(e.target.result);
    audio.loop = true;

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    source = audioContext.createMediaElementSource(audio);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    dataArray = new Uint8Array(analyser.frequencyBinCount);

    audioContext.resume(); 

    audio.play();
    isPlaying = true;

    animate();
  };
  reader.readAsDataURL(file);
});

document.getElementById("playBtn").addEventListener("click", () => {
  if (audio && !isPlaying) {
    audio.play();
    isPlaying = true;
    audioContext.resume();
  }
});


document.getElementById("pauseBtn").addEventListener("click", () => {
  if (audio && isPlaying) {
    audio.pause();
    isPlaying = false;
  }
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

 
  scene.rotation.y += 0.003;
  scene.rotation.x += 0.001;

  if (analyser && dataArray) {
    analyser.getByteFrequencyData(dataArray);

    bars.forEach((bar, i) => {
      const value = dataArray[i % dataArray.length];
      const scale = Math.max(value / 20, 0.1); // taller bars

      bar.scale.y = scale;

      const hue = (value / 255) * 360;
      bar.material.color = new THREE.Color(`hsl(${hue}, 100%, 50%)`);
      bar.material.emissive = new THREE.Color(`hsl(${hue}, 100%, 25%)`);
    });
  }

  renderer.render(scene, camera);
}


window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
