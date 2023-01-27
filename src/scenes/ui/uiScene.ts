import { GameObjects, Scene } from 'phaser';
import { GameScene } from '../game/gameScene';

export class UIScene extends Scene {
    score = 0;
    lives = 3;
    bombs = 3;
    power = 0;

    constructor(config: Phaser.Types.Scenes.SettingsConfig) {
        if (!config) {
            config = {};
        }
        config.key = 'UIScene';
        super(config);
    }

    refreshUI() {}

    create() {
        const that = this;
        this.score = 0;
        this.lives = 3;
        this.bombs = 3;
        this.power = 0;

        const $score = document.createElement('div');
        $score.id = 'game-score';
        this.add.dom(16, this.scale.height - 40, $score);

        const $lives = document.createElement('div');
        $lives.id = 'game-lives';
        this.add.dom(16, this.scale.height - 64, $lives);

        const $bombs = document.createElement('div');
        $bombs.id = 'game-bombs';
        this.add.dom(16, this.scale.height - 88, $bombs);

        const $power = document.createElement('div');
        $power.id = 'game-power';
        this.add.dom(16, this.scale.height - 112, $power);

        this.refreshUI = () => {
            $score.innerText = `Score: ${that.score}`;
            $lives.innerText = `Lives: ${that.lives}`;
            $bombs.innerText = `Bombs: ${that.bombs}`;
            $power.innerText = `Power: ${
                that.power >= 50 ? 'MAX' : that.power
            }`;
        };
        this.events.on('incScore', (δ: number) => {
            const oldScore = Math.floor(that.score / 20000);
            that.score += δ;
            const newScore = Math.floor(that.score / 20000);
            if (newScore > oldScore) {
                that.lives++;
            }
            that.refreshUI();
        });
        this.events.on('incBomb', (δ: number) => {
            that.bombs += 0.5;
            that.refreshUI();
        });
        this.events.on('incLife', (δ: number) => {
            that.lives += 0.5;
            that.refreshUI();
        });
        this.events.on('setPower', (pow: number) => {
            that.power = pow;
            that.refreshUI();
        });
        this.events.on('refresh', () => {
            that.refreshUI();
        });

        that.refreshUI();
    }

    update(time: number, delta: number) {
        const game = this.scene.get('GameScene') as GameScene;
    }
}
