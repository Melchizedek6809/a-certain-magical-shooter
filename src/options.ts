export class Options {
    skipMenu = false;
    playBGM = true;
    startPower = 0;
    showCollider = false;

    private parseBoolean (def:boolean, paramValue:string | null):boolean {
        if(paramValue === null){return def;}
        switch(paramValue.trim().toLowerCase()){
            case "1":
            case "on":
            case "true":
                return true;
            case "0":
            case "off":
            case "false":
                return false;
        }
        return def;
    }

    private parseNumber (def:number, paramValue:string | null) {
        if(paramValue === null){return def;}
        const v = parseInt(paramValue);
        return v !== undefined ? v : def;
    }

    constructor() {
        const params = new URLSearchParams(window.location.search);
        this.skipMenu = this.parseBoolean(this.skipMenu, params.get('skipMenu'));
        this.playBGM = this.parseBoolean(this.playBGM, params.get('playBGM'));
        this.showCollider = this.parseBoolean(this.showCollider, params.get('showCollider'));
        this.startPower = this.parseNumber(this.startPower, params.get('startPower'));
    }
}

const options = new Options();
export default options;