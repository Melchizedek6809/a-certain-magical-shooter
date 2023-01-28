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
        ret.push({ key: 'packed', frame: `${frame}/${frame}-${i}` });
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
    gameTicks = 0;

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
    }

    create() {
        const that = this;
        this.physics.world.setBounds(0, 0, 1280, 720);
        this.keymap = this.input.keyboard.addKeys(
            'Up,Left,Right,Down,X,Z,Shift'
        ) as KeyMap;
        this.gameOverActive = false;
        this.gameTicks = 0;

        this.scene.run('UIScene');
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
        this.topclouds = this.add.tileSprite(-64, -32, 0, 0, 'packed', 'topclouds');
        this.topclouds
            .setSize(1280 + 128, 64)
            .setOrigin(0, 0)
            .setDepth(2);
        this.darkclouds = this.add.tileSprite(-64, -8, 0, 0, 'packed', 'darkclouds');
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
                if(a instanceof Pickup){
                    that.player!.onCollide(a);
                    a.onCollide(that.player!);
                } else {
                    that.player!.onCollide(b);
                    b.onCollide(that.player!);
                }
            }
        );
        this.boss = new Boss(this, 1080, 720/2);

        this.stageEvaluator = new StageEvaluator(stageOneData, this);
    }

    update(time: number, delta: number) {
        this.player?.update(time, delta);
        if(this.boss){
            if(!this.boss.scene){
                this.boss = undefined;
            } else {
                this.boss?.update(time, delta);
            }
        } else {
            const ui = this.scene.get("UIScene") as UIScene;
            ui.events.emit("setBossHealth",0,0);
        }
        if (this.player?.isDead) {
            if (!this.gameOverActive) {
                this.scene.run('GameOverScene');
                this.gameOverActive = true;
            }
        }
        this.topclouds!.setTilePosition(time * 0.3, 0);
        this.darkclouds!.setTilePosition(time * 0.17, 0);
        this.darkdarkclouds!.setTilePosition(time * 0.09, 0);
        this.gameTicks += delta;
        this.stageEvaluator!.tick(delta);
    }
}
