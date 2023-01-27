import { Physics, Types } from 'phaser';
import { GameScene, KeyMap } from '../scenes/game/gameScene';

let count = 0;

export class Projectile extends Physics.Arcade.Sprite {
    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 'playerProjectile');
        this.setName(`playerProjectile ${count++}`);
        scene.add.existing(this);
        scene.playerProjectiles?.add(this);
        scene.physics.add.existing(this);
        this.body.setCircle(16, 0, 0);
        this.setBlendMode(Phaser.BlendModes.ADD);
    }

    preUpdate(time: number, delta: number) {
        this.body.velocity.x = this.body.velocity.x * 0.9 + 800 * 0.1;
        if (this.x > 1300) {
            this.destroy();
        }
    }

    onCollide(other: Phaser.GameObjects.Sprite) {
        this.destroy();
    }
}
