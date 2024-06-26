import { Physics } from 'phaser';
import { GameScene } from '../scenes/game/gameScene';
import { UIScene } from '../scenes/ui/uiScene';
import { EnemyBullet } from './enemyBullet';
import { HitFX } from './hitFx';

let count = 0;

export class Boss extends Physics.Arcade.Sprite {
    health = 600;
    maxHealth = 600;
    spellCardOver = false;
    spellCards: number;

    constructor(scene: GameScene, x: number, y: number, spellCards = 4) {
        super(scene, x, y, 'packed', 'boss_0');
        this.play('boss_animated');
        this.setName(`Cirno ${count++}`);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.enemies?.add(this);
        if(this.body){
            this.body.setSize(32, 72, true);
            this.body.onOverlap = true;
        }
        this.spellCards = spellCards;
        scene.boss = this;
    }

    wave(wc: number) {
        this.scene.sound.add('bossWave').play();
        for (let i = 0; i < 22; i++) {
            const gs = this.scene as GameScene;
            const t = (i / 22) * Math.PI * 2 + (wc / 256) * Math.PI * 2;
            const vx = Math.cos(t) * 400;
            const vy = Math.sin(t) * 400;
            const ox = vx * 0.12;
            const oy = vy * 0.12;
            const bullet = new EnemyBullet(
                gs,
                this.x + ox,
                this.y + oy,
                'bossProjectile'
            );
            bullet.setVelocity(vx, vy);
        }
    }

    reverseWave(wc: number) {
        this.scene.sound.add('bossWave').play();
        for (let i = 0; i < 22; i++) {
            const gs = this.scene as GameScene;
            const t = (i / 22) * Math.PI * 2 - (wc / 256) * Math.PI * 2;
            const vx = Math.cos(t) * 400;
            const vy = Math.sin(t) * 400;
            const ox = vx * 0.12;
            const oy = vy * 0.12;
            const bullet = new EnemyBullet(
                gs,
                this.x + ox,
                this.y + oy,
                'bossProjectile'
            );
            bullet.setVelocity(vx, vy);
        }
    }

    teaWave(wc: number) {
        this.scene.sound.add('bossWave').play();
        for (let i = 0; i < 18; i++) {
            const gs = this.scene as GameScene;
            const t =
                (i / 18) * Math.PI + Math.PI / 2 + ((wc / 256) * Math.PI) / 32;
            const vx = Math.cos(t) * 300;
            const vy = Math.sin(t) * 300;
            const ox = vx * 0.12;
            const oy = vy * 0.12;
            const bullet = new EnemyBullet(
                gs,
                this.x + ox,
                this.y + oy,
                'bossTeaProjectile'
            );
            bullet.setVelocity(vx, vy);
        }
    }

    shoot() {
        this.scene.sound.add('bossShoot').play();
        const gs = this.scene as GameScene;
        const dx = gs.player!.x - this.x;
        const dy = gs.player!.y - this.y;
        const v = new Phaser.Math.Vector2(dx, dy).normalize();
        const bullet = new EnemyBullet(
            gs,
            this.x + v.x * 16,
            this.y + v.y * 16
        );
        bullet.setVelocity(v.x * 400, v.y * 400);
    }

    sickleShoot() {
        this.scene.sound.add('bossShoot').play();
        const gs = this.scene as GameScene;
        const dx = gs.player!.x - this.x;
        const dy = gs.player!.y - this.y;
        const v = new Phaser.Math.Vector2(dx, dy).normalize();
        const bullet = new EnemyBullet(
            gs,
            this.x + v.x * 16,
            this.y + v.y * 16,
            'bossSickleProjectile'
        );
        bullet.setVelocity(v.x * 600, v.y * 600);
    }

    update(time: number, delta: number) {
        const ui = this.scene.scene.get('UIScene') as UIScene;
        ui.events.emit(
            'setBossHealth',
            this.health,
            this.maxHealth,
            this.spellCards
        );
    }

    onCollide(other: Phaser.GameObjects.Sprite) {
        if (other.name !== 'beam') {
            new HitFX(this.scene as GameScene, other.x, other.y);
        }
        this.scene.sound.add('bossHitHurt').play();
        if (this.health-- <= 0) {
            for (let i = 0; i < 16; i++) {
                const ox = (Math.random() - 0.5) * 64;
                const oy = (Math.random() - 0.5) * 64;
                new HitFX(this.scene as GameScene, this.x + ox, this.y + oy);
            }
            this.scene.sound.add('bossExplosion').play();
            if (this.spellCards > 0) {
                this.spellCards--;
                this.health = this.maxHealth;
                this.spellCardOver = true;
            } else {
                (this.scene as GameScene).boss = undefined;
                this.destroy();
            }
        }
    }
}
