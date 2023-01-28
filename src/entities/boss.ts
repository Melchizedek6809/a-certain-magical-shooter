import { Physics } from 'phaser';
import { GameScene } from '../scenes/game/gameScene';
import { UIScene } from '../scenes/ui/uiScene';
import { EnemyBullet } from './enemyBullet';
import { HitFX } from './hitFx';

let count = 0;

export class Boss extends Physics.Arcade.Sprite {
    health = 100;
    maxHealth = 100;

    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 'packed', 'boss');
        this.play('boss_animated');
        this.setName(`Cirno ${count++}`);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.enemies?.add(this);
        this.body.setSize(32, 72, true);
        this.body.onOverlap = true;
        scene.boss = this;
    }

    shoot() {
        const gs = this.scene as GameScene;
        const bullet = new EnemyBullet(gs, this.x, this.y);
        const dx = gs.player!.x - this.x;
        const dy = gs.player!.y - this.y;
        const v = new Phaser.Math.Vector2(dx, dy).normalize();
        bullet.setVelocity(v.x * 400, v.y * 400);
    }

    update(time: number, delta: number) {
        const ui = this.scene.scene.get("UIScene") as UIScene;
        ui.events.emit("setBossHealth", this.health, this.maxHealth);
    }

    onCollide(other: Phaser.GameObjects.Sprite) {
        new HitFX(this.scene as GameScene, other.x, other.y);
        if (this.health-- <= 0) {
            for(let i=0;i<16;i++){
                const ox = (Math.random() - 0.5)*64;
                const oy = (Math.random() - 0.5)*64;
                new HitFX(this.scene as GameScene, this.x + ox, this.y + oy);
            }
            (this.scene as GameScene).boss = undefined;
            this.destroy();
        }
    }
}
