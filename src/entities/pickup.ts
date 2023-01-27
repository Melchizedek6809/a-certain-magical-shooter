import { Physics, Types } from 'phaser';
import { GameScene, KeyMap } from '../scenes/game/gameScene';

let count = 0;
export type PickupType = "star" | "powerup" | "bomb" | "bigstar" | "life";

export class Pickup extends Physics.Arcade.Sprite {
    pickupType: PickupType;

    constructor(scene: GameScene, x: number, y: number, pickupType: PickupType) {
        super(scene, x, y, pickupType);
        this.setName(`${pickupType} ${count++}`);
        scene.add.existing(this);
        scene.pickups?.add(this);
        scene.physics.add.existing(this);
        this.setBounce(1).setCollideWorldBounds(true);
        this.pickupType = pickupType;
        this.setScale(0.5,0.5);
    }

    preUpdate(time: number, delta: number) {
        const gs = this.scene as GameScene;
        const dx = this.x - gs.player!.x;
        const dy = this.y - gs.player!.y;
        const dd = dx*dx + dy*dy;
        if(dd < gs.player!.magnetDD){
            const v = new Phaser.Math.Vector2(dx,dy).normalize();
            this.body.velocity.x = this.body.velocity.x * 0.9 - v.x * 400 * 0.1;
            this.body.velocity.y = this.body.velocity.y * 0.9 - v.y * 400 * 0.1;
        } else {
            const v = new Phaser.Math.Vector2(dx,dy).normalize();
            this.body.velocity.x = this.body.velocity.x * 0.9 - 400 * 0.1;
            this.body.velocity.y = this.body.velocity.y * 0.9;
        }
        if(this.x<=(this.width/2)){
            this.destroy();
        }
    }

    onCollide(other:Phaser.GameObjects.Sprite) {
        this.destroy();
    }
}