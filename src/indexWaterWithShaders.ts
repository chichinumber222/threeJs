import * as THREE from 'three'
import GUI from 'lil-gui'
import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
import { stats } from './utils/stats'
import { initHelpersControls } from './controls/helper-controls'
import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'
import { useCount } from './utils/use-count'

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
  const getCount = useCount()
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
  const presetMethods = {
    save: () => {
      const index = getCount()
      const preset = {
        uBigWavesFrequencyX: mesh.material.uniforms.uBigWavesFrequency.value.x,
        uBigWavesFrequencyY: mesh.material.uniforms.uBigWavesFrequency.value.y,
        uBigWavesElevation: mesh.material.uniforms.uBigWavesElevation.value,
        uBigWavesSpeed: mesh.material.uniforms.uBigWavesSpeed.value,
        uSmallWavesFrequency: mesh.material.uniforms.uSmallWavesFrequency.value,
        uSmallWavesElevation: mesh.material.uniforms.uSmallWavesElevation.value,
        uSmallWavesSpeed: mesh.material.uniforms.uSmallWavesSpeed.value,
        uSmallWavesIterations: mesh.material.uniforms.uSmallWavesIterations.value,
        uSurfaceColor: waterColors.surface,
        uDepthColor: waterColors.depth,
        uColorOffset: mesh.material.uniforms.uColorOffset.value,
        uColorMultiplier: mesh.material.uniforms.uColorMultiplier.value,
      }
      const methods = {
        apply: () => {
          mesh.material.uniforms.uBigWavesFrequency.value.x = preset.uBigWavesFrequencyX
          mesh.material.uniforms.uBigWavesFrequency.value.y = preset.uBigWavesFrequencyY
          mesh.material.uniforms.uBigWavesElevation.value = preset.uBigWavesElevation
          mesh.material.uniforms.uBigWavesSpeed.value = preset.uBigWavesSpeed
          mesh.material.uniforms.uSmallWavesFrequency.value = preset.uSmallWavesFrequency
          mesh.material.uniforms.uSmallWavesElevation.value = preset.uSmallWavesElevation
          mesh.material.uniforms.uSmallWavesSpeed.value = preset.uSmallWavesSpeed
          mesh.material.uniforms.uSmallWavesIterations.value = preset.uSmallWavesIterations
          waterColors.surface = preset.uSurfaceColor
          waterColors.depth = preset.uDepthColor
          mesh.material.uniforms.uSurfaceColor.value = new THREE.Color(waterColors.surface)
          mesh.material.uniforms.uDepthColor.value = new THREE.Color(waterColors.depth)
          mesh.material.uniforms.uColorOffset.value = preset.uColorOffset
          mesh.material.uniforms.uColorMultiplier.value = preset.uColorMultiplier
          folder.controllers.forEach((controller) => {
            controller.updateDisplay()
          })
        }
      }
      folder.add(methods, 'apply').name(`Применить пресет ${index}`)
    },
  }
  folder.add(presetMethods, 'save').name('Сохранить пресет')
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
