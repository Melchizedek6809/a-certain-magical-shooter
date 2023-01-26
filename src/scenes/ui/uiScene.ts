import { GameObjects, Scene } from 'phaser';
import { GameScene } from '../game/gameScene';

export class UIScene extends Scene {

    constructor (config: Phaser.Types.Scenes.SettingsConfig) {
        if(!config){config = {};}
        config.key = 'UIScene';
        super(config);
    }

    create () {

    }

    update(time: number, delta: number) {
        const game = this.scene.get('GameScene') as GameScene;
    }
}