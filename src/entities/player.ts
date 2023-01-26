import { Physics, Types } from 'phaser';
import { GameScene, KeyMap } from '../scenes/game/gameScene';
import { Projectile } from './projectile';

export class Player extends Physics.Arcade.Sprite {
    isDead = false;
    shotCooldown = 0;
    keymap: KeyMap;

    constructor(scene: GameScene, x: number, y: number, keymap: KeyMap) {
        super(scene, x, y, 'player');
        this.setName('Player');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setBounce(1).setCollideWorldBounds(true);
        this.body.setSize(6,6,true);

        this.keymap = keymap;
    }

    blast() {
        if (this.shotCooldown > this.scene.time.now) {
            return;
        }
        this.shotCooldown = this.scene.time.now + 25;
        new Projectile(this.scene as GameScene, this.x + 64, this.y);
    }

    updateControls(delta: number) {
        let left = this.keymap.Left.isDown;
        let right = this.keymap.Right.isDown;
        let top = this.keymap.Up.isDown;
        let down = this.keymap.Down.isDown;
        let focus = this.keymap.Shift.isDown;
        let blast = this.keymap.Z.isDown;

        if (this.scene.input.gamepad.gamepads[0]) {
            const gamepad = this.scene.input.gamepad.gamepads[0];
            if (gamepad.left) {
                left = true;
            }
            if (gamepad.right) {
                right = true;
            }
            if (gamepad.up) {
                top = true;
            }
            if (gamepad.down) {
                down = true;
            }
            if (gamepad.A) {
                blast = true;
            }
        }

        if (blast) {
            this.blast();
        }

        let mx = left ? -1 : right ? 1 : 0;
        let my = top ? -1 : down ? 1 : 0;
        const m = new Phaser.Math.Vector2(mx, my);
        m.normalize();
        const speed = focus ? 192 : 384;
        mx = m.x * speed * 0.33 + this.body.velocity.x * 0.66;
        my = m.y * speed * 0.33 + this.body.velocity.y * 0.66;
        this.setVelocity(mx, my);
    }

    update(time: number, delta: number) {
        if (!this.isDead) {
            this.updateControls(delta);
        }
    }
}
