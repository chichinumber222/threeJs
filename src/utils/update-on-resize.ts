import * as THREE from 'three'

export const onResize = (camera: THREE.PerspectiveCamera, renderer: THREE.Renderer) => {
    const resizer = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', resizer, false)
}
