import { GameObjects, Physics } from 'phaser';
import { GameScene, KeyMap } from '../scenes/game/gameScene';
import { Projectile } from './projectile';
import { Pickup } from './pickup';
import { EnemyBullet } from './enemyBullet';
import { UIScene } from '../scenes/ui/uiScene';
import { Fairy } from './fairy';
import { HitFX } from './hitFx';

export class Player extends Physics.Arcade.Sprite {
    isDead = false;
    ungracefulUntil = 0;
    dyingOn = 0;
    invincibleUntil = 0;
    bombingUntil = 0;
    shotCooldown = 0;
    magnetDD = 56 * 56;
    power = 0;
    focus = 0;
    bossStarsPickedUp = 0;
    cantCaptureSpellCard = false;
    keymap: KeyMap;

    bombBeam: GameObjects.Image;
    bombBeamRepeater: GameObjects.TileSprite;
    beamCollider: Physics.Arcade.Image;
    graceCollider: Physics.Arcade.Image;

    constructor(scene: GameScene, x: number, y: number, keymap: KeyMap) {
        super(scene, x, y, 'packed', 'player_0');
        this.play('player_animated');
        this.setName('Player');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setBounce(1).setCollideWorldBounds(true);
        this.setOrigin(0.6, 0.5);
        this.body.setSize(6, 6, true).setOffset(75, 61);

        this.bombBeam = scene.add
            .image(x, y, 'packed', 'bombbeam')
            .setOrigin(0, 0.5)
            .setAlpha(0)
            .setScale(2, 2)
            .setDepth(-1);
        this.bombBeamRepeater = scene.add
            .tileSprite(x, y, 0, 0, 'packed', 'bombbeam_repeater')
            .setAlpha(0)
            .setOrigin(0, 0.5)
            .setDepth(-1)
            .setScale(2, 2)
            .setDisplaySize(1024, 128);

        this.bombBeam.setBlendMode(Phaser.BlendModes.ADD);
        this.bombBeamRepeater.setBlendMode(Phaser.BlendModes.ADD);


        this.beamCollider = scene.physics.add
            .image(x, y, 'packed', 'void')
            .setVisible(false)
            .setOrigin(0, 0.5)
            .setScale(0, 0);
        this.beamCollider.setName('beam');
        this.graceCollider = scene.physics.add
            .image(x, y, 'packed', 'void')
            .setVisible(false)
            .setScale(1.25, 1.25);
        scene.playerProjectiles?.add(this.beamCollider);
        this.setDepth(1);
        this.keymap = keymap;
    }

    blast() {
        if (this.shotCooldown > this.scene.time.now) {
            return;
        }
        if (this.bombingUntil > this.scene.time.now) {
            return;
        }
        this.shotCooldown = this.scene.time.now + 50;
        const powerLevel = Math.floor(this.power / 10);
        const f = 1 - this.focus;
        this.scene.sound.add('shot').play();
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
                    this.x + 56,
                    this.y + (8 + 8 * f)
                ).setVelocityY(f * 20);
                new Projectile(this.scene as GameScene, this.x + 64, this.y);
                new Projectile(
                    this.scene as GameScene,
                    this.x + 56,
                    this.y - (8 + 8 * f)
                ).setVelocityY(f * -20);
                break;
            case 3:
                new Projectile(
                    this.scene as GameScene,
                    this.x + 56,
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
                    this.x + 56,
                    this.y + (12 + 12 * f)
                ).setVelocityY(f * 30);
                break;
            case 4:
                new Projectile(
                    this.scene as GameScene,
                    this.x + 48,
                    this.y - (16 + 16 * f)
                ).setVelocityY(f * -40);
                new Projectile(
                    this.scene as GameScene,
                    this.x + 56,
                    this.y - (8 + 8 * f)
                ).setVelocityY(f * -20);
                new Projectile(this.scene as GameScene, this.x + 64, this.y);
                new Projectile(
                    this.scene as GameScene,
                    this.x + 56,
                    this.y + (8 + 8 * f)
                ).setVelocityY(f * 20);
                new Projectile(
                    this.scene as GameScene,
                    this.x + 48,
                    this.y + (16 + 16 * f)
                ).setVelocityY(f * 40);
                break;
            case 5:
                new Projectile(
                    this.scene as GameScene,
                    this.x + 44,
                    this.y - (18 + 18 * f)
                ).setVelocityY(f * -60);
                new Projectile(
                    this.scene as GameScene,
                    this.x + 58,
                    this.y - (12 + 12 * f)
                ).setVelocityY(f * -30);
                new Projectile(
                    this.scene as GameScene,
                    this.x + 64,
                    this.y - (4 + 4 * f)
                ).setVelocityY(f * -5);
                new Projectile(
                    this.scene as GameScene,
                    this.x + 64,
                    this.y + (4 + 4 * f)
                ).setVelocityY(f * 5);
                new Projectile(
                    this.scene as GameScene,
                    this.x + 58,
                    this.y + (12 + 12 * f)
                ).setVelocityY(f * 30);
                new Projectile(
                    this.scene as GameScene,
                    this.x + 44,
                    this.y + (18 + 18 * f)
                ).setVelocityY(f * 60);

