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
  surface: '#76d3ea',
  depth: '#43c3df',
}

const createPlane = (scene: THREE.Scene) => {
  const geometry = new THREE.PlaneGeometry(15, 15, 1000, 1000)
  const material = new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    uniforms: {
      uBigWavesFrequency: {
        value: new THREE.Vector2(2, 3),
      },
      uBigWavesDepth: {
        value: 0.3,
      },
      uTime: {
        value: 0,
      },
      surfaceColor: {
        value: new THREE.Color(waterColors.surface),
      },
      depthColor: {
        value: new THREE.Color(waterColors.depth),
      },
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
  folder.add(mesh.material.uniforms.uBigWavesDepth, 'value').min(0).max(5).step(0.001).name('uBigWavesDepth')
  folder.addColor(waterColors, 'surface').onChange(() => mesh.material.uniforms.surfaceColor.value = new THREE.Color(waterColors.surface))
  folder.addColor(waterColors, 'depth').onChange(() => mesh.material.uniforms.depthColor.value = new THREE.Color(waterColors.depth))
  folder.close()
}

initScene(props)(({ scene, camera, renderer, orbitControls }) => {
  camera.position.set(1, 2, 6)

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
