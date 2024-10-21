import * as THREE from 'three'
import GUI from 'lil-gui'
import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
import { stats } from './utils/stats'
import { initHelpersControls } from './controls/helper-controls'
import { initOrbitControls, OrbitControls } from './controller/orbit'

const props: InitSceneProps = {
  backgroundColor: new THREE.Color(0x04141f),
  disableDefaultControls: true,
}

const gui = new GUI()
const textureLoader = new THREE.TextureLoader()

interface GalaxyParameters {
  pointSize: number 
  pointsCount: number
  radius: number
  branches: number
  spinPower: number
  frequencyPower: number
  frequencyDistance: number
  insideColor: string
  outsideColor: string
}
type GalaxyCreateFunc = (param: GalaxyParameters) => void

const galaxyParameters: GalaxyParameters = {
  pointSize: 0.15,
  pointsCount: 15000,
  radius: 14,
  branches: 6,
  spinPower: 0.33,
  frequencyPower: 2.5,
  frequencyDistance: 1.2,
  insideColor: '#ff7214', 
  outsideColor: '#00aeff',
}

const useGalaxy = (scene: THREE.Scene): GalaxyCreateFunc  => {
  let geometry: THREE.BufferGeometry | null = null
  let material: THREE.PointsMaterial | null = null
  let points: THREE.Points | null = null
  return (param: GalaxyParameters) => {
    //* Clear
    if (points !== null) {
      geometry?.dispose()
      material?.dispose()
      scene.remove(points)
    }
    //* Create
    geometry = new THREE.BufferGeometry()
    material = new THREE.PointsMaterial({
      size: param.pointSize,
      sizeAttenuation: true,
      depthWrite: false, 
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      alphaMap: textureLoader.load('./static/textures/stars/star_01 2.png'),
    })
    points = new THREE.Points(geometry, material)

    const positions = new Float32Array(param.pointsCount * 3)
    const angle = (2 * Math.PI) / param.branches
    const colors =  new Float32Array(param.pointsCount * 3)
    const insideColor = new THREE.Color(param.insideColor)
    const outsideColor = new THREE.Color(param.outsideColor)
    for (let i = 0; i < param.pointsCount; i++) {
      // position
      const randomRadius = Math.random() * param.radius
      const currentAngle = angle * (i + 1)
      const spinAngle = param.spinPower * randomRadius
      const spreadOutX = Math.pow(Math.random(), param.frequencyPower) * (Math.random() >= 0.5 ? -1 : 1) * param.frequencyDistance
      const spreadOutY = Math.pow(Math.random(), param.frequencyPower) * (Math.random() >= 0.5 ? -1 : 1) * param.frequencyDistance
      const spreadOutZ = Math.pow(Math.random(), param.frequencyPower) * (Math.random() >= 0.5 ? -1 : 1) * param.frequencyDistance
      positions[i * 3] = Math.sin(currentAngle + spinAngle) * randomRadius + spreadOutX
      positions[i * 3 + 1] = spreadOutY
      positions[i * 3 + 2] = Math.cos(currentAngle + spinAngle) * randomRadius + spreadOutZ
      // color
      const currentInterolatePower = randomRadius / param.radius
      const currentColor = insideColor.clone()
      currentColor.lerp(outsideColor, currentInterolatePower)
      colors[i * 3] = currentColor.r
      colors[i * 3 + 1] = currentColor.g
      colors[i * 3 + 2] = currentColor.b
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    scene.add(points)
  }
}

const initGalaxyControls = (gui: GUI, parameters: GalaxyParameters, updateCb?: GalaxyCreateFunc) => {
  const galaxyDebugFolder = gui.addFolder('Galaxy')
  galaxyDebugFolder.add(parameters, 'pointSize').min(0).max(0.15).step(0.001)
  galaxyDebugFolder.add(parameters, 'pointsCount').min(100).max(20000).step(1)
  galaxyDebugFolder.add(parameters, 'radius').min(0).max(20).step(0.01)
  galaxyDebugFolder.add(parameters, 'branches').min(3).max(10).step(1)
  galaxyDebugFolder.add(parameters, 'spinPower').min(-2).max(2).step(0.01)
  galaxyDebugFolder.add(parameters, 'frequencyPower').min(1).max(10).step(0.1)
  galaxyDebugFolder.add(parameters, 'frequencyDistance').min(0).max(10).step(0.1)
  galaxyDebugFolder.addColor(parameters, 'insideColor')
  galaxyDebugFolder.addColor(parameters, 'outsideColor')
  if (updateCb) {
    galaxyDebugFolder.onFinishChange(({ object }) => updateCb(object as GalaxyParameters))
  }
  galaxyDebugFolder.close()
}

initScene(props)(({ scene, camera, renderer }) => {
  const centerScene = new THREE.Vector3(0, 0, 0)
  let controls: OrbitControls | null = null

  const createGalaxy = useGalaxy(scene)
  createGalaxy(galaxyParameters)

  let cameraAnimation = true
  const clock  = new THREE.Clock()
  function animate() {
    if (cameraAnimation) {
      const elapsedTime = clock.getElapsedTime()
      if (elapsedTime < 4) {
        camera.position.set(Math.pow(elapsedTime, 3) * 0.2, Math.pow(elapsedTime, 3) * 0.2, Math.pow(elapsedTime, 3) * 0.2)
        camera.lookAt(centerScene)
      } else {
        controls = initOrbitControls(camera, renderer)
        cameraAnimation = false
      }
    } else {
      controls?.update()
    }
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    stats.update()
  }
  animate()

  initGalaxyControls(gui, galaxyParameters, createGalaxy)
  initHelpersControls(gui, scene)
})
