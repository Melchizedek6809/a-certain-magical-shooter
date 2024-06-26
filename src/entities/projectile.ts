import { Physics } from 'phaser';
import { GameScene } from '../scenes/game/gameScene';

export class Projectile extends Physics.Arcade.Image {
    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 'packed', 'playerProjectile');
        scene.add.existing(this);
        scene.playerProjectiles?.add(this);
        scene.physics.add.existing(this);
        this.body?.setSize(32, 16, true);
    }

    preUpdate(time: number, delta: number) {
        if(this.body){
            this.body.velocity.x = this.body.velocity.x * 0.9 + 800 * 0.1;
        }
        if (this.x > 1300) {
            this.destroy();
        }
    }

    onCollide(other: Phaser.GameObjects.Sprite) {
        this.destroy();
    }
}
