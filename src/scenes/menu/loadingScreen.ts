import options from '../../options';
import { GameObjects, Scene } from 'phaser';

export class LoadingScreenScene extends Scene {
    progressBar?: GameObjects.Graphics;
    progressBox?: GameObjects.Graphics;
    progressText?: GameObjects.Text;
    loadingText?: GameObjects.Text;
    loadingFileText?: GameObjects.Text;

    constructor(config: Phaser.Types.Scenes.SettingsConfig) {
        if (!config) {
            config = {};
        }
        config.key = 'LoadingScreenScene';
        super(config);
    }

    initLoadScreen() {
        const that = this;
        this.progressBox = this.add.graphics();
        this.progressBox.setPosition(
            this.scale.width / 2 - 160,
            this.scale.height / 2 - 32
        );
        this.progressBox.fillStyle(0x081122, 0.8);
        this.progressBox.fillRoundedRect(0, 0, 320, 64, 8);

        this.progressBar = this.add.graphics();
        this.progressBar.setPosition(
            this.scale.width / 2 - 160,
            this.scale.height / 2 - 32
        );

        this.loadingText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 - 48,
            'Loading...',
            {
                fontFamily: 'monospace',
                fontSize: '20px',
                color: '#ffffff',
            }
        );
        this.loadingText.setOrigin(0.5, 0.5);

        this.progressText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2,
            '0%',
            {
                fontFamily: 'monospace',
                fontSize: '20px',
                color: '#ffffff',
            }
        );
        this.progressText.setOrigin(0.5, 0.5);

        this.loadingFileText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + 48,
            '0%',
            {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#ffffff',
            }
        );
        this.loadingFileText.setOrigin(0.5, 0.5);

        this.load.on('progress', (percentage_done: number) => {
            if (that.progressBar) {
                that.progressBar.clear();
                that.progressBar.fillStyle(0x334488, 1);
                that.progressBar.fillRoundedRect(
                    8,
                    8,
                    304 * percentage_done,
                    48,
                    8
                );
                that.progressText?.setText(((percentage_done * 100) | 0) + '%');
            }
        });

        this.load.on('fileprogress', (file: any) => {
            that.loadingFileText?.setText(`${file.src}`);
        });
        this.load.on('complete', () => {
            that.dropLoadScreen();
        });
    }

    dropLoadScreen() {
        this.progressBar?.destroy();
        this.progressBox?.destroy();
        this.progressText?.destroy();
        this.loadingText?.destroy();
        this.loadingFileText?.destroy();
    }

    preload() {
        this.initLoadScreen();
        this.load.multiatlas('packed', 'gfx/packed.json', 'gfx');

        this.load.audio('shot', 'sfx/shot.wav');
        this.load.audio('explosion', 'sfx/explosion.wav');
        this.load.audio('bossExplosion', 'sfx/bossExplosion.wav');
        this.load.audio('pickupCoin', 'sfx/pickupCoin.wav');
        this.load.audio('powerUp', 'sfx/powerUp.wav');
        this.load.audio('bossWave', 'sfx/bossWave.wav');
        this.load.audio('bossShoot', 'sfx/bossShoot.wav');
        this.load.audio('bossHitHurt', 'sfx/bossHitHurt.wav');
        this.load.audio('playerHitHurt', 'sfx/playerHitHurt.wav');
        this.load.audio('laserBeam', 'sfx/laserBeam.mp3');

        if (options.playBGM) {
            this.load.audio('bgm', 'bgm/bgm.mp3');
            this.load.audio('menubgm', 'bgm/menubgm.mp3');
        }
    }

    create() {
        this.scene.switch('MainMenuScene');
    }
}
