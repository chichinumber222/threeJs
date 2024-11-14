import * as THREE from 'three'
import GUI from 'lil-gui'
import { initScene } from './bootstrap/bootstrap'
import { stats } from './utils/stats'
import { initHelpersControls } from './controls/helper-controls'
import testVertexShader from './shaders/test/vertex.glsl'
import testFragmentShader from './shaders/test/fragment.glsl'
import testVertexShader2 from './shaders/test2/vertex.glsl'
import testFragmentShader2 from './shaders/test2/fragment.glsl'
import testVertexShader3 from './shaders/test3/vertex.glsl'
import testFragmentShader3 from './shaders/test3/fragment.glsl'
import testVertexShader4 from './shaders/test4/vertex.glsl'
import testFragmentShader4 from './shaders/test4/fragment.glsl'

const gui = new GUI()
const textureLoader = new THREE.TextureLoader()

const mountTestPlane = (scene: THREE.Scene) => {
  const geometry = new THREE.PlaneGeometry(5, 5, 32, 32)
  const material = new THREE.RawShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.y = -Math.PI / 10
  mesh.name = 'plane'
  scene.add(mesh)
  return mesh
}

const mountTestPlane2 = (scene: THREE.Scene) => {
  const geometry = new THREE.PlaneGeometry(5, 5, 32, 32)
  const vertexCount = geometry.attributes.position.count
  const aRandoms = new Float32Array(vertexCount)
  for (let i = 0; i < vertexCount; i ++) {
    aRandoms[i] = Math.random()
  }
  geometry.setAttribute('aRandom', new THREE.BufferAttribute(aRandoms, 1))
  const material = new THREE.RawShaderMaterial({
    vertexShader: testVertexShader2,
    fragmentShader: testFragmentShader2,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.copy(new THREE.Vector3(6, 1, -1))
  mesh.rotation.y = -Math.PI / 10
  mesh.name = 'plane2'
  scene.add(mesh)
  return mesh
}

const mountTestPlane3 = (scene: THREE.Scene) => {
  const geometry = new THREE.PlaneGeometry(5, 5, 32, 32)
  const material = new THREE.RawShaderMaterial({
    vertexShader: testVertexShader3,
    fragmentShader: testFragmentShader3,
    uniforms: {
      uFrequency: { value: new THREE.Vector2(3, 2) },
      uTime: { value: 0 },
      uTexture: { value: textureLoader.load('./static/Scotland.jpg')}
    }
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.scale.set(1, 0.6, 1)
  mesh.position.copy(new THREE.Vector3(-6, 1, -1))
  mesh.rotation.y = -Math.PI / 10
  mesh.name = 'plane3'
  scene.add(mesh)
  return mesh
}

const mountTestPlane4 = (scene: THREE.Scene) => {
  const geometry = new THREE.PlaneGeometry(5, 5, 32, 32)
  const material = new THREE.ShaderMaterial({
    vertexShader: testVertexShader4,
    fragmentShader: testFragmentShader4,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.copy(new THREE.Vector3(0, -6, -1))
  mesh.rotation.y = -Math.PI / 10
  mesh.name = 'plane4'
  scene.add(mesh)
  return mesh
}

const initShaderHelpers = (gui: GUI, mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.RawShaderMaterial>) => {
  const folder = gui
    .addFolder('shaders')
  folder
    .add(mesh.material.uniforms.uFrequency.value, 'x')
    .min(0)
    .max(10)
    .step(0.01)
    .name('uFrequencyX')
  folder
    .add(mesh.material.uniforms.uFrequency.value, 'y')
    .min(0)
    .max(10)
    .step(0.01)
    .name('uFrequencyY')
  folder.close()
}

initScene({})(({ scene, camera, renderer }) => {
  camera.position.z = 6

  mountTestPlane(scene)

  mountTestPlane2(scene)

  const testPlane3 = mountTestPlane3(scene)

  mountTestPlane4(scene)

  const clock = new THREE.Clock()
  function animate() {
    const elapsedTime = clock.getElapsedTime()
    testPlane3.material.uniforms.uTime.value = elapsedTime

    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    stats.update()
  }
  animate()

  initHelpersControls(gui, scene)
  initShaderHelpers(gui, testPlane3)
})
