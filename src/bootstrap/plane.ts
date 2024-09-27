import * as THREE from 'three'

export const foreverPlane = (scene: THREE.Scene) => {
    const geometry = new THREE.PlaneGeometry(10000, 10000)
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff })
    const mesh = new THREE.Mesh(geometry, material)

    mesh.position.set(0, -2 , 0)
    mesh.rotation.set(Math.PI / -2, 0, 0)
    mesh.receiveShadow = true
    mesh.name = 'forever-plane'

    scene.add(mesh)

    return mesh
}
