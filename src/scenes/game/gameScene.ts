import { GameObjects, Scene } from 'phaser';
import { EnemyBullet } from '../../entities/enemyBullet';
import { Boss } from '../../entities/boss';
import { Player } from '../../entities/player';
import { StageEvaluator } from './stageEvaluator';

import '../../types';
import stageOneData from './../../stages/stage1.lisp?raw';
import { UIScene } from '../ui/uiScene';
import { Pickup } from '../../entities/pickup';

const animation_frames = (frame: string, frames: number) => {
    const ret = [];
    for (let i = 0; i < frames; i++) {
        ret.push({ key: 'packed', frame: `${frame}_${i}` });
    }
    return ret;
};

export type KeyMap = {
    Up: Phaser.Input.Keyboard.Key;
    Left: Phaser.Input.Keyboard.Key;
    Right: Phaser.Input.Keyboard.Key;
    Down: Phaser.Input.Keyboard.Key;
    Z: Phaser.Input.Keyboard.Key;
    X: Phaser.Input.Keyboard.Key;
    Shift: Phaser.Input.Keyboard.Key;
};

export type SnowFlakeData = {
    velX: number;
    velY: number;
    velZ: number;
};

export class GameScene extends Scene {
    keymap?: KeyMap;
    gameOverActive: boolean;
    player?: Player;
    boss?: Boss;
    skybg?: GameObjects.Image;
    topclouds?: GameObjects.TileSprite;
    darkclouds?: GameObjects.TileSprite;
    darkdarkclouds?: GameObjects.TileSprite;

    pickups?: GameObjects.Group;
    playerProjectiles?: GameObjects.Group;
    enemyProjectiles?: GameObjects.Group;
    enemies?: GameObjects.Group;

    snowFlakes?: GameObjects.Blitter;
    snowFlakeData: SnowFlakeData[] = [];

    frontSnowFlakes?: GameObjects.Blitter;
    frontSnowFlakeData: SnowFlakeData[] = [];

    backSnowFlakes?: GameObjects.Blitter;
    backSnowFlakeData: SnowFlakeData[] = [];

    gameTicks = 0;
    bossFade = 0;

    bgm?: Phaser.Sound.BaseSound[];
    bgmIndex: number;

    stageEvaluator?: StageEvaluator;

    colCount = 1;

    constructor(config: Phaser.Types.Scenes.SettingsConfig) {
        if (!config) {
            config = {};
        }
        config.key = 'GameScene';
        super(config);
        this.gameOverActive = false;
        this.player = undefined;
        this.bgmIndex = 0;
    }

    advanceBgm() {
        /*
        if(!this.bgm){return;}
        this.bgm[this.bgmIndex].stop();
        this.bgm[++this.bgmIndex].play();
        */
    }

