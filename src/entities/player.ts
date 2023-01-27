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
    magnetDD = 56 * 56;
    power = 0;
    focus = 0;
    keymap: KeyMap;

    constructor(scene: GameScene, x: number, y: number, keymap: KeyMap) {
        super(scene, x, y, 'player');
        this.setName('Player');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setBounce(1).setCollideWorldBounds(true);
        this.body.setSize(6, 6, true);

        this.keymap = keymap;
    }

    blast() {
        if (this.shotCooldown > this.scene.time.now) {
            return;
        }
        this.shotCooldown = this.scene.time.now + 50;
        const powerLevel = Math.floor(this.power / 10);
        const f = 1 - this.focus;
        switch (powerLevel) {
            case 0:
            default:
                new Projectile(this.scene as GameScene, this.x + 64, this.y);
                break;
            case 1:
                new Projectile(
                    this.scene as GameScene,
                    this.x + 64,
                    this.y + 6 + 6 * f
                ).setVelocityY(f * 20);
                new Projectile(
                    this.scene as GameScene,
                    this.x + 64,
                    this.y - (6 + 6 * f)
                ).setVelocityY(f * -20);
                break;
            case 2:
                new Projectile(
                    this.scene as GameScene,
                    this.x + 64,
                    this.y + (8 + 8 * f)
                ).setVelocityY(f * 20);
                new Projectile(this.scene as GameScene, this.x + 64, this.y);
                new Projectile(
                    this.scene as GameScene,
                    this.x + 64,
                    this.y - (8 + 8 * f)
                ).setVelocityY(f * -20);
                break;
            case 3:
                new Projectile(
                    this.scene as GameScene,
                    this.x + 64,
                    this.y - (12 + 12 * f)
                ).setVelocityY(f * -30);
                new Projectile(
                    this.scene as GameScene,
                    this.x + 64,
                    this.y - (6 + 6 * f)
                ).setVelocityY(f * -15);
                new Projectile(
                    this.scene as GameScene,
                    this.x + 64,
                    this.y + (6 + 6 * f)
                ).setVelocityY(f * 15);
                new Projectile(
                    this.scene as GameScene,
                    this.x + 64,
                    this.y + (12 + 12 * f)
                ).setVelocityY(f * 30);
                break;
            case 4:
                new Projectile(
                    this.scene as GameScene,
                    this.x + 64,
                    this.y - (16 + 16 * f)
                ).setVelocityY(f * -40);
                new Projectile(
                    this.scene as GameScene,
                    this.x + 64,
                    this.y - (8 + 8 * f)
                ).setVelocityY(f * -20);
                new Projectile(this.scene as GameScene, this.x + 64, this.y);
                new Projectile(
                    this.scene as GameScene,
                    this.x + 64,
                    this.y + (8 + 8 * f)
                ).setVelocityY(f * 20);
                new Projectile(
                    this.scene as GameScene,
                    this.x + 64,
                    this.y + (16 + 16 * f)
                ).setVelocityY(f * 40);
                break;
            case 5:
                new Projectile(
                    this.scene as GameScene,
                    this.x + 64,
                    this.y - (18 + 18 * f)
                ).setVelocityY(f * -60);
                new Projectile(
                    this.scene as GameScene,
                    this.x + 64,
                    this.y - (12 + 12 * f)
                ).setVelocityY(f * -40);
                new Projectile(
                    this.scene as GameScene,
                    this.x + 64,
                    this.y - (6 + 6 * f)
                ).setVelocityY(f * -20);
                new Projectile(
                    this.scene as GameScene,
                    this.x + 64,
                    this.y + (6 + 6 * f)
                ).setVelocityY(f * 20);
                new Projectile(
                    this.scene as GameScene,
                    this.x + 64,
                    this.y + (12 + 12 * f)
                ).setVelocityY(f * 40);
                new Projectile(
                    this.scene as GameScene,
                    this.x + 64,
                    this.y + (18 + 18 * f)
                ).setVelocityY(f * 60);

                break;
        }
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
        const speed = focus ? 192 : 512;
        mx = m.x * speed * 0.33 + this.body.velocity.x * 0.66;
        my = m.y * speed * 0.33 + this.body.velocity.y * 0.66;
        this.setVelocity(mx, my);

        if (this.invincibleUntil > this.scene.time.now) {
            this.setAlpha(
                Boolean((this.scene.time.now / 200) & 1) ? 1.0 : 0.33
            );
        } else {
            this.setAlpha(1);
        }

        if (focus) {
            this.focus = Math.min(1, this.focus + delta / 500);
        } else {
            this.focus = Math.max(0, this.focus - delta / 500);
        }
    }

    update(time: number, delta: number) {
        if (!this.isDead) {
            this.updateControls(delta);
        } else {
            this.setVisible(false);
            this.setVelocity(0, 0);
        }
    }

    die() {
        if (this.invincibleUntil >= this.scene.time.now) {
            return;
        }
        const ui = this.scene.scene.get('UIScene') as UIScene;
        if (--ui.lives >= 0) {
            ui.bombs = 3;
            this.power = 0;
            this.scene.scene.get('UIScene').events.emit('setPower', this.power);
            this.invincibleUntil = this.scene.time.now + 1000;
            this.scene.scene.get('UIScene').events.emit('refresh');
            return;
        } else {
            this.isDead = true;
        }
    }

    powerup() {
        this.power++;
        const overflow = this.power - 50;
        if (overflow > 0) {
            this.power = 50;
            this.scene.scene
                .get('UIScene')
                .events.emit('incScore', 5 * overflow);
        }
        this.scene.scene.get('UIScene').events.emit('setPower', this.power);
    }

    onPickup(other: Pickup) {
        switch (other.pickupType) {
            default:
            case 'star':
                this.scene.scene.get('UIScene').events.emit('incScore', 5);
                break;
            case 'powerup':
                this.powerup();
                break;
            case 'bomb':
                this.scene.scene.get('UIScene').events.emit('incBomb');
                break;
            case 'bigstar':
                this.scene.scene.get('UIScene').events.emit('incScore', 500);
                break;
            case 'life':
                this.scene.scene.get('UIScene').events.emit('incLife');
                break;
        }
    }

    onCollide(other: any) {
        if (this.isDead) {
            return;
        }
        if (other instanceof Pickup) {
            return this.onPickup(other);
        } else if (other instanceof EnemyBullet) {
            this.die();
        } else if (other instanceof Fairy) {
            this.die();
        }
    }
}
