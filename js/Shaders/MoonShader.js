export const vertexShaderMoon = /*glsl*/`
varying vec2 vUv;

void main() {
    vUv = uv; // Assurez-vous que 'uv' est bien défini dans la géométrie
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const fragmentShaderMoon = /*glsl*/`
uniform sampler2D uTexture;
varying vec2 vUv; // Recevoir les coordonnées UV

void main() {
    vec4 textureColor = texture2D(uTexture, vUv); // Échantillonner la texture
    gl_FragColor = textureColor; // Appliquer la couleur de la texture
}
`;