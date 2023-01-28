import { Physics } from 'phaser';
import { GameScene } from '../scenes/game/gameScene';
import { UIScene } from '../scenes/ui/uiScene';

let count = 0;

export class Boss extends Physics.Arcade.Sprite {
    health = 500;
    maxHealth = 500;

    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 'boss');
        this.setName(`Cirno ${count++}`);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.enemies?.add(this);
        this.body.setSize(32, 72, true);
        this.body.onOverlap = true;

    }

    update(time: number, delta: number) {
        const ui = this.scene.scene.get("UIScene") as UIScene;
        ui.events.emit("setBossHealth", this.health, this.maxHealth);
    }

    onCollide(other: Phaser.GameObjects.Sprite) {
        if (this.health-- <= 0) {
            this.destroy();
        }
    }
}
