import { Scene, Types } from 'phaser';
import { Fairy } from '../../entities/fairy';
import { Player } from '../../entities/player';

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

    playerProjectiles?: Phaser.GameObjects.Group;
    enemyProjectiles?: Phaser.GameObjects.Group;
    enemies?: Phaser.GameObjects.Group;

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
        this.physics.world.setBounds(0, 0, 1280, 720);
        this.keymap = this.input.keyboard.addKeys(
            'Up,Left,Right,Down,X,Z,Shift'
        ) as KeyMap;
        this.gameOverActive = false;

        this.scene.run('UIScene');
        this.player = new Player(this, 128, 720 / 2, this.keymap);
        this.playerProjectiles = this.physics.add.group([],{key: 'playerProjectiles', visible: false, quantity: 0});
        this.enemyProjectiles = this.physics.add.group([],{key: 'enemyProjectiles', visible: false, quantity: 0});
        this.enemies = this.physics.add.group([],{key: 'enemies', visible: false, quantity: 0});

        this.cameras.main.setBounds(0, 0, 1280, 720);
        this.cameras.main.startFollow(this.player, false, 0.1, 0.1, 0, 0);

        for(let y=100;y<720;y+=80){
            new Fairy(this, 1000, y);
        }

        this.physics.add.overlap(this.playerProjectiles, this.enemies, (a:any,b:any) => {
            a.onCollide && a.onCollide(b);
            b.onCollide && b.onCollide(a);
        });
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
