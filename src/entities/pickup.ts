import { Physics } from 'phaser';
import { GameScene } from '../scenes/game/gameScene';

let count = 0;
export type PickupType =
    | 'star'
    | 'powerup'
    | 'bomb'
    | 'bigstar'
    | 'life'
    | 'bossStar';

export class Pickup extends Physics.Arcade.Image {
    pickupType: PickupType;

    constructor(
        scene: GameScene,
        x: number,
        y: number,
        pickupType: PickupType
    ) {
        super(scene, x, y, 'packed', pickupType);
        this.setName(`${pickupType} ${count++}`);
        scene.add.existing(this);
        scene.pickups?.add(this);
        scene.physics.add.existing(this);
        this.setBounce(1).setCollideWorldBounds(true);
        this.pickupType = pickupType;
    }

    preUpdate(time: number, delta: number) {
        const gs = this.scene as GameScene;
        const dx = this.x - gs.player!.x;
        const dy = this.y - gs.player!.y;
        const dd = dx * dx + dy * dy;
        const magnetDD =
            this.pickupType === 'bossStar' ? 1024 * 1024 : gs.player!.magnetDD;
        if (dd < magnetDD) {
            const v = new Phaser.Math.Vector2(dx, dy).normalize();
            const d = 1536 - Math.sqrt(dd);
            this.body.velocity.x = this.body.velocity.x * 0.9 - v.x * d * 0.1;
            this.body.velocity.y = this.body.velocity.y * 0.9 - v.y * d * 0.1;
        } else {
            const v = new Phaser.Math.Vector2(dx, dy).normalize();
            this.body.velocity.x = this.body.velocity.x * 0.95 - 320 * 0.05;
            this.body.velocity.y = this.body.velocity.y * 0.9;
        }
        if (this.x <= this.width / 2 + 1) {
            this.destroy();
        }
    }

    onCollide(other: Phaser.GameObjects.Sprite) {
        this.destroy();
    }
}
