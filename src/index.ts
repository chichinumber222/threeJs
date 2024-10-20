import * as THREE from 'three'
import GUI from 'lil-gui'
import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
import { stats } from './utils/stats'
import { initHelpersControls } from './controls/helper-controls'

const props: InitSceneProps = {
  backgroundColor: new THREE.Color(0x04141f),
}

const gui = new GUI()

type GalaxyParameters = Record<'size' | 'count' | 'radius', number>
type GalaxyCreateFunc = (param: GalaxyParameters) => void

const galaxyParameters: GalaxyParameters = {
  size: 0.01,
  count: 5000,
  radius: 5,
}

const useGalaxy = (scene: THREE.Scene): GalaxyCreateFunc  => {
  let geometry: THREE.BufferGeometry | null = null
  let material: THREE.PointsMaterial | null = null
  let points: THREE.Points | null = null
  return (param: GalaxyParameters) => {
    // clear
    if (points !== null) {
      geometry?.dispose()
      material?.dispose()
      scene.remove(points)
    }
    // create
    geometry = new THREE.BufferGeometry()
    material = new THREE.PointsMaterial({
      size: param.size,
      sizeAttenuation: true,
    })
    points = new THREE.Points(geometry, material)
    const positions = new Float32Array(param.count * 3)
    for (let i = 0; i < param.count; i++) {
      positions[i * 3 + 0] = Math.random() * param.radius
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = 0
    }
    points.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    scene.add(points)
  }
}

const initGalaxyControls = (gui: GUI, parameters: GalaxyParameters, updateCb?: GalaxyCreateFunc) => {
  const galaxyDebugFolder = gui.addFolder('Galaxy')
  galaxyDebugFolder.add(parameters, 'size').min(0).max(0.1).step(0.01)
  galaxyDebugFolder.add(parameters, 'count').min(100).max(20000).step(1)
  galaxyDebugFolder.add(parameters, 'radius').min(0).max(20).step(0.01)
  if (updateCb) {
    galaxyDebugFolder.onFinishChange(({ object }) => updateCb(object as GalaxyParameters))
  }
  galaxyDebugFolder.close()
}

initScene(props)(({ scene, camera, renderer, orbitControls }) => {
  camera.position.z = 6

  const createGalaxy = useGalaxy(scene)
  createGalaxy(galaxyParameters)

  function animate() {
    orbitControls?.update()
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    stats.update()
  }
  animate()

  initGalaxyControls(gui, galaxyParameters, createGalaxy)
  initHelpersControls(gui, scene)
})

