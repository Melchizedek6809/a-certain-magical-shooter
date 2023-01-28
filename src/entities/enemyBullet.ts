import { Physics } from 'phaser';
import { GameScene } from '../scenes/game/gameScene';

export class EnemyBullet extends Physics.Arcade.Image {
    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 'packed', 'projectile');
        scene.add.existing(this);
        scene.enemyProjectiles?.add(this);
        scene.physics.add.existing(this);
        this.body.setSize(16, 16, true);
    }

    preUpdate(time: number, delta: number) {
        if (this.x <= this.width / 2 || this.y < 0 || this.y > 1280) {
            this.destroy();
        }
    }
}
