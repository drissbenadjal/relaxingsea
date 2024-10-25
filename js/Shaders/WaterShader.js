export const vertexShaderWater = /*glsl*/`
varying vec2 vUv;
uniform float time;

float random(float x) {
    return fract(sin(x * 1000.0) * 43758.5453);
}

void main() {
    vUv = uv;
    
    // Start with the original position of the vertex
    vec3 pos = position;

    // Generate a random wave height based on the vertex position
    float waveHeight = 0.1 + random(pos.x) * 1.5; // Random height between 0.1 and 0.6
    float frequency = 10.0; // Frequency of the waves
    
    // Displace the z position (up and down) based on sine waves
    pos.z += sin(pos.x * frequency + time) * waveHeight;
    pos.z += cos(pos.y * frequency + time * 0.5) * waveHeight;

    // Standard transformation of vertex position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;


export const fragmentShaderWater = /*glsl*/`
uniform sampler2D uTexture;
uniform float time;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;

    // Apply a slight UV distortion to simulate water ripple effect
    uv.y += sin(uv.x * 10.0 + time) * 0.01;
    uv.x += cos(uv.y * 10.0 + time * .5) * 0.06;
    // uv.y += sin(uv.x * 10.0 + time * .5 * uv.y * uv.x) * 0.3;

    // Get the base texture color
    vec4 color = texture2D(uTexture, uv * 5. );

    // Slightly modify the color to make it look more like water
    vec3 waterColor = vec3(0.1, 0.4, 0.7); // Base water color (blueish)
    vec3 finalColor = mix(color.rgb, waterColor, 0.4); // Blend with texture

    finalColor = mix(finalColor * 1., finalColor * 1.5 + vec3(.6, .4, .2) , vUv.y - .5); // Add reflection effect
    // finalColor = vec3(vec2(vUv.y - .5), 0.);
    // Output the final color
    gl_FragColor = vec4(finalColor, color.a);
}
`;