    create() {
        const that = this;
        this.sound.pauseOnBlur = false;
        /*
        this.bgm = [
            this.sound.add('wave_one', {loop: true}),
            this.sound.add('boss_first_encounter', {loop: true}),
            this.sound.add('wave_two', {loop: true}),
            this.sound.add('boss_second_encounter', {loop: true}),
        ];
        this.bgmIndex = 0;
        this.bgm[this.bgmIndex].play();
        */
        this.bossFade = 0;
        this.anims.create({
            key: 'fairy_animated',
            frames: animation_frames('fairy', 2),
            frameRate: 6,
            repeat: -1,
        });
        this.anims.create({
            key: 'player_animated',
            frames: animation_frames('player', 2),
            frameRate: 6,
            repeat: -1,
        });
        this.anims.create({
            key: 'boss_animated',
            frames: animation_frames('boss', 2),
            frameRate: 6,
            repeat: -1,
        });
        1;
        this.physics.world.setBounds(0, 0, 1280, 720);
        this.keymap = this.input.keyboard.addKeys(
            'Up,Left,Right,Down,X,Z,Shift'
        ) as KeyMap;
        this.gameOverActive = false;
        this.gameTicks = 0;

        this.playerProjectiles = this.physics.add.group([], {
            key: 'playerProjectiles',
            visible: false,
            quantity: 0,
        });
        this.enemyProjectiles = this.physics.add.group([], {
            key: 'enemyProjectiles',
            visible: false,
            quantity: 0,
        });
        this.enemies = this.physics.add.group([], {
            key: 'enemies',
            visible: false,
            quantity: 0,
        });
        this.pickups = this.physics.add.group([], {
            key: 'pickups',
            visible: false,
            quantity: 0,
        });
        this.player = new Player(this, 128, 720 / 2, this.keymap);
        this.skybg = this.add.image(-64, -64, 'packed', 'sky');
        this.skybg
            .setDisplaySize(1280 + 128, 720 + 128)
            .setOrigin(0, 0)
            .setDepth(-100);
        this.topclouds = this.add.tileSprite(
            -64,
            -32,
            0,
            0,
            'packed',
            'topclouds'
        );
        this.topclouds
            .setSize(1280 + 128, 64)
            .setOrigin(0, 0)
            .setDepth(2);
        this.darkclouds = this.add.tileSprite(
            -64,
            -8,
            0,
            0,
            'packed',
            'darkclouds'
        );
        this.darkclouds
            .setSize(1280 + 128, 64)
            .setOrigin(0, 0)
            .setDepth(-1);
        this.darkdarkclouds = this.add.tileSprite(
            -64,
            16,
            0,
            0,
            'packed',
            'darkdarkclouds'
        );
        this.darkdarkclouds
            .setSize(1280 + 128, 64)
            .setOrigin(0, 0)
            .setDepth(-2);

        this.cameras.main.setBounds(0, 0, 1280, 720);
        this.cameras.main.startFollow(this.player, false, 0.1, 0.1, 0, 0);

        const handler = (a: any, b: any) => {
            a.onCollide && a.onCollide(b);
            b.onCollide && b.onCollide(a);
        };
        this.physics.add.overlap(this.playerProjectiles, this.enemies, handler);
        this.physics.add.overlap(this.player, this.enemyProjectiles, handler);
        this.physics.add.overlap(this.player, this.enemies, handler);
        this.physics.add.overlap(
            this.player.graceCollider,
            this.enemyProjectiles,
            (a: any, b: any) => {
                that.player!.onGrace(a instanceof EnemyBullet ? a : b);
            }
        );
        this.physics.add.overlap(
            this.player.graceCollider,
            this.pickups,
            (a: any, b: any) => {
                if (a instanceof Pickup) {
                    that.player!.onCollide(a);
                    a.onCollide(that.player!);
                } else {
                    that.player!.onCollide(b);
                    b.onCollide(that.player!);
                }
            }
        );

        this.frontSnowFlakeData.length = 0;
        this.frontSnowFlakes = this.add.blitter(-8, -8, 'packed');
        this.frontSnowFlakes.setDepth(1);

        for (let i = 0; i < 96; i++) {
            const x = Math.random() * this.renderer.width;
            const y = Math.random() * this.renderer.height;
            const frame = `snowflake_${i & 3}`;
            const flake = this.frontSnowFlakes.create(x, y, frame);
            this.frontSnowFlakeData.push({
                velX: 0.5 + Math.random() * 1.1,
                velY: 0.7 + Math.random() * 0.5,
                velZ: 0.5 + Math.random() * 1.1,
            });
        }

        this.snowFlakeData.length = 0;
        this.snowFlakes = this.add.blitter(-8, -8, 'packed');
        this.snowFlakes.setDepth(-1);
        for (let i = 0; i < 128; i++) {
            const x = Math.random() * this.renderer.width;
            const y = Math.random() * this.renderer.height;
            const frame = `snowflake_${i & 3}`;
            const flake = this.snowFlakes.create(x, y, frame);
            this.snowFlakeData.push({
                velX: 0.2 + Math.random() * 1.1,
                velY: 0.3 + Math.random() * 0.5,
                velZ: 0.2 + Math.random() * 1.1,
            });
        }


        this.backSnowFlakeData.length = 0;
        this.backSnowFlakes = this.add.blitter(-8, -8, 'packed');
        this.backSnowFlakes.setDepth(-3);
        for (let i = 0; i < 78; i++) {
            const x = Math.random() * this.renderer.width;
            const y = Math.random() * this.renderer.height;
            const frame = `snowflake_${i & 3}`;
            const flake = this.backSnowFlakes.create(x, y, frame);
            this.backSnowFlakeData.push({
                velX: 0.2 + Math.random() * 0.6,
                velY: 0.1 + Math.random() * 0.2,
                velZ: 0.2 + Math.random() * 0.6,
            });
        }


        this.stageEvaluator = new StageEvaluator(stageOneData, this);
    }

