// import * as THREE from 'three'
// import flower1Img from './assets/images/flower-1.jpg' 
// import wallImg from './assets/images/wall.jpg'
// import flower5Img from './assets/images/flower-5.jpg'

// function main() {
//     const canvas = document.querySelector('#c')

//     const renderer = new THREE.WebGLRenderer({ antialias: true, ...(canvas ? { canvas } : {}) })

//     const fov = 75
//     const aspect = 2
//     const near = 0.1
//     const far = 5
//     const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
//     camera.position.z = 3

//     const scene = new THREE.Scene()

//     function addLight() {
//         const color = 0xFFFFFF
//         const intensity = 3
//         const light = new THREE.DirectionalLight(color, intensity)
//         light.position.set(-1, 2, 4)
//         scene.add(light)
//     }
//     addLight()

//     const boxWidth = 1;
//     const boxHeight = 1;
//     const boxDepth = 1;
//     const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

//     interface Params {
//         geometry: THREE.BufferGeometry
//         x: number
//     }

//     interface ParamsWithColor extends Params {
//         type: 'color'
//         color: number | string
//     }

//     interface ParamsWithImgs extends Params {
//         type: 'images'
//         imgSrc: string | string[]
//     }

//     function makeInstance(args: ParamsWithImgs): THREE.Mesh
//     function makeInstance(args: ParamsWithColor): THREE.Mesh
//     function makeInstance(args: ParamsWithColor | ParamsWithImgs): THREE.Mesh | null {
//         let material: THREE.Material[] | THREE.Material | null = null
//         if (args.type === 'color') {
//             material = new THREE.MeshPhongMaterial({ color: args.color || '#FFFFFF'})
//         } else if (args.type === 'images') {
//             const loader = new THREE.TextureLoader()
//             if (Array.isArray(args.imgSrc)) {
//                 material = args.imgSrc.reduce<THREE.Material[]>((acc, src) => {
//                     const texture = loader.load(src)
//                     texture.colorSpace = THREE.SRGBColorSpace
//                     acc.push(new THREE.MeshBasicMaterial({ map: texture }))
//                     return acc
//                 } , [])
//             } else {
//                 const texture = loader.load(args.imgSrc)
//                 texture.colorSpace = THREE.SRGBColorSpace
//                 material = new THREE.MeshBasicMaterial({ map: texture })
//             }
//         }
//         if (material) {
//             const cube = new THREE.Mesh(args.geometry, material)
//             scene.add(cube)
//             cube.position.x = args.x
//             return cube
//         }
//         return null
//     }

//     const cubes = [
//         makeInstance({type: 'color', geometry, color: 0x44aa88, x: -0 }),
//         makeInstance({type: 'images', geometry, imgSrc: [wallImg, flower1Img, flower5Img, wallImg, flower1Img, flower5Img], x: -2}),
//         makeInstance({type: 'images', geometry, imgSrc: flower5Img, x: 2}),
//     ]

//     function resizeRendererToDisplaySize(renderer: THREE.Renderer) {
//         const canvas = renderer.domElement
//         const width = canvas.clientWidth
//         const height = canvas.clientHeight
//         const needResize = canvas.width !== width || canvas.height !== height
//         if (needResize) {
//             renderer.setSize(width, height, false)
//         }
//         return needResize
//     }

//     function render(time: number) {
//         time *= 0.001

//         if (resizeRendererToDisplaySize(renderer)) {
//             const canvas = renderer.domElement
//             camera.aspect = canvas.clientWidth / canvas.clientHeight
//             camera.updateProjectionMatrix()
//         }

//         cubes.forEach((cube, ndx) => {
//             const speed = 1 + ndx * .1
//             const rot = time * speed
//             cube.rotation.x = rot
//             cube.rotation.y = rot
//         })
//         renderer.render(scene, camera)
//         window.requestAnimationFrame(render)
//     }
//     window.requestAnimationFrame(render)
// } 

// main()


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

  renderer = new THREE.WebGLRenderer()
  renderer.setClearColor(0xEEEEEE)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true

  const axes = new THREE.AxesHelper(20)
  scene.add(axes)

  const planeGeometry = new THREE.PlaneGeometry(60, 20)
  const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xCCCCCC })
  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = - 0.5 * Math.PI
  plane.position.set(15, 0, 0)
  plane.receiveShadow = true
  scene.add(plane)

  const cubeGeometry = new THREE.BoxGeometry(4, 4, 4)
  const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 })
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
  cube.position.set(-4, 3, 0)
  cube.castShadow = true
  scene.add(cube)

  const sphereGeometry = new THREE.SphereGeometry(4, 20, 20)
  const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x7777ff })
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphere.position.set(20, 4, 2)
  sphere.castShadow = true
  scene.add(sphere)
  let sphereStep = 0

  const parametersGUI = {
    rotationSpeed: 0.02,
    bouncingSpeed: 0.03
  }
  const datGUI = new dat.GUI()
  datGUI.add(parametersGUI, 'rotationSpeed', 0, 0.1)
  datGUI.add(parametersGUI, 'bouncingSpeed', 0, 0.1)

  camera.position.set(-30, 40, 30)
  camera.lookAt(scene.position)

  const spotLight = new THREE.SpotLight(0xFFFFFF, 4)
  spotLight.position.set(-40, 60, -10)
  spotLight.castShadow = true
  spotLight.decay = 0.1
  spotLight.shadow.mapSize.width = 2048
  spotLight.shadow.mapSize.height = 2048
  scene.add(spotLight)

  function initStats() {
    const stats = new Stats()
    stats.dom.style.position = 'absolute'
    stats.dom.style.top = '0px'
    stats.dom.style.left = '0px'
    document.getElementById('Stats-output')?.appendChild(stats.dom)
    return stats
  }

  function renderScene() {
    cube.rotation.x += parametersGUI.rotationSpeed
    cube.rotation.y += parametersGUI.rotationSpeed
    cube.rotation.z += parametersGUI.rotationSpeed

    sphereStep += parametersGUI.bouncingSpeed
    sphere.position.x = 20  + (10 * Math.cos(sphereStep))
    sphere.position.y = 2 + (10 * Math.abs(Math.sin(sphereStep)))

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

window.addEventListener('resize', onResize, false)