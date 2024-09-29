import * as THREE from 'three'
import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
import { foreverFloor } from './bootstrap/floor'
import { stats } from './utils/stats'
import GUI from 'lil-gui'
import { initHelpersControls } from './controls/helpers'
import { initAddRemoveCubeControls } from './controls/add-remove-cube-controls'
import { initSceneControls } from './controls/initSceneControls'

const props: InitSceneProps = {
    backgroundColor: new THREE.Color(0xffffff),
    fogColor: new THREE.Color(0xffffff)
}

const gui = new GUI()

initScene(props)(({ camera, scene, renderer, orbitControls }) => {
    foreverFloor(scene, 10)

    camera.position.set(-7, 2, 5)
    orbitControls?.update()

    const animate = () => {
        renderer.render(scene, camera)
        stats.update()
        window.requestAnimationFrame(animate)

        orbitControls?.update()
    }
    animate()

    initHelpersControls(gui, scene)
    initSceneControls(gui, scene)
    initAddRemoveCubeControls(gui, scene)
})