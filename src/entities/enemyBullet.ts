import { Physics } from 'phaser';
import { GameScene } from '../scenes/game/gameScene';

type BulletFrame =
    | 'projectile'
    | 'bossProjectile'
    | 'bossTeaProjectile'
    | 'bossSickleProjectile';

export class EnemyBullet extends Physics.Arcade.Image {
    constructor(
        scene: GameScene,
        x: number,
        y: number,
        frame: BulletFrame = 'projectile'
    ) {
        super(scene, x, y, 'packed', frame);
        scene.add.existing(this);
        scene.enemyProjectiles?.add(this);
        scene.physics.add.existing(this);
        let r = 32;
        switch (frame) {
            case 'projectile':
                r = 16;
                break;
            case 'bossTeaProjectile':
                r = 48;
                break;
        }
        this.setDepth(1);
        this.body.setCircle(r);
    }

    preUpdate(time: number, delta: number) {
        if (
            this.x <= -this.width ||
            this.y < -this.width ||
            this.y > 720 + this.width ||
            this.x > 1280 + this.width
        ) {
            this.destroy();
        }
    }
}
