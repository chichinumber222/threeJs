import * as THREE from 'three'
import GUI from 'lil-gui'
import WaterfallGLTF from './assets/gltf/waterfall/scene.glb'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
import { stats } from './utils/stats'
import { initHelpersControls } from './controls/helper-controls'
import { initializeAmbientLightControls } from './controls/ambient-light-controls'

const props: InitSceneProps = {
  backgroundColor: new THREE.Color(0xcccccc),
  disableLights: true
}
const gui = new GUI()

const loadAndAddWaterfall = (scene: THREE.Scene) => {
  const loader = new GLTFLoader()
  loader.load(WaterfallGLTF, (loadedObject) => {
    const loadedScene = loadedObject.scene
    scene.add(loadedScene)
  })
}

const getAmbientLight = () => {
  const light = new THREE.AmbientLight(0xffffff, 1)
  light.name = 'ambient-light'
  return light
}

initScene(props)(({ scene, camera, renderer, orbitControls }) => {
  camera.position.set(-7, 2, 5)
  orbitControls?.update()

  loadAndAddWaterfall(scene)

  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    stats.update()

    orbitControls?.update()
  }
  animate()

  const ambientLight = getAmbientLight()
  scene.add(ambientLight)

  initializeAmbientLightControls(gui, ambientLight)
  initHelpersControls(gui, scene)
})
