#define PI 3.1415926535897932384626433832795
#define E 2.71828182846

varying float vElevation;

uniform float vBoxHeight;

void main() {
    vec3 updatedPosition = position;
    float elevation = 0.0;
    if (normal.z > 0.9) {
        float angle = ((position.y + vBoxHeight / 2.0) / vBoxHeight) * PI / 2.0;
        elevation = (pow(E, (angle + PI))) * sin(10.0 * (angle + PI)) * 0.0003;
    }
    updatedPosition.z += elevation;
    vec4 modelPosition = modelMatrix * vec4(updatedPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    vElevation = elevation;
}