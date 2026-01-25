declare module '@esotericsoftware/spine-phaser' {
  import Phaser from 'phaser';

  export class SpinePlugin extends Phaser.Plugins.ScenePlugin {
    constructor(scene: Phaser.Scene);
  }

  export interface SpineGameObject extends Phaser.GameObjects.GameObject {
    play(animationName: string, loop?: boolean): this;
    setSkin(skinName: string): this;
    getBounds(): {
      size: {
        x: number;
        y: number;
      };
    };
    setScale(scale: number): this;
    setPosition(x: number, y: number): this;
    getAnimationList(): string[];
  }
}
