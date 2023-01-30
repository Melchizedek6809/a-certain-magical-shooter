import { Scene } from 'phaser';

const introHTML = `<h1>A certain magical shooter</h1>
<br/>
<p>This is an independent and free fan-game based on the Touhou games originally created by ZUN/Team Shanghai Alice.</p>
<p>It was developed for the 10th Touhou Fan Game Jam</p>
<br/>
<h2>Controls:</h2>
<table id="game-controls-info">
<tr><th></th><th>Keyboard</th><th>GamePad</th></tr>
<tr><th>Move</th><td>Arrow Keys</td><td>Left Stick / D-Pad</td></tr>
<tr><th>Shoot</th><td>Z</td><td>A</td></tr>
<tr><th>Bomb</th><td>X</td><td>B</td></tr>
<tr><th>Focus</th><td>Shift</td><td>L1 / R1</td></tr>
</table>`;

const gitHubLink = 'https://github.com/Melchizedek6809/touhou-jam-10';
const phaserLink = 'https://phaser.io/';

export class MainMenuScene extends Scene {
    constructor(config: Phaser.Types.Scenes.SettingsConfig) {
        if (!config) {
            config = {};
        }
        config.key = 'MainMenuScene';
        super(config);
    }

    startGame() {
        this.scene.run('UIScene');
        this.scene.switch('GameScene');
    }

    parseOptions() {
        const params = new URLSearchParams(window.location.search);
        const skipMenu = params.get('skipMenu');
        if (skipMenu) {
            this.startGame();
        }
    }

    addCreditsLinks() {
        const $links = document.createElement('div');
        $links.innerHTML = `<a href="${gitHubLink}" target="_blank" class="github-link" title="Source code available on GitHub"></a>`;
        $links.innerHTML += `<a href="${phaserLink}" target="_blank" class="phaser-link" title="Made with the Phaser framework"></a>`;
        this.add.dom(this.scale.width - 128, this.scale.height - 48, $links);
    }

    create() {
        this.parseOptions();
        this.addCreditsLinks();
        this.scene.run('GameScene');

        const buttons = '<br/><br/><button class="green-button">Start</button>';
        const $intro = document.createElement('div');
        $intro.classList.add('main-menu-text');
        $intro.innerHTML = introHTML + buttons;
        this.add.dom(this.scale.width / 2, 128, $intro).setOrigin(0.5, 0);
        const $button = $intro.querySelector(
            'button.green-button'
        ) as HTMLElement;
        if ($button) {
            $button.addEventListener('click', this.startGame.bind(this));
            $button.focus();
        }
    }

    update(time: number, delta: number) {
        const that = this;
        if (this.input.gamepad.gamepads[0]) {
            const gamepad = this.input.gamepad.gamepads[0];
            if (gamepad.A) {
                that.startGame();
            }
        }
    }
}
