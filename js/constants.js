// js/constants.js
// ─── Dimensiones del juego ───────────────────────
const W = 1920;
const H = 1080;
 
// ─── Colores de los bloques por valor (0 = vacío) ──
const COLORS = [
  0,          // 0 = vacío (sin bloque)
  0xE24B4A,   // 1 = Rojo
  0xEF9F27,   // 2 = Naranja
  0x639922,   // 3 = Verde
  0x378ADD,   // 4 = Azul
  0xD4537E,   // 5 = Rosa
  0x7F77DD,   // 6 = Morado
];
 
// ─── Tipos de power-ups disponibles ─────────────
const POWERUP_TYPES = ['wide', 'multiball', 'slow'];
 
// ─── Colores de los power-ups ────────────────────
const POWERUP_COLORS = {
  wide:      0x5DCAA5,  // Verde: paleta más ancha
  multiball: 0xD85A30,  // Rojo:  bola extra
  slow:      0xAFA9EC,  // Morado: ralentizar
};
 
// ─── Mapas de niveles ────────────────────────────
// Cada número corresponde al color en COLORS[]
// 0 = sin bloque
const LEVELS = [
  // Nivel 1 - Forma de diamante
  [
    [0,1,2,3,2,1,0],
    [1,2,3,4,3,2,1],
    [2,3,4,5,4,3,2],
    [1,2,3,4,3,2,1],
    [0,1,2,3,2,1,0],
  ],
  // Nivel 2 - Patrón de rejilla
  [
    [5,4,3,2,3,4,5],
    [4,0,2,0,2,0,4],
    [3,2,1,2,1,2,3],
    [4,0,2,0,2,0,4],
    [5,4,3,2,3,4,5],
    [0,1,0,1,0,1,0],
  ],
  // Nivel 3 - Arcoíris (filas de color sólido)
  [
    [1,1,1,1,1,1,1],
    [2,2,2,2,2,2,2],
    [3,3,3,3,3,3,3],
    [4,4,4,4,4,4,4],
    [5,5,5,5,5,5,5],
    [6,6,6,6,6,6,6],
  ]
];
