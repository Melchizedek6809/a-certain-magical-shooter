import { GameObjects, Scene, Tilemaps, Types } from 'phaser';

const animation_frames = (frame:string, frames:number) => {
    const ret = [];
    for(let i=0;i<frames;i++){
        ret.push({key: 'packed', frame:`${frame}/${frame}-${i}`});
    }
    return ret;
};

export class GameScene extends Scene {
    cursorKeys?: Types.Input.Keyboard.CursorKeys;
    gameOverActive: boolean;


    constructor (config: Phaser.Types.Scenes.SettingsConfig) {
        if(!config){config = {};}
        config.key = 'GameScene';
        super(config);
        this.gameOverActive = false;
    }

    create () {
        const that = this;

        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.gameOverActive = false;

        this.scene.run("UIScene");


        //this.cameras.main.setBounds(-worldWidth, -worldHeight, worldWidth*2, worldHeight*2);
        //this.cameras.main.startFollow(this.player, false, 0.1, 0.1, 0, 0);
    }

    update(time: number, delta: number) {
        /*
        this.player?.update(time, delta);
        if(this.player?.isDead){
            if(!this.gameOverActive){
               this.scene.run("GameOverScene");
               this.gameOverActive = true;
            }
        }
        */
    }
}