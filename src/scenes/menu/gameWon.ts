import { Scene } from 'phaser';
import { GameScene } from '../game/gameScene';

export class GameWonScene extends Scene {
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

        const $dom = document.createElement('div');
        $dom.style.textAlign = 'center';
        $dom.innerHTML = `<h1>Congratulations</h1>
        <h2>You won!</h2>
        <p>Death Count: 0</p>
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
        if (this.input.gamepad.gamepads[0]) {
            const gamepad = this.input.gamepad.gamepads[0];
            if (gamepad.B) {
                that.restartGame();
            }
        }
    }
}
