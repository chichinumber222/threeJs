import * as THREE from "three"
import GUI from "lil-gui"
import { initScene, Props as InitSceneProps } from "./bootstrap/bootstrap"
import { stats } from "./utils/stats"
import { initHelpersControls } from "./controls/helper-controls"
import { onChangeCursor } from "./utils/update-cursor-coord"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const props: InitSceneProps = {
  backgroundColor: new THREE.Color(0x212733),
}

const gui = new GUI()
const gltfLoader = new GLTFLoader()

initScene(props)(({ scene, camera, renderer, orbitControls }) => {
  camera.position.z = 1

  let horseModel: THREE.Group | null = null
  gltfLoader.load(
    './static/gltf/horse_statue_01_4k.gltf/horse_statue_01_4k.gltf',
    (gltf) => {
      horseModel = gltf.scene
      horseModel.scale.set(3, 3, 3)
      scene.add(horseModel)
    }
  )

  const mouse = onChangeCursor()
  const raycaster = new THREE.Raycaster()

  function animate() {
    if (horseModel) {
      raycaster.setFromCamera(mouse, camera)
      const intersected = raycaster.intersectObject(horseModel)
      if (intersected.length) {
        horseModel.rotation.y += 0.01
      }
    }

    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    orbitControls?.update()
    stats.update()
  }
  animate()

  initHelpersControls(gui, scene)
})
