import * as THREE from 'three'
import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
import { foreverFloor } from './bootstrap/floor'
import { stats } from './utils/stats'
import GUI from 'lil-gui'
import { initHelpersControls } from './controls/helper-controls'
import { randomColor } from './utils/random-color'

const props: InitSceneProps = {
  backgroundColor: new THREE.Color(0xffffff),
  fogColor: new THREE.Color(0xffffff),
}

const getCubeWithEdges = () => {
  const color = randomColor()

  const cubeGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5)
  const cubeMat = new THREE.MeshLambertMaterial({ color, opacity: 0.5, transparent: true })
  const cube = new THREE.Mesh(cubeGeo, cubeMat)
  cube.position.set(0, -1.5, 0)

  const edgesGeo = new THREE.EdgesGeometry(cubeGeo)
  const lineMat = new THREE.LineBasicMaterial({ color })
  const edges = new THREE.LineSegments(edgesGeo, lineMat)

  cube.add(edges)
  return cube
}

const getMeshClone = (mesh: THREE.Mesh) => {
  const cloned = mesh.clone()
  cloned.position.set(cloned.position.x + 0.6, cloned.position.y, cloned.position.z)
  return cloned
}

const getExternalCamera = () => {
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(10, 2, -3)
  camera.lookAt(0, 0, 0)
  return camera
}

const gui = new GUI()

initScene(props)(({ camera, scene, renderer, orbitControls }) => {
  foreverFloor(scene, 10)

  const cube = getCubeWithEdges()
  const cubeClone = getMeshClone(cube)
  scene.add(cube).add(cubeClone)

  const cameraHelper = new THREE.CameraHelper(camera)
  scene.add(cameraHelper)

  camera.position.set(-7, 2, 5)
  camera.lookAt(cube.position)
  orbitControls?.update()

  const externalCamera = getExternalCamera()
  let currentCamera = externalCamera

  let isForward = true

  const animate = () => {
    if (cube.position.y > 10 && isForward) {
      isForward = false
    }
    if (cube.position.y < -10 && !isForward) {
      isForward = true
    }
    cube.position.y = cube.position.y + (isForward ? 0.05 : -0.05)

    camera.lookAt(cube.position)
    stats.update()
    camera.updateMatrixWorld() // не знаю точно как это работает...(из-за orbitControls иначе никак)

    renderer.render(scene, currentCamera)
    window.requestAnimationFrame(animate)
    orbitControls?.update() 
  }
  animate()

  initHelpersControls(gui, scene)
  gui.add(
    {
      switch: () => currentCamera = (currentCamera === camera ? externalCamera : camera)
    },
    'switch'
  ).name('Switch camera')
})
