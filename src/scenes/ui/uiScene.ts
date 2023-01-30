import { GameObjects, Scene } from 'phaser';
import { GameScene } from '../game/gameScene';

export class UIScene extends Scene {
    score = 0;
    lives = 3;
    bombs = 3;
    power = 0;

    bossHealth?: GameObjects.DOMElement;

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
        this.add.dom(12, this.scale.height - 64, $score);

        const $lives = document.createElement('div');
        $lives.id = 'game-lives';
        this.add.dom(12, this.scale.height - 28, $lives);

        const $bombs = document.createElement('div');
        $bombs.id = 'game-bombs';
        this.add.dom(156, this.scale.height - 28, $bombs);

        const $power = document.createElement('div');
        $power.id = 'game-power';
        this.add.dom(292, this.scale.height - 28, $power);

        const $bossHealth = document.createElement('div');
        $bossHealth.id = 'game-boss-health-wrap';
        $bossHealth.innerHTML =
            '<div id="game-boss-health"><div id="game-boss-health-bar"></div><div id="game-boss-spell-card-counter"></div></div>';
        const $bossHealthBar = $bossHealth.querySelector(
            '#game-boss-health-bar'
        ) as HTMLElement;
        const $bossHealthSpellCardCounter = $bossHealth.querySelector(
            '#game-boss-spell-card-counter'
        ) as HTMLElement;
        this.bossHealth = this.add.dom(12, 12, $bossHealth).setOrigin(0, 0);

        this.refreshUI = () => {
            $score.innerText = `Score: ${that.score}`;
            $lives.innerText = `Lives: ${that.lives}`;
            $bombs.innerText = `Bombs: ${that.bombs}`;
            $power.innerText = `Power: ${
                that.power >= 50 ? 'MAX' : that.power
            }`;
        };
        this.events.on(
            'setBossHealth',
            (hp: number, maxHp: number, cardsLeft: number) => {
                if (maxHp === 0) {
                    this.bossHealth?.setVisible(false);
                } else {
                    this.bossHealth?.setVisible(true);
                    const w = (hp / maxHp) * 100;
                    $bossHealthBar.style.width = `${w}%`;
                    $bossHealthSpellCardCounter.innerText = `${cardsLeft}`;
                }
            }
        );
        this.events.on('incScore', (δ: number) => {
            const oldScore = Math.floor(that.score / 10000);
            that.score += δ;
            const newScore = Math.floor(that.score / 10000);
            if (newScore > oldScore) {
                that.lives++;
            }
            that.refreshUI();
        });
        this.events.on('incBomb', (δ: number) => {
            that.bombs++;
            that.refreshUI();
        });
        this.events.on('incLife', (δ: number) => {
            that.lives++;
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

    update(time: number, delta: number) {}
}
