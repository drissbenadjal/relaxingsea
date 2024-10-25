export const vertexShaderSun = /*glsl*/`
varying vec2 vUv;
uniform float time;

void main() {
    vUv = uv;
    
    // Start with the original position of the vertex
    vec3 pos = position;

    // Apply wave-like displacement using sine functions
    // The time uniform will animate the waves
    float waveHeight = 0.04; // Height of the waves
    float frequency = 10.0; // Frequency of the waves
    
    // Displace the y position (up and down) based on sine waves
    pos.z += sin(pos.x * frequency + time) * waveHeight;
    pos.z += cos(pos.y * frequency + time * 0.5) * waveHeight;

    // Standard transformation of vertex position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const fragmentShaderSun = /*glsl*/`
uniform float time;
uniform sampler2D uTexture;
varying vec2 vUv;

void main() {
    // Center of the sun (adjust to your geometry)
    vec2 center = vec2(0.5, 0.5);
    
    // Distance from the center to create radial gradient
    float dist = distance(vUv, center);
    
    // Base sun color (orange to reddish gradient)
    vec3 innerColor = vec3(1.0, 0.6, 0.1); // Orangish-yellow
    vec3 outerColor = vec3(1.0, 0.3, 0.0); // Deep orange to reddish

    // Smooth transition for the gradient using distance
    float intensity = smoothstep(0.3, 0.7, dist);
    
    // Mix inner and outer color based on distance from the center
    vec3 sunColor = mix(innerColor, outerColor, intensity);
    
    // Add a soft glow effect (lighter, warmer glow for sunset)
    float glow = smoothstep(0.0, 0.5, .4 - dist);
    vec3 glowColor = vec3(1.0, 0.7, 0.1) * glow; // Warm, soft glow

    // Combine the sun color and the glow
    vec3 finalColor = sunColor + glowColor;
    
    // Output the final color with full opacity
    gl_FragColor = vec4(finalColor, 1.0);
}
`;