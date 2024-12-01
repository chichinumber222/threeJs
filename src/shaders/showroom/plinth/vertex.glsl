#define PI 3.1415926535897932384626433832795

varying float vElevation;

uniform float vBoxHeight;

void main() {
    vec3 updatedPosition = position;
    float elevation = 0.0;
    if (normal.z > 0.9) {
        elevation = sin(((position.y + vBoxHeight / 2.0) / vBoxHeight) * 2.0 * PI) * 0.01;
    }
    updatedPosition.z += elevation;
    vec4 modelPosition = modelMatrix * vec4(updatedPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    vElevation = elevation;
}
