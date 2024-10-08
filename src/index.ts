import * as THREE from 'three'
import GUI from 'lil-gui'
import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
import { stats } from './utils/stats'
import { initHelpersControls } from './controls/helper-controls'
import { foreverPlane } from './bootstrap/floor'
import { initSceneControls } from './controls/scene-controls'
const props: InitSceneProps = {
    backgroundColor: new THREE.Color(0xffffff),
}

const gui = new GUI()

const mountCube = (scene: THREE.Scene) => {
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5, 3, 3, 3)
    const material = new THREE.MeshPhysicalMaterial({ color: '#3a7e57', metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.2  })

    const positionAttribute = geometry.attributes.position
    const index = 42
    const y = positionAttribute.getY(index)
    const x = positionAttribute.getX(index)
    positionAttribute.setY(index, y + 0.15)
    positionAttribute.setX(index, x - 0.1)
    positionAttribute.needsUpdate = true

    const cube = new THREE.Mesh(geometry, material)
    cube.castShadow = true
    cube.name = 'cube'
    scene.add(cube)

    return cube
}

const mountSpotLight = (scene: THREE.Scene) => {
    const light = new THREE.SpotLight(0xffffff, 3)

    light.position.set(2, 2, 3)
    light.decay = 0.5
    light.angle = 0.3
    light.penumbra = 0.5
    light.shadow.mapSize.width = 2048
    light.shadow.mapSize.height = 2048
    light.name = 'spot-light'
    scene.add(light)

    return light
  }

initScene(props)(({ scene, camera, renderer, orbitControls }) => {
    camera.position.z = 3

    foreverPlane(scene)

    mountCube(scene)

    mountSpotLight(scene)

    function animate() {
        requestAnimationFrame(animate)
        renderer.render(scene, camera)
        orbitControls?.update()
        stats.update()
    }
    animate()

    initSceneControls(gui, scene)
    initHelpersControls(gui, scene)
})