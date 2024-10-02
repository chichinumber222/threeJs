import * as THREE from 'three'
import GUI from 'lil-gui'
import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
import { stats } from './utils/stats'
import { initHelpersControls } from './controls/helper-controls'
import { foreverFloor } from './bootstrap/floor'
import { initializeSpotLightControls } from './controls/spot-light-controls'

const props: InitSceneProps = {
  backgroundColor: new THREE.Color(0xcccccc),
  disableLights: true
}
const gui = new GUI()

const getSpotLight = () => {
  const light = new THREE.SpotLight(0xffffff, 2)
  light.position.set(4, 6, 2)
  light.decay = 0.1
  light.angle = 0.3
  light.penumbra = 0.5
  light.shadow.mapSize.width = 2048
  light.shadow.mapSize.height = 2048
  light.name = 'spot-light'
  return light
}

const getAmbientLight = () => {
    const light = new THREE.AmbientLight(0xffffff, 2)
    light.name = 'ambient-light'
    return light
  }

const getSpotLightHelper = (spotLight: THREE.SpotLight) => {
    const helper = new THREE.SpotLightHelper(spotLight)
    helper.visible = false
    return helper
}

initScene(props)(({ scene, camera, renderer, orbitControls }) => {
  camera.position.set(-7, 2, 5)
  orbitControls?.update()

  const ambientLight = getAmbientLight()
  scene.add(ambientLight)

  const spotLight = getSpotLight()
  scene.add(spotLight)

  const spotLightHelper = getSpotLightHelper(spotLight)
  scene.add(spotLightHelper)

  const floor = foreverFloor(scene)
  spotLight.target = floor

  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    stats.update()

    spotLightHelper.update()
    orbitControls?.update()
  }
  animate()

  initializeSpotLightControls(gui, spotLight, spotLightHelper)
  initHelpersControls(gui, scene)
})
