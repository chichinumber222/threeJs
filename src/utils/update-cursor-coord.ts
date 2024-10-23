import * as THREE from 'three'

export const onChangeCursor = () => {
  const cursor = new THREE.Vector2()
  const callback = (event: MouseEvent) => {
    // normalize
    cursor.x = (event.clientX / window.innerWidth) * 2 - 1
    cursor.y = - (event.clientY / window.innerHeight) * 2 + 1
  }
  window.addEventListener('mousemove', callback)
  return cursor
}
