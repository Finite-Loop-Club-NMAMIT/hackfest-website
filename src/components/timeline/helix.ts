import * as THREE from "three";

export class HelixCurve extends THREE.Curve<THREE.Vector3> {
  radius: number;
  pitch: number;
  turns: number;
  constructor(radius: number, pitch: number, turns: number) {
    super();
    this.radius = radius;
    this.pitch = pitch;
    this.turns = turns;
  }

  getPoint(t: number): THREE.Vector3 {
    const angle = 2 * Math.PI * this.turns * t;
    const x = this.radius * Math.sin(angle);
    const y = -this.pitch * t;
    const z = this.radius * Math.cos(angle);
    return new THREE.Vector3(x, y, z);
  }
}
