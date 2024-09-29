import * as THREE from 'three'
import GUI from 'lil-gui'
import { randomColor } from '../utils/random-color'
import { randomVector } from '../utils/random-vector'
import { createMultiMaterialObject } from 'three/examples/jsm/utils/SceneUtils'

export const initAddRemoveCubeControls = (gui: GUI, parent: THREE.Object3D, material?: THREE.Material) => {
    const addRemoveProps = {
        addCube: () => addCube(parent, material),
        removeCube: () => removeCube(parent),
    }

    gui.add(addRemoveProps, 'addCube').name('Добавить куб')
    gui.add(addRemoveProps, 'removeCube').name('Удалить куб')
}

const addCube = (parent: THREE.Object3D, material?: THREE.Material) => {
    const color = randomColor()
    const positionVector = randomVector({
        xRange: { from: -4, to: 4 },
        yRange: { from: -3, to: 3 },
        zRange: { from: -4, to: 4 },
    })
    const rotationVector = randomVector({
        xRange: { from: 0, to: Math.PI * 2 },
        yRange: { from: 0, to: Math.PI * 2 },
        zRange: { from: 0, to: Math.PI * 2 }
    })

    const meshGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
    const meshMaterial = material ?? new THREE.MeshStandardMaterial({ color, roughness: 0.1, metalness: 0.9 })
    const mesh = Array.isArray(meshMaterial) 
        ? createMultiMaterialObject(meshGeometry, meshMaterial)
        : new THREE.Mesh(meshGeometry, meshMaterial)

    mesh.position.copy(positionVector)
    mesh.rotation.setFromVector3(rotationVector)
    mesh.name = `cube - ${parent.children.length}`
    mesh.castShadow = true
    parent.add(mesh)
}

const removeCube = (parent: THREE.Object3D) => {
    parent.children.pop()
}