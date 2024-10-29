import * as THREE from "three"

export const useCameraCoordinates = (camera: THREE.PerspectiveCamera) => {
  const currentPosition = camera.getWorldPosition(new THREE.Vector3)
  const currentDirection = camera.getWorldDirection(new THREE.Vector3())
  
  const getPosition = () => {
    camera.getWorldPosition(currentPosition)
    return currentPosition
  }
  
  const getDirection = () => {
    camera.getWorldDirection(currentDirection)
    return currentDirection
  }
  
  return [getPosition, getDirection] as const
}
  