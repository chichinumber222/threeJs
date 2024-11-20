import * as THREE from 'three'
import GUI from 'lil-gui'
import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
import { stats } from './utils/stats'
import { initHelpersControls } from './controls/helper-controls'
import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'

const props: InitSceneProps = {
  backgroundColor: new THREE.Color(0x04141f),
}

const gui = new GUI()
const waterColors = {
  surface: '#91dbee',
  depth: '#18accd',
}

const createPlane = (scene: THREE.Scene) => {
  const geometry = new THREE.PlaneGeometry(15, 15, 1000, 1000)
  const material = new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    uniforms: {
      uBigWavesFrequency: {
        value: new THREE.Vector2(1, 1.8),
      },
      uBigWavesElevation: {
        value: 0.2,
      },
      uBigWavesSpeed: {
        value: 3.7,
      },
      uTime: {
        value: 0,
      },
      uSurfaceColor: {
        value: new THREE.Color(waterColors.surface),
      },
      uDepthColor: {
        value: new THREE.Color(waterColors.depth),
      },
      uColorOffset: {
        value: 1.4,
      },
      uColorMultiplier: {
        value: 0.5,
      },
      uSmallWavesSpeed: {
        value: 0.9,
      },
      uSmallWavesElevation: {
        value: 0.78,
      },
      uSmallWavesFrequency: {
        value: 0.35,
      },
      uSmallWavesIterations: {
        value: 4.0,
      }
    }
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.copy(new THREE.Euler(Math.PI / -2, 0, 0))
  mesh.name = 'plane'
  scene.add(mesh)
  return mesh
}

const initHelpersWater = (gui: GUI, mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>) => {
  const folder = gui.addFolder('Water')
  folder.add(mesh.material.uniforms.uBigWavesFrequency.value, 'x').min(0).max(5).step(0.001).name('uBigWavesFrequencyX')
  folder.add(mesh.material.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.001).name('uBigWavesFrequencyY')
  folder.add(mesh.material.uniforms.uBigWavesElevation, 'value').min(0).max(5).step(0.001).name('uBigWavesElevation')
  folder.add(mesh.material.uniforms.uBigWavesSpeed, 'value').min(0).max(5).step(0.001).name('uBigWavesSpeed')
  folder.add(mesh.material.uniforms.uSmallWavesFrequency, 'value').min(0).max(3).step(0.001).name('uSmallWavesFrequency')
  folder.add(mesh.material.uniforms.uSmallWavesElevation, 'value').min(0).max(8).step(0.001).name('uSmallWavesElevation')
  folder.add(mesh.material.uniforms.uSmallWavesSpeed, 'value').min(0).max(3).step(0.001).name('uSmallWavesSpeed')
  folder.add(mesh.material.uniforms.uSmallWavesIterations, 'value').min(0).max(8).step(1.0).name('uSmallWavesIterations')
  folder.addColor(waterColors, 'surface').onChange(() => mesh.material.uniforms.uSurfaceColor.value = new THREE.Color(waterColors.surface)).name('uSurfaceColor')
  folder.addColor(waterColors, 'depth').onChange(() => mesh.material.uniforms.uDepthColor.value = new THREE.Color(waterColors.depth)).name('uDepthColor')
  folder.add(mesh.material.uniforms.uColorOffset, 'value').min(0).max(4).step(0.001).name('uColorOffset')
  folder.add(mesh.material.uniforms.uColorMultiplier, 'value').min(0).max(2).step(0.001).name('uColorMultiplier')
}

initScene(props)(({ scene, camera, renderer, orbitControls }) => {
  camera.position.set(2.5, 5, 10)

  const water = createPlane(scene)

  const clock = new THREE.Clock()
  function animate() {
    const elapsedTime = clock.getElapsedTime()
    water.material.uniforms.uTime.value = elapsedTime

    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    orbitControls?.update()
    stats.update()
  }
  animate()

  initHelpersControls(gui, scene)
  initHelpersWater(gui, water)
})
