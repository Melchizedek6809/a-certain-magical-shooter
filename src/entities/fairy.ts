import { Physics, Types } from 'phaser';
import { GameScene, KeyMap } from '../scenes/game/gameScene';
import { EnemyBullet } from './enemyBullet';
import { Pickup } from './pickup';
import { Player } from './player';

let count = 0;

export interface FairyCommand {
    op: 'move' | 'teleport' | 'shoot' | 'despawn';
    shootEvery: number;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
}

export class Fairy extends Physics.Arcade.Sprite {
    health = 5;
    origX: number;
    origY: number;
    goalX = 0;
    goalY = 0;

    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 'fairy');
        this.setName(`Fairy ${count++}`);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.enemies?.add(this);
        this.body.setSize(24, 32, true);
        this.body.onOverlap = true;
        this.body.onCollide = true;

        this.origX = x;
        this.origY = y;
        this.regoal();
    }

    regoal() {
        this.goalX = this.origX + (Math.random() - 0.5) * 48;
        this.goalY = this.origY + (Math.random() - 0.5) * 48;
    }

    shoot() {
        const gs = this.scene as GameScene;
        const bullet = new EnemyBullet(gs, this.x, this.y);
        const dx = gs.player!.x - this.x;
        const dy = gs.player!.y - this.y;
        const dd = dx * dx + dy * dy;
        const v = new Phaser.Math.Vector2(dx, dy).normalize();
        bullet.setVelocity(v.x * 400, v.y * 400);
    }

    preUpdate(time: number, delta: number) {
        if (Math.random() * 50 < 1) {
            this.regoal();
        }
        if (Math.random() * 1000 < 1) {
            this.shoot();
        }
        const dx = this.x - this.goalX;
        const dy = this.y - this.goalY;
        const dd = dx * dx + dy * dy;
        const v = new Phaser.Math.Vector2(dx, dy).normalize();
        this.body.velocity.x = this.body.velocity.x * 0.95 - v.x * 400 * 0.005;
        this.body.velocity.y = this.body.velocity.y * 0.95 - v.y * 400 * 0.005;
    }

    onCollide(other: Phaser.GameObjects.Sprite) {
        if (this.health-- <= 0) {
            const stars = Math.floor(Math.random() * 3 + 1);
            const pows = Math.floor(Math.random() * 2);
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
            if (Math.floor(Math.random() * 100) === 0) {
                const pu = new Pickup(
                    this.scene as GameScene,
                    this.x,
                    this.y,
                    'bomb'
                );
                pu.setVelocity(Math.random() * 1500, Math.random() * 1500);
            }
            if (Math.floor(Math.random() * 300) === 0) {
                const pu = new Pickup(
                    this.scene as GameScene,
                    this.x,
                    this.y,
                    'life'
                );
                pu.setVelocity(Math.random() * 2500, Math.random() * 2500);
            }
            const gs = this.scene as GameScene;
            this.destroy();
            gs.checkEnemies();
        }
    }
}
