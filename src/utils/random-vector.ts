import * as THREE from 'three'

interface Range {
    from: number
    to: number
}

export interface Props {
    xRange: Range
    yRange: Range
    zRange: Range
} 

export const randomVector = ({ xRange, yRange, zRange }: Props) => {
  const x = Math.random() * (xRange.to - xRange.from) + xRange.from
  const y = Math.random() * (yRange.to - yRange.from) + yRange.from
  const z = Math.random() * (zRange.to - zRange.from) + zRange.from

  return new THREE.Vector3(x, y, z)
}
