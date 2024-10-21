import * as THREE from 'three'
import GUI from 'lil-gui'
import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
import { stats } from './utils/stats'
import { initHelpersControls } from './controls/helper-controls'

const props: InitSceneProps = {
  backgroundColor: new THREE.Color(0x04141f),
}

const gui = new GUI()

type GalaxyParameters = Record<'pointSize' | 'pointsCount' | 'radius' | 'branches' | 'spin', number>
type GalaxyCreateFunc = (param: GalaxyParameters) => void

const galaxyParameters: GalaxyParameters = {
  pointSize: 0.01,
  pointsCount: 5000,
  radius: 5,
  branches: 5,
  spin: 0.5,
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
      size: param.pointSize,
      sizeAttenuation: true,
      depthWrite: false, 
      blending: THREE.AdditiveBlending,
    })
    points = new THREE.Points(geometry, material)

    const positions = new Float32Array(param.pointsCount * 3)
    const angle = (2 * Math.PI) / param.branches
    for (let i = 0; i < param.pointsCount; i++) {
      const randomRadius = Math.random() * param.radius
      const currentAngle = angle * (i + 1)
      const additionalAngle = param.spin * randomRadius
      positions[i * 3 + 0] = Math.sin(currentAngle + additionalAngle) * randomRadius // x
      positions[i * 3 + 1] = 0 // y
      positions[i * 3 + 2] = Math.cos(currentAngle + additionalAngle) * randomRadius // z
    }
    points.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    scene.add(points)
  }
}

const initGalaxyControls = (gui: GUI, parameters: GalaxyParameters, updateCb?: GalaxyCreateFunc) => {
  const galaxyDebugFolder = gui.addFolder('Galaxy')
  galaxyDebugFolder.add(parameters, 'pointSize').min(0).max(0.1).step(0.01)
  galaxyDebugFolder.add(parameters, 'pointsCount').min(100).max(20000).step(1)
  galaxyDebugFolder.add(parameters, 'radius').min(0).max(20).step(0.01)
  galaxyDebugFolder.add(parameters, 'branches').min(3).max(10).step(1)
  galaxyDebugFolder.add(parameters, 'spin').min(-2).max(2).step(0.01)
  if (updateCb) {
    galaxyDebugFolder.onFinishChange(({ object }) => updateCb(object as GalaxyParameters))
  }
  galaxyDebugFolder.close()
}

initScene(props)(({ scene, camera, renderer, orbitControls }) => {
  camera.position.set(0, 2, 6)

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

