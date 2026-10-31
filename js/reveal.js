// Efek "dunia muncul melingkar" seperti layar awal bruno-simon.com.
// Semua material dunia ditambal (patch) supaya bagian di luar lingkaran tidak digambar,
// dan tepi lingkarannya bercahaya.
import * as THREE from 'three';

export const reveal = {
  uReveal: { value: 6.5 },                  // jari-jari lingkaran yang terlihat
  uCenter: { value: new THREE.Vector2() },  // pusat lingkaran (x, z)
};

export function patch(mat) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uReveal = reveal.uReveal;
    sh.uniforms.uCenter = reveal.uCenter;
    sh.vertexShader = 'varying vec3 vRevealPos;\n' + sh.vertexShader.replace(
      '#include <project_vertex>',
      `#include <project_vertex>
       vec4 rvW = vec4(transformed, 1.0);
       #ifdef USE_INSTANCING
         rvW = instanceMatrix * rvW;
       #endif
       rvW = modelMatrix * rvW;
       vRevealPos = rvW.xyz;`);
    sh.fragmentShader = 'uniform float uReveal;\nuniform vec2 uCenter;\nvarying vec3 vRevealPos;\n' +
      sh.fragmentShader
        .replace('void main() {', `void main() {
           float rvD = distance(vRevealPos.xz, uCenter);
           if (rvD > uReveal) discard;
           float rvEdge = smoothstep(uReveal - 0.5, uReveal, rvD);`)
        .replace('#include <dithering_fragment>', `#include <dithering_fragment>
           gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.0, 0.9, 0.85), rvEdge);`);
  };
  mat.customProgramCacheKey = () => 'reveal-v1';
  return mat;
}

const cache = new Map();
/** Material Lambert (warna rata) yang sudah ditambal efek reveal. */
export function mat(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!cache.has(key)) cache.set(key, patch(new THREE.MeshLambertMaterial({ color, ...opts })));
  return cache.get(key);
}

// ------------------------------------------------------------------ angin: rumput & daun bergoyang
export const wind = { uTime: { value: 0 } };
/** Material yang ikut bergoyang tertiup angin. strength = besar goyangan; byHeight = hanya bagian atas */
export function windMat(color, strength = 0.2, leaves = false) {
  const m = new THREE.MeshLambertMaterial({ color });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uReveal = reveal.uReveal;
    sh.uniforms.uCenter = reveal.uCenter;
    sh.uniforms.uTime = wind.uTime;
    sh.vertexShader = 'uniform float uTime;\nvarying vec3 vRevealPos;\n' + sh.vertexShader
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vec4 wBase = vec4(0.0, 0.0, 0.0, 1.0);
        #ifdef USE_INSTANCING
          wBase = instanceMatrix * wBase;
        #endif
        float wh = ${leaves ? '1.0' : 'max(position.y, 0.0)'};
        float wph = wBase.x * 0.35 + wBase.z * 0.27;
        transformed.x += sin(uTime * 1.8 + wph) * ${strength.toFixed(3)} * wh + sin(uTime * 4.1 + wph * 2.0) * ${(strength * 0.3).toFixed(3)} * wh;
        transformed.z += cos(uTime * 1.5 + wph) * ${(strength * 0.6).toFixed(3)} * wh;`)
      .replace('#include <project_vertex>', `#include <project_vertex>
        vec4 rvW = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          rvW = instanceMatrix * rvW;
        #endif
        rvW = modelMatrix * rvW;
        vRevealPos = rvW.xyz;`);
    sh.fragmentShader = 'uniform float uReveal;\nuniform vec2 uCenter;\nvarying vec3 vRevealPos;\n' + sh.fragmentShader
      .replace('void main() {', `void main() {
        float rvD = distance(vRevealPos.xz, uCenter);
        if (rvD > uReveal) discard;
        float rvEdge = smoothstep(uReveal - 0.5, uReveal, rvD);`)
      .replace('#include <dithering_fragment>', `#include <dithering_fragment>
        gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.0, 0.9, 0.85), rvEdge);`);
  };
  m.customProgramCacheKey = () => 'wind-' + strength + leaves;
  return m;
}