                break;
        }
    }

    bomb() {
        this.cantCaptureSpellCard = true;
        if (this.isDead || this.bombingUntil >= this.scene.time.now) {
            return;
        }
        const ui = this.scene.scene.get('UIScene') as UIScene;
        if (ui.bombs > 0) {
            ui.bombs--;
            this.scene.sound.add('laserBeam').play();
            this.dyingOn = 0;
            this.bombingUntil = this.scene.time.now + 3500;
            ui.events.emit('refresh');
            const gs = this.scene as GameScene;
            gs.cameras.main.shake(
                3500,
                0.008,
                false,
                (cam: Phaser.Cameras.Scene2D.Camera, progress: number) => {
                    const i = Math.sin(progress * Math.PI) * 0.014;
                    cam.shakeEffect.intensity.x = i;
                    cam.shakeEffect.intensity.y = i;
                }
            );
        }
    }

    updateControls(delta: number) {
        let left = this.keymap.Left.isDown;
        let right = this.keymap.Right.isDown;
        let top = this.keymap.Up.isDown;
        let down = this.keymap.Down.isDown;
        let focus = this.keymap.Shift.isDown;
        let blast = this.keymap.Z.isDown || this.keymap.Y.isDown;
        let bomb = this.keymap.X.isDown;
        let gamepadMove = false;

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
            if (gamepad.B) {
                bomb = true;
            }
            if (gamepad.R1 || gamepad.L1) {
                focus = true;
            }

            if (gamepad.leftStick.length() > 0.01){
                const speed = focus ? 192 : 512;
                const m = gamepad.leftStick;
                const mx = m.x * speed * 0.33 + this.body.velocity.x * 0.66;
                const my = m.y * speed * 0.33 + this.body.velocity.y * 0.66;
                this.setVelocity(mx, my);
                gamepadMove = true;
            }
        }

        if (blast) {
            this.blast();
        }
        if (bomb) {
            this.bomb();
        }
        let speed = focus ? 192 : 512;

        if (this.bombingUntil > this.scene.time.now) {
            this.magnetDD = 1536 * 1536;
            this.bombBeam.alpha = Math.min(1, this.bombBeam.alpha + 0.04);
            this.beamCollider.setScale(2048, 128);
            speed = 192;
        } else {
            this.magnetDD = 64 * 64;
            this.bombBeam.alpha = Math.max(0, this.bombBeam.alpha - 0.01);
            this.beamCollider.setScale(0, 0);
        }
        if (this.bombBeam.alpha <= 0) {
            this.bombBeam.setVisible(false);
            this.bombBeamRepeater.setVisible(false);
        } else {
            this.bombBeam.setVisible(true);
            this.bombBeamRepeater
                .setAlpha(this.bombBeam.alpha)
                .setVisible(true);
        }

        if (this.x > 1024){
            this.magnetDD = 1536 * 1536;
        }

        if (focus) {
            this.focus = Math.min(1, this.focus + delta / 500);
        } else {
            this.focus = Math.max(0, this.focus - delta / 500);
        }

        if(!gamepadMove){
            let mx = left ? -1 : right ? 1 : 0;
            let my = top ? -1 : down ? 1 : 0;
            const m = new Phaser.Math.Vector2(mx, my);
            m.normalize();

            mx = m.x * speed * 0.33 + this.body.velocity.x * 0.66;
            my = m.y * speed * 0.33 + this.body.velocity.y * 0.66;
            this.setVelocity(mx, my);
        }

        if (this.invincibleUntil > this.scene.time.now) {
            this.setAlpha(
                Boolean((this.scene.time.now / 200) & 1) ? 1.0 : 0.33
            );
        } else {
            this.setAlpha(1);
        }

        if (this.dyingOn) {
            if (this.dyingOn <= this.scene.time.now) {
                this.die();
            }
        }
    }

    update(time: number, delta: number) {
        if (!this.isDead) {
            this.updateControls(delta);
        } else {
            this.setVisible(false);
            this.setVelocity(0, 0);
        }
        this.bombBeam.x = this.x + 32;
        this.bombBeam.y = this.y;
        this.bombBeamRepeater.x = this.bombBeam.x + 256;
        this.bombBeamRepeater.y = this.y;
        this.beamCollider.x = this.x + 32;
        this.beamCollider.y = this.y;
        this.graceCollider.x = this.x;
        this.graceCollider.y = this.y;
    }

    willDie() {
        if (
            this.invincibleUntil >= this.scene.time.now ||
            this.bombingUntil >= this.scene.time.now ||
            this.dyingOn
        ) {
            return;
        }
        this.dyingOn = this.scene.time.now + 50;
    }

    die() {
        if (this.invincibleUntil >= this.scene.time.now) {
            return;
        }
        if (this.bombingUntil >= this.scene.time.now) {
            return;
        }

        for (let i = 0; i < 8; i++) {
            const ox = (Math.random() - 0.5) * 64;
            const oy = (Math.random() - 0.5) * 64;
            new HitFX(this.scene as GameScene, this.x + ox, this.y + oy);
        }
        this.scene.sound.add('playerHitHurt').play();
        this.cantCaptureSpellCard = true;

        this.dyingOn = 0;
        const ui = this.scene.scene.get('UIScene') as UIScene;
        if (--ui.lives >= 0) {
            ui.bombs = 3;
            const pickups = Math.min(5,this.power);
            this.power = Math.max(0, this.power - 5);
            this.scene.scene.get('UIScene').events.emit('setPower', this.power);
            this.invincibleUntil = this.scene.time.now + 1000;
            this.scene.scene.get('UIScene').events.emit('refresh');
            for(let i=0;i<pickups;i++){
                const pu = new Pickup(
                    this.scene as GameScene,
                    this.x + 78,
                    this.y + (Math.random()-0.5)*64,
                    'powerup'
                );
                pu.setVelocity(Math.random() * 3500, (Math.random() - 0.5) * 500);
            }
            return;
        } else {
            this.isDead = true;
        }
    }

    powerup() {
        const oldLevel = Math.floor(this.power / 10);
        this.power++;
        const newPower = Math.floor(this.power / 10);
        if (newPower !== oldLevel) {
            this.scene.sound.add('powerUp').play();
        }
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
        if(!other.scene){return;}
        if (other.pickupType === 'bossStar') {
            if ((++this.bossStarsPickedUp & 1) == 0) {
                this.scene.sound.add('pickupCoin').play();
            }
        } else {
            this.scene.sound.add('pickupCoin').play();
        }
        switch (other.pickupType) {
            default:
            case 'bossStar':
            case 'star':
                this.scene.scene.get('UIScene').events.emit('incScore', 10);
                break;
            case 'powerup':
                this.powerup();
                break;
            case 'bomb':
                this.scene.scene.get('UIScene').events.emit('incBomb');
                break;
            case 'bigstar':
                this.scene.scene.get('UIScene').events.emit('incScore', 1000);
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
            this.willDie();
        } else if (other instanceof Fairy) {
            this.willDie();
        }
    }

    onGrace(other: any) {
        if (this.ungracefulUntil > this.scene.time.now || this.isDead) {
            return;
        }
        if (other instanceof EnemyBullet) {
            this.scene.scene.get('UIScene').events.emit('incScore', 1);
            this.ungracefulUntil = this.scene.time.now + 10;
        }
    }
}
