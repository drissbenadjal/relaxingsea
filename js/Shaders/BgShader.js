export const vertexShaderBg = /*glsl*/`
varying vec2 vUv;
uniform float time;

void main() {
    //faire une texture de ciel
    vUv = uv;
    vec3 pos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const fragmentShaderBg = /*glsl*/`
uniform sampler2D uTexture;
uniform float time;
varying vec2 vUv;

void main() {
    // Scroll the background texture slowly over time for a moving effect
    vec2 uv = vUv;
    // uv.y += time * 0.02; // Horizontal movement of the background
    // uv.x += time * 0.01; // Vertical movement of the background
    // uv.y = mod(uv.y, 1.0); // Repeat the texture
    
    // Sample the texture
    vec4 color = texture2D(uTexture, uv / 2.0);
    // vec4 color = texture2D(uTexture, uv * 0.5 + 0.5);
   

    // Output the color of the texture
    gl_FragColor = vec4(color.rgb, color.a);
}
`;