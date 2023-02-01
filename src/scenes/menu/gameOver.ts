import { Scene } from 'phaser';
import { GameScene } from '../game/gameScene';
import { UIScene } from '../ui/uiScene';

export class GameOverScene extends Scene {
    gamepadWasUnpressed = false;

    constructor(config: Phaser.Types.Scenes.SettingsConfig) {
        if (!config) {
            config = {};
        }
        config.key = 'GameOverScene';
        super(config);
    }

    restartGame() {
        this.scene.stop('GameOverScene');
        this.scene.get('GameScene').scene.restart();
        this.scene.get('UIScene').scene.restart();
    }

    create() {
        const that = this;
        const gs = that.scene.get('GameScene') as GameScene;
        const score = (that.scene.get('UIScene') as UIScene).score;
        this.gamepadWasUnpressed = false;

        const $dom = document.createElement('div');
        $dom.style.textAlign = 'center';
        $dom.innerHTML = `<h1>Game Over</h1>
        <h2>Your Score: ${score}</h2>
        <br/><br/>
        <button class="red-button">Start over</button>`;
        this.add.dom(this.scale.width / 2, this.scale.height / 2, $dom);

        const $startOver = $dom.querySelector(
            'button.red-button'
        ) as HTMLElement;
        $startOver.addEventListener('click', this.restartGame.bind(this));
        $startOver.focus();
    }

    update(time: number, delta: number): void {
        const that = this;
        if (this.input.gamepad.gamepads[0]) {
            const gamepad = this.input.gamepad.gamepads[0];
            if (gamepad.A && this.gamepadWasUnpressed) {
                that.restartGame();
            } else {
                this.gamepadWasUnpressed = true;
            }
        }
    }
}
