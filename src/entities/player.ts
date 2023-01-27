import { Physics } from 'phaser';
import { GameScene, KeyMap } from '../scenes/game/gameScene';
import { Projectile } from './projectile';
import { Pickup } from './pickup';
import { EnemyBullet } from './enemyBullet';
import { UIScene } from '../scenes/ui/uiScene';
import { Fairy } from './fairy';

export class Player extends Physics.Arcade.Sprite {
    isDead = false;
    invincibleUntil = 0;
    shotCooldown = 0;
    magnetDD = 56*56;
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
        } else {
            this.setVisible(false);
            this.setVelocity(0,0);
        }
    }

    die() {
        if(this.invincibleUntil >= this.scene.time.now){return;}
        const ui = this.scene.scene.get("UIScene") as UIScene;
        if(--ui.lives >= 0){
            ui.bombs = 3;
            this.invincibleUntil = this.scene.time.now + 3000;
            this.scene.scene.get("UIScene").events.emit('refresh');
            return;
        } else {
            this.isDead = true;
        }
    }

    onPickup(other:Pickup) {
        switch(other.pickupType){
            default:
            case "star":
                this.scene.scene.get("UIScene").events.emit('incScore', 5);
                break;
            case "powerup":
                this.scene.scene.get("UIScene").events.emit('incScore', 5);
                break;
            case "bomb":
                this.scene.scene.get("UIScene").events.emit('incBomb');
                break;
            case "bigstar":
                this.scene.scene.get("UIScene").events.emit('incScore', 500);
                break;
            case "life":
                this.scene.scene.get("UIScene").events.emit('incLife');
                break;
        }
    }

    onCollide(other:any) {
        if(other instanceof Pickup){
            return this.onPickup(other);
        } else if (other instanceof EnemyBullet){
            this.die();
        } else if (other instanceof Fairy){
            this.die();
        }
    }
}

