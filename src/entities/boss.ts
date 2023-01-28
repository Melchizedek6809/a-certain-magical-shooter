import { Physics, Types } from 'phaser';
import { GameScene, KeyMap } from '../scenes/game/gameScene';
import { EnemyBullet } from './enemyBullet';
import { Pickup } from './pickup';
import { Player } from './player';

let count = 0;

export class Boss extends Physics.Arcade.Sprite {
    health = 500;

    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 'boss');
        this.setName(`Cirno ${count++}`);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.enemies?.add(this);
        this.body.setSize(32, 72, true);
        this.body.onOverlap = true;
    }

    onCollide(other: Phaser.GameObjects.Sprite) {
        if (this.health-- <= 0) {
            this.destroy();
        }
    }
}
