import * as THREE from 'three'

export const onResize = (camera: THREE.PerspectiveCamera, renderer: THREE.Renderer) => {
  const resizer = () => {
    console.log('RESIZE start - height:', window.innerHeight)

    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', resizer, false)
}
