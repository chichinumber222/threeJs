import * as THREE from 'three'

let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let scene: THREE.Scene

function init() {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
  scene.add(camera)

  renderer = new THREE.WebGLRenderer({ antialias: true })
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

  const axes = new THREE.AxesHelper(50)
  scene.add(axes)

  const squareGeometry = new THREE.BufferGeometry()
  const vertices = new Float32Array([
    -10, 10, 10,
    10, 10, 10,
    10, -10, 10,
    -10, -10, 10,
  ])
  const indices = [
    0, 1, 2,
    2, 3, 0
  ]
  squareGeometry.setIndex(indices)
  squareGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  squareGeometry.computeVertexNormals()
  const squareMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000, side: THREE.DoubleSide })
  const square = new THREE.Mesh(squareGeometry, squareMaterial)
  square.castShadow = true
  scene.add(square)

  const spotLight = new THREE.SpotLight(0xFFFFFF, 3)
  spotLight.position.set(50, 50, 50)
  spotLight.castShadow = true
  spotLight.decay = 0.1
  spotLight.shadow.mapSize.width = 2048
  spotLight.shadow.mapSize.height = 2048
  scene.add(spotLight)

  camera.position.set(-30, 30, 60)
  camera.lookAt(scene.position)

  document.getElementById('WebGL-output')?.appendChild(renderer.domElement)
  renderer.render(scene, camera)
}

function onResize() {
  if (camera) {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
  }
  if (renderer) {
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  renderer.render(scene, camera)
}

window.onload = init

window.addEventListener('resize', onResize)
