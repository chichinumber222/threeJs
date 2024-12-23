varying vec3 vColor;

void main() {
    vec2 lightCoord1 = vec2(gl_PointCoord.x * 0.1 + 0.45, gl_PointCoord.y * 0.5 + 0.25);
    vec2 lightCoord2 = vec2(gl_PointCoord.x * 0.5 + 0.25, gl_PointCoord.y * 0.1 + 0.45);
    float light1 = 0.02 / distance(vec2(0.5), lightCoord1);
    float light2 = 0.02 / distance(vec2(0.5), lightCoord2);
    float strength = light1 * light2;
    float visibility = step(0.4, strength);
    gl_FragColor = vec4(vColor, visibility);
}
