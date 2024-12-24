precision mediump float;

varying float vElevation;

void main() {
    gl_FragColor = vec4(0.8 + vElevation * 2.0, 0.8 + vElevation * 2.0, 0.8 + vElevation * 2.0, 1.0);
}
