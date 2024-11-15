#define PI 3.1415926535897932384626433832795

varying vec2 vUv;

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

vec2 rotate(vec2 uv, float rotation, vec2 mid) {
    return vec2(
        cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
        cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
    );
}

void main() {
    // Pattern 3
    // float strength = vUv.x

    // Pattern 4
    // float strength = vUv.y

    // Pattern 5
    // float strength = 1.0 - vUv.y;

    // Pattern 6
    // float strength = vUv.y * 10.0;

    // Pattern 7
    //* fract(x) - дробная часть числа x
    // float strength = fract(vUv.y * 10.0);

    // Pattern 7 (version 2)
    //* mod(x, y) - остаток от деления x на y
    // float strength = mod(vUv.y * 10.0, 1.0);

    // Pattern 8
    // float strength = mod(vUv.y * 10.0, 1.0);
    // strength = strength < 0.5 ? 0.0 : 1.0;

    // Pattern 8 (version 2)
    //* step(limit, value) - если value > limit, то вернет 1.0; если value < limit, то вернет 0.0;
    // float strength = mod(vUv.y * 10.0, 1.0);
    // strength = step(0.5, strength);

    // Pattern 9
    // float strength = mod(vUv.y * 10.0, 1.0);
    // strength = step(0.8, strength);

    // Pattern 10
    // float strength = mod(vUv.x * 10.0, 1.0);
    // strength = step(0.8, strength);

    // Pattern 11
    // float strengthX = step(0.8,  mod(vUv.x * 10.0, 1.0));
    // float strengthY = step(0.8, mod(vUv.y * 10.0, 1.0));
    // float strength = max(strengthX, strengthY);

    // Pattern 11 (version 2)
    // float strength = step(0.8,  mod(vUv.x * 10.0, 1.0));
    // strength += step(0.8, mod(vUv.y * 10.0, 1.0)); 

    // Pattern 12
    // float strength = step(0.8, mod(vUv.x * 10.0, 1.0));
    // strength *= step(0.8, mod(vUv.y * 10.0, 1.0));

    // Pattern 13
    // float strength = step(0.4, mod(vUv.x * 10.0, 1.0));
    // strength *= step(0.8, mod(vUv.y * 10.0, 1.0));

    // Pattern 14
    // float barX = step(0.4, mod(vUv.x * 10.0, 1.0));
    // barX *= step(0.8, mod(vUv.y * 10.0, 1.0));
    // float barY = step(0.8, mod(vUv.x * 10.0, 1.0));
    // barY *= step(0.4, mod(vUv.y * 10.0, 1.0));
    // float strength = barX + barY;

    // Pattern 15
    // float barX = step(0.4, mod(vUv.x * 10.0, 1.0));
    // barX *= step(0.8, mod(vUv.y * 10.0 + 0.2, 1.0));
    // float barY = step(0.8, mod(vUv.x * 10.0 + 0.2, 1.0));
    // barY *= step(0.4, mod(vUv.y * 10.0, 1.0));
    // float strength = barX + barY;

    // Pattern 16
    // float strength = abs(vUv.x - 0.5);

    // Pattern 17
    // float strength = min(abs(vUv.x - 0.5), abs(vUv.y - 0.5));

    // Pattern 18
    // float strength = max(abs(vUv.x - 0.5), abs(vUv.y - 0.5));

    // Pattern 19
    // float strength = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));

    // Pattern 20
    // float square1 = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
    // float square2 = step(max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)), 0.3);
    // float strength = square1 * square2;

    // Pattern 21
    //* floor(x) — округляет число вниз до ближайшего целого числа.
    //* ceil(x) — округляет число вверх до ближайшего целого числа.
    // float strength = floor(vUv.x * 10.0) / 10.0;

    // Pattern 22
    // float strength = floor(vUv.x * 10.0) / 10.0 * floor(vUv.y * 10.0) / 10.0;

    // Pattern 23
    // float strength = random(vUv);

    // Pattern 24
    // vec2 gridUv = vec2(floor(vUv.x * 10.0) / 10.0, floor(vUv.y * 10.0) / 10.0);
    // float strength = random(gridUv);

    // Pattern 25
    // vec2 gridUv = vec2(floor(vUv.x * 10.0) / 10.0, floor((vUv.y + vUv.x * 0.5) * 10.0) / 10.0);
    // float strength = random(gridUv);

    // Pattern 26
    // float strength = 1.0 - (1.0 - vUv.y) * (1.0 - vUv.x);

    // Pattern 26 (version 2)
    //* length(v) - длина вектора v
    // float strength = length(vUv);

    // Pattern 27
    // float strength = length(vUv - 0.5);

    // Pattern 27 (version 2)
    //* distance(v1, v2) - вычисляет расстояние между двумя точками или векторами v1 и v2
    // float strength = distance(vec2(0.5), vUv);

    // Pattern 28
    // float strength = 1.0 - distance(vec2(0.5), vUv);

    // Pattern 29 
    // float strength = 0.02 / distance(vec2(0.5), vUv);

    // Pattern 30
    // vec2 lightUv = vec2(
    //     vUv.x * 0.2 + 0.4, 
    //     vUv.y * 0.5 + 0.25
    // );
    // float strength = 0.02 / distance(vec2(0.5), lightUv);

    // Pattern 31 (star)
    // vec2 lightUv1 = vec2(vUv.x * 0.1 + 0.45, vUv.y * 0.5 + 0.25);
    // vec2 lightUv2 = vec2(vUv.x * 0.5 + 0.25, vUv.y * 0.1 + 0.45);
    // float light1 = 0.02 / distance(vec2(0.5), lightUv1);
    // float light2 = 0.02 / distance(vec2(0.5), lightUv2);
    // float strength = light1 * light2;
    //* work with alpha-channel; correct work with material.transparent = true;
    // float visibility = step(0.4, strength);
    // gl_FragColor = vec4(vec3(strength), visibility);

    // Pattern 31 (star version 2)
    // vec2 lightUv1 = vec2(vUv.x * 0.1 + 0.45, vUv.y * 0.5 + 0.25);
    // vec2 lightUv2 = vec2(vUv.x * 0.5 + 0.25, vUv.y * 0.1 + 0.45);
    // float light1 = 0.02 / distance(vec2(0.5), lightUv1);
    // float light2 = 0.02 / distance(vec2(0.5), lightUv2);
    // float strength = light1 * light2;
    //* discard - no render pixel
    // if (strength < 0.4) discard;
    // gl_FragColor = vec4(vec3(strength), 1.0);

    // Pattern 32
    // vec2 vUvRotated = rotate(vUv, PI / 4.0, vec2(0.5));
    // vec2 lightUv1 = vec2(vUvRotated.x * 0.1 + 0.45, vUvRotated.y * 0.5 + 0.25);
    // vec2 lightUv2 = vec2(vUvRotated.x * 0.5 + 0.25, vUvRotated.y * 0.1 + 0.45);
    // float light1 = 0.02 / distance(vec2(0.5), lightUv1);
    // float light2 = 0.02 / distance(vec2(0.5), lightUv2);
    // float strength = light1 * light2;

    // Pattern 33
    // float strength = step(0.06, (pow(vUv.x - 0.5, 2.0) + pow(vUv.y - 0.5, 2.0)));

    // Pattern 33 (version 2)
    // float strength = step(0.25, distance(vec2(0.5), vUv));

    // Pattern 34
    // float strength = abs(distance(vec2(0.5), vUv) - 0.25);

    // Pattern 35
    // float strength = step(0.01, abs(distance(vec2(0.5), vUv) - 0.25));

    // Pattern 36
    // float strength = 1.0 - step(0.01, abs(distance(vec2(0.5), vUv) - 0.25));

    // Pattern 37
    // vec2 wavedUv = vec2(
    //     vUv.x,
    //     vUv.y + sin(vUv.x * 30.0) * 0.1
    // );
    // float strength = 1.0 - step(0.01, abs(distance(vec2(0.5), wavedUv) - 0.25));

    // Pattern 38
    float strength = vUv.x;

    gl_FragColor = vec4(vec3(strength), 1.0);
}
