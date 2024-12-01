precision mediump float;

varying float vElevation;

void main() {
    gl_FragColor = vec4(1.0 + vElevation * 8.0, 1.0 + vElevation * 8.0, 1.0 + vElevation * 8.0, 1.0);
}
