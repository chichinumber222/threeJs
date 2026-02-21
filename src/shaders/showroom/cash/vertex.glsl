varying vec2 vUv;
varying float vElevation;

uniform float uDepth;
uniform float uFrequency;

void main() {
    vec3 updatedPosition = position;
    float elevation = sin(position.x * uFrequency) * uDepth;
    updatedPosition.z += elevation;
    vec4 modelPosition = modelMatrix * vec4(updatedPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    vUv = uv;
    vElevation = elevation;
}