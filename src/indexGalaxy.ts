import * as THREE from 'three'
import GUI from 'lil-gui'
import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
import { stats } from './utils/stats'
import { initHelpersControls } from './controls/helper-controls'
import galaxyVertexShader from './shaders/galaxy/vertex.glsl'
import galaxyFragmentShader from './shaders/galaxy/fragment.glsl'

const props: InitSceneProps = {
  backgroundColor: new THREE.Color(0x04141f),
}

const gui = new GUI()

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
type Galaxy = THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>
type GalaxyCreateFunc = (param: GalaxyParameters) => Galaxy

const galaxyParameters: GalaxyParameters = {
  pointSize: 50,
  pointsCount: 15000,
  radius: 14,
  branches: 6,
  spinPower: 0.33,
  frequencyPower: 6,
  frequencyDistance: 1.5,
  insideColor: '#ff7214',
  outsideColor: '#00aeff',
}

const useGalaxy = (scene: THREE.Scene, renderer: THREE.WebGLRenderer): GalaxyCreateFunc => {
  let geometry: THREE.BufferGeometry | null = null
  let material: THREE.ShaderMaterial | null = null
  let points: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial> | null = null
  return (param: GalaxyParameters) => {
    //* Clear
    if (points !== null) {
      geometry?.dispose()
      material?.dispose()
      scene.remove(points)
    }
    //* Create
    geometry = new THREE.BufferGeometry()
    material = new THREE.ShaderMaterial({
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      vertexShader: galaxyVertexShader,
      fragmentShader: galaxyFragmentShader,
      uniforms: {
        uTime: {
          value: 0,
        },
        uSize: {
          value: param.pointSize * renderer.getPixelRatio(),
        },
      },
      transparent: true,
    })
    points = new THREE.Points(geometry, material)

    const positions = new Float32Array(param.pointsCount * 3)
    const angle = (2 * Math.PI) / param.branches
    const colors = new Float32Array(param.pointsCount * 3)
    const insideColor = new THREE.Color(param.insideColor)
    const outsideColor = new THREE.Color(param.outsideColor)
    const scales = new Float32Array(param.pointsCount * 1)
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
      // scales
      scales[i] = Math.random()
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    scene.add(points)
    return points
  }
}

const initGalaxyControls = (gui: GUI, parameters: GalaxyParameters, updateCb?: GalaxyCreateFunc) => {
  const galaxyDebugFolder = gui.addFolder('Galaxy')
  galaxyDebugFolder.add(parameters, 'pointSize').min(0).max(60).step(1.0)
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

initScene(props)(({ scene, camera, renderer, orbitControls }) => {
  camera.position.set(5, 8, 12)

  const createGalaxy = useGalaxy(scene, renderer)
  const galaxy = createGalaxy(galaxyParameters)

  const clock = new THREE.Clock()
  function animate() {
    const elapsedTime = clock.getElapsedTime()
    galaxy.material.uniforms.uTime.value = elapsedTime

    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    orbitControls?.update()
    stats.update()
  }
  animate()

  initGalaxyControls(gui, galaxyParameters, createGalaxy)
  initHelpersControls(gui, scene)
})