    updateSnow(delta: number) {
        const h = this.renderer.height + 16;
        const w = this.renderer.width + 16;
        const flakes = this.snowFlakes?.children.list;
        const frontFlakes = this.frontSnowFlakes?.children.list;
        const backFlakes = this.backSnowFlakes?.children.list;
        if (!flakes || !frontFlakes || !backFlakes) {
            return;
        }

        for (let i = 0; i < flakes.length; i++) {
            const flake = flakes[i];
            const data = this.snowFlakeData[i];
            flake.y = (flake.y + data.velY) % h;
            flake.x = (w + (flake.x - data.velX - 2)) % w;
            data.velX += data.velZ * 0.02;
            data.velZ -= data.velX * 0.02;
        }

        for (let i = 0; i < frontFlakes.length; i++) {
            const flake = frontFlakes[i];
            const data = this.frontSnowFlakeData[i];
            flake.y = (flake.y + data.velY) % h;
            flake.x = (w + (flake.x - data.velX - 3)) % w;
            data.velX += data.velZ * 0.02;
            data.velZ -= data.velX * 0.02;
        }

        for (let i = 0; i < backFlakes.length; i++) {
            const flake = backFlakes[i];
            const data = this.backSnowFlakeData[i];
            flake.y = (flake.y + data.velY) % h;
            flake.x = (w + (flake.x - data.velX - 1)) % w;
            data.velX += data.velZ * 0.02;
            data.velZ -= data.velX * 0.02;
        }
    }

    update(time: number, delta: number) {
        this.updateSnow(delta);
        this.player?.update(time, delta);

        if((this.player?.bombingUntil || 0) > time){
            this.bossFade = Math.min(1, this.bossFade + 0.004);
        }

        if (this.boss) {
            if (!this.boss.scene) {
                this.boss = undefined;
            } else {
                this.boss?.update(time, delta);
            }
            this.bossFade = Math.min(1, this.bossFade + 0.015);
        } else {
            const ui = this.scene.get('UIScene') as UIScene;
            ui.events.emit('setBossHealth', 0, 0);
            this.bossFade = Math.max(0, this.bossFade - 0.002);
        }

        const alpha = Math.min(1, 1.0 - this.bossFade);
        const cloudAlpha = Math.min(1, 1.0 - this.bossFade * 0.75);
        this.skybg?.setAlpha(alpha);
        this.snowFlakes?.setAlpha(alpha);
        this.frontSnowFlakes?.setAlpha(alpha);
        this.backSnowFlakes?.setAlpha(alpha);
        this.topclouds?.setAlpha(cloudAlpha);
        this.darkclouds?.setAlpha(cloudAlpha);
        this.darkdarkclouds?.setAlpha(cloudAlpha);
        this.topclouds!.setTilePosition(time * 0.3, 0);
        this.darkclouds!.setTilePosition(time * 0.17, 0);
        this.darkdarkclouds!.setTilePosition(time * 0.09, 0);

        if(this.scene.isActive('MainMenuScene')){return;}

        if (this.player?.isDead) {
            if (!this.gameOverActive) {
                this.scene.run('GameOverScene');
                this.gameOverActive = true;
            }
        }
        this.gameTicks += delta;
        this.stageEvaluator!.tick(delta);
    }
}
