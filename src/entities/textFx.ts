import { GameObjects } from 'phaser';
import { GameScene } from '../scenes/game/gameScene';

export class TextFX extends GameObjects.DOMElement {
    ttl = 10000;

    constructor(
        scene: GameScene,
        x: number,
        y: number,
        text: string,
        ttl = 3000
    ) {
        const ele = document.createElement('div');
        ele.innerText = text;
        ele.classList.add('text-fx');
        super(scene, x, y, ele);
        this.ttl = ttl;

        scene.add.existing(this);
    }

    preUpdate(time: number, delta: number) {
        this.ttl -= delta;
        if (this.ttl < 0) {
            this.destroy();
        } else {
            const t = Math.min(1, 1 - this.ttl / 1000);
            this.setAlpha(1 - t);
            this.x += delta / 100;
            this.y -= delta / 137;
            this.scale += delta / 4800;
        }
    }
}
