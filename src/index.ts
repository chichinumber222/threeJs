import * as THREE from "three"
import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
import { foreverPlane } from './bootstrap/plane'
import { stats } from './utils/stats'

const props: InitSceneProps = {
    backgroundColor: new THREE.Color(0xffffff),
    fogColor: new THREE.Color(0xffffff)
}

initScene(props)(({ camera, scene, renderer, orbitControls }) => {
    foreverPlane(scene)

    const cubeGeometry = new THREE.BoxGeometry()
    const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xFF00FF })
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)

    cube.position.x = -1
    cube.castShadow = true
    scene.add(cube)

    const torusKnotGeometry = new THREE.TorusKnotGeometry(0.5, 0.2, 100, 100)
    const torusKnotMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff88, roughness: 0.1 })
    const torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial)

    torusKnot.castShadow = true
    torusKnot.position.x = 2
    scene.add(torusKnot)

    camera.position.set(-3, 3, 2)
    orbitControls?.update()

    let step = 0
    const animate = () => {
        cube.rotation.x += 0.01
        cube.rotation.y += 0.01
        cube.rotation.z += 0.01

        torusKnot.rotation.x -= 0.01
        torusKnot.rotation.y += 0.01
        torusKnot.rotation.z -= 0.01

        step += 0.04
        cube.position.x += 4 * Math.cos(step)
        cube.position.y += 4 * Math.abs(Math.sin(step))

        renderer.render(scene, camera)
        stats.update()
        window.requestAnimationFrame(animate)
    }
    animate()
})
