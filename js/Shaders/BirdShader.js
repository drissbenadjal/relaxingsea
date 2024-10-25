export const vertexShaderImage = /*glsl*/`
varying vec2 vUv;
uniform float time;

void main() {
    vUv = uv; // Pass the UV coordinates to the fragment shader
    
    // Create a wave effect on the Y position
    vec3 pos = position;
    pos.y += sin(pos.x * 3.0 + time) * 0.1; // Adjust frequency and amplitude
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;


export const fragmentShaderImage = /*glsl*/`
uniform sampler2D uTexture;
varying vec2 vUv;
uniform bool birdNight;

void main() {
    vec4 color = texture2D(uTexture, vUv);
    //changer la coleur les mettre en blanc
    if(birdNight){
        color.r = 1.0;
        color.g = 1.0;
        color.b = 1.0;
    }

    if (color.a < .1) {
        discard;
    }
    // color.r = 1.0;
    // color.g = 1.0;
    // color.b = 1.0;
    gl_FragColor = vec4(color.rgb, color.a); // Preserve alpha channel for transparency
}
`;
