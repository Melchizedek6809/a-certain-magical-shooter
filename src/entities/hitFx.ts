import { GameObjects } from 'phaser';
import { GameScene } from '../scenes/game/gameScene';

export class HitFX extends GameObjects.Image {
    ttl = 200;
    initTtl = 200;

    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 'packed', 'hit');
        scene.add.existing(this);
    }

    preUpdate(time: number, delta: number) {
        this.ttl -= delta;
        if (this.ttl < 0) {
            this.destroy();
        } else {
            const t = 1 - (this.ttl / this.initTtl);
            this.setScale(1+t*2, 1+t*2);
            this.setAlpha(1-t);
        }
    }
}
