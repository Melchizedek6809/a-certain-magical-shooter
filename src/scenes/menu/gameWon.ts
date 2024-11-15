import { Scene } from 'phaser';
import { GameScene } from '../game/gameScene';
import { UIScene } from '../ui/uiScene';

export class GameWonScene extends Scene {
    gamepadWasUnpressed = false;

    constructor(config: Phaser.Types.Scenes.SettingsConfig) {
        if (!config) {
            config = {};
        }
        config.key = 'GameWonScene';
        super(config);
    }

    restartGame() {
        this.scene.stop('GameWonScene');
        this.scene.get('GameScene').scene.restart();
    }

    create() {
        const that = this;
        const gs = that.scene.get('GameScene') as GameScene;
        const score = (that.scene.get('UIScene') as UIScene).score;
        this.gamepadWasUnpressed = false;

        const $dom = document.createElement('div');
        $dom.style.textAlign = 'center';
        $dom.innerHTML = `<h1>Congratulations</h1>
        <h2>You won!</h2>
        <h2>Your final Score: ${score}</h2>
        <h2>Thank you for playing my game, I hope you had fun :)</h2>
        <br/><br/>
        <button class="green-button">Start over</button>`;
        this.add.dom(this.scale.width / 2, this.scale.height / 2, $dom);

        const $startOver = $dom.querySelector(
            'button.green-button'
        ) as HTMLElement;
        $startOver.addEventListener('click', this.restartGame.bind(this));
        $startOver.focus();
    }

    update(time: number, delta: number): void {
        const that = this;
        const gamepad = this.input.gamepad?.gamepads[0];
        if (gamepad?.A && this.gamepadWasUnpressed) {
            that.restartGame();
        } else if (gamepad !== null) {
            this.gamepadWasUnpressed = true;
        }
    }
}
