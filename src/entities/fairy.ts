import { Physics } from 'phaser';
import { GameScene } from '../scenes/game/gameScene';
import { EnemyBullet } from './enemyBullet';
import { Pickup } from './pickup';
import { HitFX } from './hitFx';

let count = 0;
export class Fairy extends Physics.Arcade.Sprite {
    health = 3;

    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 'packed', 'fairy_0');
        this.setName(`Fairy ${count++}`);
        this.play('fairy_animated');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.enemies?.add(this);
        this.body.setSize(24, 32, true);
        this.body.onOverlap = true;
    }

    shoot() {
        this.scene.sound.add('bossShoot').play();
        const gs = this.scene as GameScene;
        const bullet = new EnemyBullet(gs, this.x, this.y);
        const dx = gs.player!.x - this.x;
        const dy = gs.player!.y - this.y;
        const v = new Phaser.Math.Vector2(dx, dy).normalize();
        bullet.setVelocity(v.x * 400, v.y * 400);
    }

    wave() {}
    teaWave() {}
    reverseWave() {}
    sickleShoot() {}

    onCollide(other: Phaser.GameObjects.Sprite) {
        if (this.health-- <= 0) {
            const stars = Math.floor(Math.random() * 3 + 1);
            const pows = Math.floor(Math.random() * 3 + 1);
            for (let i = 0; i < stars; i++) {
                const pu = new Pickup(
                    this.scene as GameScene,
                    this.x,
                    this.y,
                    'star'
                );
                pu.setVelocity(Math.random() * 600, Math.random() * 600);
            }
            for (let i = 0; i < pows; i++) {
                const pu = new Pickup(
                    this.scene as GameScene,
                    this.x,
                    this.y,
                    'powerup'
                );
                pu.setVelocity(Math.random() * 900, Math.random() * 900);
            }
            if (Math.floor(Math.random() * 50) === 0) {
                const pu = new Pickup(
                    this.scene as GameScene,
                    this.x,
                    this.y,
                    'bigstar'
                );
                pu.setVelocity(Math.random() * 1500, Math.random() * 1500);
            }
            if (Math.floor(Math.random() * 300) === 0) {
                const pu = new Pickup(
                    this.scene as GameScene,
                    this.x,
                    this.y,
                    'bomb'
                );
                pu.setVelocity(Math.random() * 1500, Math.random() * 1500);
            }
            if (Math.floor(Math.random() * 900) === 0) {
                const pu = new Pickup(
                    this.scene as GameScene,
                    this.x,
                    this.y,
                    'life'
                );
                pu.setVelocity(Math.random() * 2500, Math.random() * 2500);
            }
            const gs = this.scene as GameScene;
            new HitFX(gs, this.x, this.y);
            this.scene.sound.add('explosion').play();
            this.destroy();
        }
    }
}
