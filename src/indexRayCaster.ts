//* Funniest
// import * as THREE from "three"
// import GUI from "lil-gui"
// import { initScene, Props as InitSceneProps } from "./bootstrap/bootstrap"
// import { stats } from "./utils/stats"
// import { initHelpersControls } from "./controls/helper-controls"
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

// const props: InitSceneProps = {
//   backgroundColor: new THREE.Color(0x212733),
// }

// const gui = new GUI()
// const gltfLoader = new GLTFLoader()

// initScene(props)(({ scene, camera, renderer, orbitControls }) => {
//   camera.position.z = 1.7

//   let horseModel: THREE.Group | null = null
//   gltfLoader.load(
//     './static/gltf/horse_statue_01_4k.gltf/horse_statue_01_4k.gltf',
//     (gltf) => {
//       horseModel = gltf.scene
//       horseModel.scale.set(10, 10, 10)
//       horseModel.position.set(0, -1, 0)
//       horseModel.traverse((child) => {
//         const children = child as THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>
//         if (children.isMesh) children.material.flatShading = true
//       })
//       scene.add(horseModel)
//     }
//   )

//   const raycaster = new THREE.Raycaster()
//   const arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3(), 0.12, '#569cd6', 0.03, 0.015)
//   scene.add(arrowHelper)

//   const onMouseMove = (event: MouseEvent) => {
//     if (!horseModel) return
//     raycaster.setFromCamera(
//       new THREE.Vector2(
//         (event.clientX / window.innerWidth) * 2 - 1,
//         - (event.clientY / window.innerHeight) * 2 + 1
//       ), 
//       camera
//     )
//     const intersected = raycaster.intersectObject(horseModel)
//     if (intersected.length && intersected[0].normal) {
//       const normal = new THREE.Vector3()
//       normal.copy(intersected[0].normal)
//       arrowHelper.position.set(intersected[0].point.x, intersected[0].point.y, intersected[0].point.z)
//       arrowHelper.setDirection(normal)
//     }
//   }

//   window.addEventListener('mousemove' ,onMouseMove)

//   function animate() {
//     requestAnimationFrame(animate)
//     renderer.render(scene, camera)
//     orbitControls?.update()
//     stats.update()
//   }
//   animate()

//   initHelpersControls(gui, scene)
// })


//* Simple
import * as THREE from "three"
import GUI from "lil-gui"
import { initScene, Props as InitSceneProps } from "./bootstrap/bootstrap"
import { stats } from "./utils/stats"
import { initHelpersControls } from "./controls/helper-controls"
import { onChangeCursor } from "./utils/update-cursor-coord"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const props: InitSceneProps = {
  backgroundColor: new THREE.Color(0x212733),
}

const gui = new GUI()
const gltfLoader = new GLTFLoader()

initScene(props)(({ scene, camera, renderer, orbitControls }) => {
  camera.position.z = 1

  let horseModel: THREE.Group | null = null
  gltfLoader.load(
    './static/gltf/horse_statue_01_4k.gltf/horse_statue_01_4k.gltf',
    (gltf) => {
      horseModel = gltf.scene
      horseModel.scale.set(3, 3, 3)
      scene.add(horseModel)
    }
  )

  const mouse = onChangeCursor()
  const raycaster = new THREE.Raycaster()

  function animate() {
    if (horseModel) {
      raycaster.setFromCamera(mouse, camera)
      const intersected = raycaster.intersectObject(horseModel)
      if (intersected.length) {
        horseModel.rotation.y += 0.01
      }
    }

    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    orbitControls?.update()
    stats.update()
  }
  animate()

  initHelpersControls(gui, scene)
})

