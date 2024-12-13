uniform sampler2D uTextureFront;
uniform sampler2D uTextureBack;
uniform float uDepth;
uniform float uFrequency;

varying vec2 vUv;
varying float vElevation;

void main() {
    float factor = vElevation *  (0.25 / uDepth) + 0.75; // - (0.5; 1)
    if (gl_FrontFacing) {
        vec4 textureFrontColor = texture2D(uTextureFront, vUv);
        textureFrontColor.rgb *= factor;
        gl_FragColor = textureFrontColor;
    } else {
        vec4 textureBackColor = texture2D(uTextureBack, vec2(1.0 - vUv.x, vUv.y));
        textureBackColor.rgb *= 1.5 - factor; // - (0.5; 1)
        gl_FragColor = textureBackColor;
    }
}
