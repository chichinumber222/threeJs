import * as THREE from 'three'
import Stats from 'stats.js'
import * as dat from 'dat.gui'

let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let scene: THREE.Scene

function init() {
  const stats = initStats()
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
  scene.add(camera)

  renderer = new THREE.WebGLRenderer()
  renderer.setClearColor(0xEEEEEE)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true

  const planeGeometry = new THREE.PlaneGeometry(60, 40)
  const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xCCCCCC })
  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = - 0.5 * Math.PI
  plane.position.set(0, 0, 0)
  plane.receiveShadow = true
  scene.add(plane)

  const spotLight = new THREE.SpotLight(0xFFFFFF, 4)
  spotLight.position.set(-40, 60, -10)
  spotLight.castShadow = true
  spotLight.decay = 0.1
  spotLight.shadow.mapSize.width = 2048
  spotLight.shadow.mapSize.height = 2048
  scene.add(spotLight)

  scene.fog = new THREE.FogExp2(0xFFFFFF, 0.006)
  scene.overrideMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff })

    interface Controls {
        rotationSpeed?: number
        numberOfObjects?: number
        addCube?: () => void
        removeCube?: () => void
        outputObjects?: () => void
    }

    const controls: Controls = {}

    controls.rotationSpeed = 0.02

    controls.numberOfObjects = scene.children.length

    controls.addCube = function () {
      const size = Math.ceil(Math.random() * 3)
      const geometry = new THREE.BoxGeometry(size, size, size)
      const material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xff0000 })
      const cube = new THREE.Mesh(geometry, material)
      cube.castShadow = true
      cube.position.set(
        (-1) * (planeGeometry.parameters.width / 2 ) + Math.round(Math.random() * planeGeometry.parameters.width), 
        Math.round(Math.random() * 5),
        (-1) * (planeGeometry.parameters.height / 2) + Math.round(Math.random() * planeGeometry.parameters.height)
      )
      cube.name = `cube - ${scene.children.length}`
      scene.add(cube)
      this.numberOfObjects = scene.children.length
    }

    controls.removeCube = function () {
      const objects = scene.children
      const lastObject = objects[objects.length - 1]
      if (lastObject instanceof THREE.Mesh && lastObject !== plane) {
        scene.remove(lastObject)
        this.numberOfObjects = scene.children.length
      } 
    }

    controls.outputObjects = function () {
      console.log(scene.children)
    }

    const datGUI = new dat.GUI()
    datGUI.add(controls, 'rotationSpeed', 0, 0.1)
    datGUI.add(controls, 'addCube')
    datGUI.add(controls, 'removeCube')
    datGUI.add(controls, 'outputObjects')
    datGUI.add(controls, 'numberOfObjects').listen()

    camera.position.set(-45, 50, 40)
    camera.lookAt(scene.position)

    function initStats() {
      const stats = new Stats()
      stats.dom.style.position = 'absolute'
      stats.dom.style.top = '0px'
      stats.dom.style.left = '0px'
      document.getElementById('Stats-output')?.appendChild(stats.dom)
      return stats
    }

    function renderScene() {
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj !== plane) {
          obj.rotation.x = obj.rotation.x + (controls?.rotationSpeed || 0)
          obj.rotation.y = obj.rotation.y + (controls?.rotationSpeed || 0)
          obj.rotation.z = obj.rotation.z + (controls?.rotationSpeed || 0)
        }
      })
      renderer.render(scene, camera)
      stats.update()
      window.requestAnimationFrame(renderScene)
    }

    document.getElementById('WebGL-output')?.appendChild(renderer.domElement)
    renderScene()
}

function onResize() {
  if (camera) {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
  }
  if (renderer) {
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
}

window.onload = init

window.addEventListener('resize', onResize)
