import * as THREE from 'three';

export const FOV = 35;
export const SCREEN_W = 0.62;
export const SCREEN_H = 0.35;
export const SCREEN_POS = new THREE.Vector3(0, 1.17, -0.3);
export const DESK_Y = 0.76; // top surface height
/** Smoothed progress at which the camera has fully arrived at the screen. */
export const ARRIVE = 0.86;

export const C = {
  ink: '#050507',
  wall: '#1d1f2e',
  floor: '#15131b',
  wood: '#8a5a34',
  woodDark: '#5e3c22',
  metal: '#2a2c36',
  plastic: '#1b1c24',
  cream: '#efe7d6',
  amber: '#f2a33a',
  leaf: '#3f8f5b',
  leafDark: '#2c6b45',
  terracotta: '#b9603f',
};
