#define PI 3.1415926535897932384626433832795

uniform float uTime;

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

//	Classic Perlin 2D Noise 
//	by Stefan Gustavson (https://github.com/stegu/webgl-noise)
//
vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}

float cnoise(vec2 P){
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 * 
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
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
    // vec2 wavedUv = vec2(
    //     vUv.x + sin(vUv.y * 30.0) * 0.1,
    //     vUv.y + sin(vUv.x * 30.0) * 0.1
    // );
    // float strength = 1.0 - step(0.01, abs(distance(vec2(0.5), wavedUv) - 0.25));

    // Pattern 39
    // vec2 wavedUv = vec2(
    //     vUv.x + sin(vUv.y * 100.0) * 0.1,
    //     vUv.y + sin(vUv.x * 100.0) * 0.1
    // );
    // float strength = 1.0 - step(0.01, abs(distance(vec2(0.5), wavedUv) - 0.25));

    // Pattern 40
    //* atan(y, x) - вычисляет угол в прямоугольном треугольнике между гипотенузой и одним из катетов
    // float angle = atan(vUv.x, vUv.y);
    // float strength = angle;

    // Pattern 41
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
    // float strength = angle;

    // Pattern 42
    // float angle = (atan(vUv.x - 0.5, vUv.y - 0.5) + PI) / (2.0 * PI);
    // float strength = angle;

    // Pattern 43
    // float rayAngle = PI / 9.0;
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5) + PI;
    // float strength = (angle - floor(angle / rayAngle) * rayAngle) / rayAngle;

    // Pattern 43 (version 2)
    // float rayAngle = PI / 9.0;
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5) + PI;
    // float strength = mod(angle, rayAngle) / rayAngle;

    // Pattern 44
    // float rayAngle = PI / 9.0;
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5) + PI;
    // float part = mod(angle, rayAngle) / rayAngle;
    // float strength = sin(part * 2.0 * PI);

    // Pattern 45
    float angle = atan(vUv.x - 0.5, vUv.y - 0.5) + PI;
    float radius = 0.25 + sin(angle * 15.0 + uTime * 5.0) * 0.02;
    float strength = 1.0 - step(0.01, abs(distance(vec2(0.5), vUv) - radius));

    // Pattern 46
    // float strength = cnoise(vUv * 10.0);

    // Pattern 47
    // float strength = step(0.0, cnoise(vUv * 10.0));

    // Pattern 48
    // float strength = 1.0 - abs(cnoise(vUv * 10.0));

    // Pattern 49
    // float strength = sin(cnoise(vUv * 10.0) * 12.0);

    // Pattern 50
    // float strength =  step(0.9, sin(cnoise(vUv * 10.0) * 12.0));

    // Clamp the strength
    //* clamp(value, min, max) используется для ограничения значения внутри заданного диапазона (min, max)
    strength = clamp(strength, 0.0, 1.0);

    // Color version
    vec3 blackColor = vec3(0.0);
    vec3 vUvColored = vec3(vUv, 0.7);
    //* mix(a, b, c) - используется для линейной интерполяции между двумя значениями a и b на основе третьего параметра (веса) c.
    vec3 mixedColor = mix(blackColor, vUvColored, strength);
    gl_FragColor = vec4(mixedColor, 1.0);

    // Black and white version
    // gl_FragColor = vec4(vec3(strength), 1.0);
}
