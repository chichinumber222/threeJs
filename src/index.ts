// import * as THREE from 'three'
// import GUI from 'lil-gui'
// import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
// import { stats } from './utils/stats'
// import { initHelpersControls } from './controls/helper-controls'
// import { foreverFloor } from './bootstrap/floor'
// import { initSceneControls } from './controls/scene-controls'

// const props: InitSceneProps = {
//   backgroundColor: new THREE.Color(0xffffff),
//   disableDefaultControls: true,
// }

// const gui = new GUI()

// const mountCube = (scene: THREE.Scene) => {
//   const geometry = new THREE.BoxGeometry(0.5,0.5,0.5)
//   const material = new THREE.MeshPhysicalMaterial({ color: '#3a7e57', clearcoat: 1, clearcoatRoughness: 0.2 })
//   const cube = new THREE.Mesh(geometry, material)
//   cube.castShadow = true
//   cube.name = 'cube'
//   scene.add(cube)
//   return cube
// }

// const initCursorMovement = () => {
//     const cursor = {
//         x: 0,
//         y: 0,
//     }
//     window.addEventListener('mousemove', (event) => {
//         cursor.x = event.clientX / window.innerWidth - 0.5
//         cursor.y = -(event.clientY / window.innerHeight - 0.5)
//     })
//     return cursor
// }

// initScene(props)(({ scene, camera, renderer }) => {
//   camera.position.z = 3

//   foreverFloor(scene, 10)

//   const cube = mountCube(scene)

//   const cursor = initCursorMovement()

//   function animate() {
//     camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3
//     camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3
//     camera.position.y = cursor.y * 10
//     camera.lookAt(cube.position)

//     requestAnimationFrame(animate)
//     renderer.render(scene, camera)
//     stats.update()
//   }
//   animate()

//   initSceneControls(gui, scene)
//   initHelpersControls(gui, scene)
// })

import * as THREE from 'three'
import GUI from 'lil-gui'
import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
import { stats } from './utils/stats'
import { initHelpersControls } from './controls/helper-controls'
import { foreverFloor, foreverPlane } from './bootstrap/floor'
import { initSceneControls } from './controls/scene-controls'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
const props: InitSceneProps = {
    backgroundColor: new THREE.Color(0xffffff),
    disableDefaultControls: true,
}

const gui = new GUI()

const mountCube = (scene: THREE.Scene) => {
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
    const material = new THREE.MeshPhysicalMaterial({ color: '#3a7e57', clearcoat: 1, clearcoatRoughness: 0.2 })
    const cube = new THREE.Mesh(geometry, material)
    cube.castShadow = true
    cube.name = 'cube'
    scene.add(cube)
    return cube
}

initScene(props)(({ scene, camera, renderer }) => {
    camera.position.z = 3

    const controls = new PointerLockControls(camera, document.body)

    controls.addEventListener('lock', function () {
        controls.isLocked = false
        console.log('lock')

    })

    controls.addEventListener('unlock', function () {
        controls.isLocked = true
        console.log('unlock')
    })

    let isLock = false
    window.addEventListener('click', () => {
        console.log('click')
        isLock = !isLock
        if (isLock) {
            controls.lock()
        } else {
            controls.unlock()
        }
    })

    const movement = {
        w: false,
        a: false,
        s: false,
        d: false
    }

    window.addEventListener('keydown', function (event) {
        if (!controls.isLocked) {
            return
        }
        switch (event.key) {
            case 'w':
            case 'W':
                movement.w = true
                break
            case 'a':
            case 'A':
                movement.a = true
                break
            case 's':
            case 'S':
                movement.s = true
                break
            case 'd':
            case 'D':
                movement.d = true
                break
            default:
                break
        }
    })

    window.addEventListener('keyup', function (event) {
        switch (event.key) {
            case 'w':
            case 'W':
                movement.w = false
                break
            case 'a':
            case 'A':
                movement.a = false
                break
            case 's':
            case 'S':
                movement.s = false
                break
            case 'd':
            case 'D':
                movement.d = false
                break
            default:
                break
        }
    })


    foreverPlane(scene)

    mountCube(scene)

    function animate() {
        if (movement.w) controls.moveForward(0.03)
        if (movement.a) controls.moveRight(-0.03)
        if (movement.s) controls.moveForward(-0.03)
        if (movement.d) controls.moveRight(0.03)
        requestAnimationFrame(animate)
        renderer.render(scene, camera)
        stats.update()
    }
    animate()

    initSceneControls(gui, scene)
    initHelpersControls(gui, scene)
})

