import * as THREE from "three"
import * as CANNON from "cannon"

function convertVector(vector: CANNON.Vec3): THREE.Vector3
function convertVector(vector: THREE.Vector3): CANNON.Vec3
function convertVector(vector: CANNON.Vec3 | THREE.Vector3) {
  if (vector instanceof CANNON.Vec3) {
    return new THREE.Vector3(vector.x, vector.y, vector.z)
  }
  return new CANNON.Vec3(vector.x, vector.y, vector.z)
}

export { convertVector }