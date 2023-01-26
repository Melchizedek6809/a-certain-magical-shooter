import { Physics, Types } from 'phaser';
import { GameScene, KeyMap } from '../scenes/game/gameScene';

export class Projectile extends Physics.Arcade.Sprite {
    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 'projectile');
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }

    preUpdate(time: number, delta: number) {
        this.body.velocity.x = this.body.velocity.x * 0.66 + 800 * 0.33;
    }
}
