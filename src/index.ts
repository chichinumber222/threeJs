import * as THREE from 'three'
import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
import { createMeshesArrayBasedAnother } from './utils/create-meshes-array-based-another'
import gsap from 'gsap'
import GUI from "lil-gui"
import { initHelpersControls } from './controls/helper-controls'

const props: InitSceneProps = {
  disableDefaultControls: true,
  canvasElement: document.getElementsByTagName('canvas')[0],
  disableDefaultLights: true,
}

const gui = new GUI()
const textureLoader = new THREE.TextureLoader()

const container = document.getElementById('container')!
const sectionsCount = document.getElementsByClassName('section').length
const sectionUnitHeight = 5.5

const getMeshes = () => {
  const gradientTexture = textureLoader.load('./static/textures/gradients/5.jpg')
  gradientTexture.magFilter = THREE.NearestFilter
  const material = new THREE.MeshToonMaterial({ color: '#998e8e', gradientMap: gradientTexture })
  const meshesUniq = [
    new THREE.Mesh(
      new THREE.TorusKnotGeometry(1, 0.35, 90, 25, 2, 3),
      material
    ),
    new THREE.Mesh(
      new THREE.ConeGeometry(1.1, 3, 30, 1),
      material
    ),
    new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.4, 20, 30),
      material
    ),
    new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.5, 0),
      material
    ),
    new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 10, 10),
      material
    )
  ]
  const meshes = createMeshesArrayBasedAnother({ 
    basedMeshesArray: meshesUniq, 
    outputLength: sectionsCount, 
    withRandom: true 
  })
  meshes.forEach((mesh, i) => mesh.position.set(0, -sectionUnitHeight * i, 0))
  return meshes
}

const getParticles = () => {
  const geometry = new THREE.BufferGeometry()
  const material = new THREE.PointsMaterial({
    sizeAttenuation: true,
    size: 0.35,
    color: '#998e8e',
    alphaMap: textureLoader.load('./static/textures/stars/symbol_02 2.png'),
    transparent: true,
  })
  const count = 500
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < positions.length; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10
    positions[i * 3 + 1] = 0.5 * sectionUnitHeight - Math.random() * sectionUnitHeight * sectionsCount
    positions[i * 3 + 2] = (Math.random() - 0.5) * 5
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particles = new THREE.Points(geometry, material)
  return particles
}

const mountLight = (scene: THREE.Scene) => {
  const ambient = new THREE.AmbientLight(0xffffff, 2)
  ambient.name = 'ambient-light'
  const directional = new THREE.DirectionalLight(0xffffff, 2)
  directional.position.set(3, -3, 3)
  directional.castShadow = true
  directional.name ='directional-light'
  scene.add(ambient, directional)
}


initScene(props)(({ scene, camera, renderer }) => {
  camera.position.z = 4

  const cameraGroup = new THREE.Group()
  cameraGroup.add(camera)
  scene.add(cameraGroup)

  const meshes = getMeshes()
  scene.add(...meshes)

  const particles = getParticles()
  scene.add(particles)

  const scrolls = { x: container?.scrollLeft, y: container?.scrollTop }
  let currentSection = 0
  container?.addEventListener('scroll', () => {
    console.log('scroll event start')
    console.table([
      {
        scrollY: window.scrollY,
        scrollYContainer: container?.scrollTop
      }
    ])

    // scroll
    scrolls.x = container.scrollLeft
    scrolls.y = container.scrollTop
    // animate section
    const newSection = Math.round(container.scrollTop / container.clientHeight)
    if (newSection !== currentSection) {
      currentSection = newSection
      gsap.to(meshes[currentSection].rotation, {
        duration: 2,
        ease: "power2.inOut",
        x: '+=6',
        y: '+=3'
      })
    }
  })

  const cursor = { x: 0, y: 0}
  container.addEventListener('mousemove', (event: MouseEvent) => {
    cursor.x = (event.clientX / container.clientWidth) * 2 - 1
    cursor.y = - (event.clientY / container.clientHeight) * 2 + 1
  })

  mountLight(scene)

  const clock = new THREE.Clock()
  let prevTime = 0
  function animate() {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - prevTime
    prevTime = elapsedTime
    // animate meshes
    meshes.forEach((mesh) => {
      mesh.rotation.x += deltaTime * 0.1
      mesh.rotation.y += deltaTime * 0.15
    })
    // camera scroll
    const scrollDistance = (-sectionUnitHeight * scrolls.y) / container.clientHeight
    camera.position.y = scrollDistance
    // parallax effect
    const distanceX = cursor.x * 0.3
    const distanceY = cursor.y * 0.3
    const distancePartX = (distanceX - cameraGroup.position.x) * 2.5 * deltaTime
    const distancePartY = (distanceY - cameraGroup.position.y) * 2.5 * deltaTime 
    cameraGroup.position.x += distancePartX
    cameraGroup.position.y += distancePartY

    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }
  animate()

  initHelpersControls(gui, scene)
})
