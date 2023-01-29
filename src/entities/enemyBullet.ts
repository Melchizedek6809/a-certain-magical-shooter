import { Physics } from 'phaser';
import { GameScene } from '../scenes/game/gameScene';

type BulletFrame = "projectile" | "bossProjectile" | "bossTeaProjectile";

export class EnemyBullet extends Physics.Arcade.Image {
    constructor(scene: GameScene, x: number, y: number, frame: BulletFrame = "projectile") {
        super(scene, x, y, 'packed', frame);
        scene.add.existing(this);
        scene.enemyProjectiles?.add(this);
        scene.physics.add.existing(this);
        const s = frame === "projectile" ? 16 : 32;
        this.body.setSize(s, s, true);
    }

    preUpdate(time: number, delta: number) {
        if (this.x <= this.width / 2 || this.y < 0 || this.y > 1280 || this.x > 1300) {
            this.destroy();
        }
    }
}
