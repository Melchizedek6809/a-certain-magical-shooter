import { GameObjects, Scene } from 'phaser';
import { GameScene } from '../game/gameScene';

export class UIScene extends Scene {
    score = 0;
    lives = 3;
    bombs = 3;

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

        const $score = document.createElement("div");
        $score.id = "game-score";
        this.add.dom(16, this.scale.height - 40, $score);

        const $lives = document.createElement("div");
        $lives.id = "game-lives";
        this.add.dom(16, this.scale.height - 80, $lives);

        const $bombs = document.createElement("div");
        $bombs.id = "game-bombs";
        this.add.dom(16, this.scale.height - 120, $bombs);

        this.refreshUI = () => {
            $score.innerText = `Score: ${that.score}`;
            $lives.innerText = `Lives: ${that.lives}`;
            $bombs.innerText = `Bombs: ${that.bombs}`;
        };
        this.events.on('incScore', (δ:number) => {
            const oldScore = Math.floor(that.score / 20000);
            that.score += δ;
            const newScore = Math.floor(that.score / 20000);
            if(newScore > oldScore){
                that.lives++;
            }
            that.refreshUI();
        });
        this.events.on('incBomb', (δ:number) => {
            that.bombs += 0.5;
            that.refreshUI();
        });
        this.events.on('incLife', (δ:number) => {
            that.lives += 0.5;
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
