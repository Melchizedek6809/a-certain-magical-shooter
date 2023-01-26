import { Physics, Types } from 'phaser';
import { GameScene, KeyMap } from '../scenes/game/gameScene';

let count = 0;

export class Fairy extends Physics.Arcade.Sprite {
    health = 5;

    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 'fairy');
        this.setName(`Fairy ${count++}`);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.enemies?.add(this);
        this.body.setSize(24,32,true);
        this.body.onOverlap = true;
        this.body.onCollide = true;
    }

    preUpdate(time: number, delta: number) {

    }

    onCollide(other:Phaser.GameObjects.Sprite) {
        if(this.health-- <= 0){
            this.destroy();
        }
    }
}
