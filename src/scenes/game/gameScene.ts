import { Scene, Types } from 'phaser';
import { Fairy } from '../../entities/fairy';
import { Player } from '../../entities/player';
import { UIScene } from '../ui/uiScene';

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

    pickups?: Phaser.GameObjects.Group;
    playerProjectiles?: Phaser.GameObjects.Group;
    enemyProjectiles?: Phaser.GameObjects.Group;
    enemies?: Phaser.GameObjects.Group;

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

    checkEnemies() {
        if (this.enemies!.children.size <= 0) {
            this.colCount = Math.min(5, this.colCount + 1);
            for (let y = 32; y < 720; y += 64) {
                for (let x = 1200 - 64 * this.colCount; x < 1200; x += 64) {
                    new Fairy(this, x, y);
                }
            }
        }
    }

    create() {
        this.physics.world.setBounds(0, 0, 1280, 720);
        this.keymap = this.input.keyboard.addKeys(
            'Up,Left,Right,Down,X,Z,Shift'
        ) as KeyMap;
        this.gameOverActive = false;

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

        this.cameras.main.setBounds(0, 0, 1280, 720);
        this.cameras.main.startFollow(this.player, false, 0.1, 0.1, 0, 0);

        for (let y = 32; y < 720; y += 64) {
            for (let x = 1200 - 64 * this.colCount; x < 1200; x += 64) {
                new Fairy(this, x, y);
            }
        }

        const handler = (a: any, b: any) => {
            a.onCollide && a.onCollide(b);
            b.onCollide && b.onCollide(a);
        };
        this.physics.add.overlap(this.playerProjectiles, this.enemies, handler);
        this.physics.add.overlap(this.player, this.pickups, handler);
        this.physics.add.overlap(this.player, this.enemyProjectiles, handler);
        this.physics.add.overlap(this.player, this.enemies, handler);
    }

    update(time: number, delta: number) {
        this.player?.update(time, delta);
        if (this.player?.isDead) {
            if (!this.gameOverActive) {
                this.scene.run('GameOverScene');
                this.gameOverActive = true;
            }
        }
    }
}
