precision mediump float;

uniform vec3 surfaceColor;
uniform vec3 depthColor;

varying float vElevation;

void main() {
    vec3 color = mix(depthColor, surfaceColor, vElevation);

    gl_FragColor = vec4(color, 1.0);
}
