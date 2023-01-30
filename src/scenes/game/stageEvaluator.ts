import { Boss } from '../../entities/boss';
import { EnemyBullet } from '../../entities/enemyBullet';
import { Fairy } from '../../entities/fairy';
import { Pickup } from '../../entities/pickup';
import { GameScene } from './gameScene';

export class StageFiber {
    evaluator: StageEvaluator;
    code: any[];
    ip = 0;
    blockedOnSpellCard = false;
    blockedOnBoss = false;
    blockedUntil = 0;
    bindings: Map<string, any>;

    moveFrom: [number, number] = [0, 0];
    moveTo: [number, number] = [0, 0];
    moveControl: [number, number] = [0, 0];
    moveStart = 0;
    shootEveryT = 0;
    nextShot = 0;
    shotType = 'projectile';
    doInterpolate = true;
    loopFiber = false;
    shotCount = 0;
    destroyed = false;

    fairy?: Fairy | Boss;

    constructor(
        parent: StageFiber | StageEvaluator,
        code: any[],
        bindings: Map<string, any>
    ) {
        if (parent instanceof StageEvaluator) {
            this.evaluator = parent;
        } else {
            this.evaluator = parent.evaluator;
            this.fairy = parent.fairy;
            parent.doInterpolate = false;
            for (let i = 0; i < 2; i++) {
                this.moveFrom[i] = parent.moveFrom[i];
                this.moveTo[i] = parent.moveTo[i];
                this.moveControl[i] = parent.moveControl[i];
                this.shootEveryT = parent.shootEveryT;
            }
        }
        this.code = code;
        this.bindings = bindings;
        this.evaluator.fibers.push(this);
    }

    isBlocked(): boolean {
        if (this.blockedOnSpellCard) {
            const boss = this.fairy as Boss;
            if (boss.spellCardOver) {
                boss.spellCardOver = false;
                this.blockedOnSpellCard = false;
                return false;
            } else {
                return true;
            }
        }
        return (
            this.blockedUntil >= this.evaluator.ticks ||
            (this.blockedOnBoss && Boolean(this.evaluator.scene.boss))
        );
    }

    interpolate() {
        const ticks = this.evaluator.ticks;
        if (
            ticks > this.blockedUntil ||
            ticks < this.moveStart ||
            !this.doInterpolate ||
            !this.fairy
        ) {
            return;
        }
        const dur = this.blockedUntil - this.moveStart;
        const t = (ticks - this.moveStart) / dur;
        if (this.moveControl[0] >= 0 && this.moveControl[1] >= 0) {
            this.fairy.x =
                (1 - t) * (1 - t) * this.moveFrom[0] +
                2 * (1 - t) * t * this.moveControl[0] +
                t * t * this.moveTo[0];
            this.fairy.y =
                (1 - t) * (1 - t) * this.moveFrom[1] +
                2 * (1 - t) * t * this.moveControl[1] +
                t * t * this.moveTo[1];
        } else {
            this.fairy.x =
                this.moveFrom[0] + (this.moveTo[0] - this.moveFrom[0]) * t;
            this.fairy.y =
                this.moveFrom[1] + (this.moveTo[1] - this.moveFrom[1]) * t;
        }
        if (this.shootEveryT) {
            if (ticks > this.nextShot) {
                ++this.shotCount;
                if (this.shotType === 'wave') {
                    this.fairy.wave(this.shotCount);
                } else if (this.shotType === 'tea') {
                    this.fairy.teaWave(this.shotCount);
                } else if (this.shotType === 'sickle') {
                    this.fairy.sickleShoot();
                } else if (this.shotType === 'reverse-wave') {
                    this.fairy.reverseWave(this.shotCount);
                } else {
                    this.fairy.shoot();
                }
                this.nextShot += this.shootEveryT;
            }
        }
    }

    run() {
        if (this.destroyed) {
            return false;
        }
        if (this.fairy && !this.fairy.scene) {
            return false; // Fairy ded;
        }
        this.interpolate();
        while (true) {
            if (this.isBlocked()) {
                return true;
            }
            const v = this.code[this.ip++];
            if (v) {
                this.eval(v);
            } else {
                if (this.loopFiber) {
                    this.ip = 0;
                } else {
                    this.despawn();
                    return false;
                }
            }
        }
    }

    eval(val: any) {
        return this.evaluator.eval(val, this);
    }

    move(x: number, y: number, cx: number, cy: number) {
        const t = this.moveFrom;
        this.moveFrom = this.moveTo;
        this.moveTo = t;
        this.moveStart = this.evaluator.ticks;
        this.moveTo[0] = x;
        this.moveTo[1] = y;
        this.moveControl[0] = cx;
        this.moveControl[1] = cy;
    }

    wait(until: number) {
        this.blockedUntil = this.evaluator.ticks + until;
    }

    waitHere(until: number) {
        this.blockedUntil = this.evaluator.ticks + until;
        for (let i = 0; i < 2; i++) {
            this.moveFrom[i] = this.moveTo[i];
            this.moveControl[i] = this.moveTo[i];
        }
    }

    waitNoBoss() {
        this.blockedOnBoss = true;
    }

    waitSpellEnd() {
        this.blockedOnSpellCard = true;
    }

    spawn(name: string, x: number, y: number, cards: number) {
        if (name === 'fairy') {
            this.fairy = new Fairy(this.evaluator.scene, x, y);
            this.move(x, y, -1, -1);
        } else if (name === 'boss') {
            this.fairy = new Boss(this.evaluator.scene, x, y, cards);
            this.move(x, y, -1, -1);
        }
    }

    despawn() {
        if (this.fairy) {
            if (this.fairy instanceof Boss) {
                const gs = this.fairy.scene as GameScene;
                gs.boss = undefined;
                this.fairy.destroy();
                this.fairy = undefined;
            } else {
                this.fairy.destroy();
                this.fairy = undefined;
            }
        }
    }

    shootEvery(x: number, t: string) {
        this.shootEveryT = x;
        if(this.nextShot < this.evaluator.ticks){
            this.nextShot = this.evaluator.ticks;
        }
        this.shotType = t;
    }
}

export class StageEvaluator {
    scene: GameScene;
    ticks = 1;
    fibers: StageFiber[] = [];

    initGlobals(fiber: StageFiber) {
        fiber.bindings.set(
            'progn',
            ((args: any, fiber: StageFiber) => {
                if (Array.isArray(args)) {
                    let ret = undefined;
                    for (const t of args) {
                        ret = this.eval(t, fiber);
                    }
                    return ret;
                }
                return args;
            }).bind(this)
        );

        fiber.bindings.set(
            'debug-fiber',
            ((args: any, fiber: StageFiber) => {
                console.log(fiber);
            }).bind(this)
        );

        fiber.bindings.set(
            'debug',
            ((args: any, fiber: StageFiber) => {
                console.log(this);
            }).bind(this)
        );

        fiber.bindings.set(
            'fiber',
            ((args: any, fiber: StageFiber) => {
                new StageFiber(this, args, new Map(fiber.bindings)).run();
            }).bind(this)
        );

        fiber.bindings.set(
            'wait',
            ((args: any, fiber: StageFiber) => {
                const blocked = fiber.eval(args[0]);
                if (typeof blocked === 'number') {
                    fiber.wait(blocked);
                }
            }).bind(this)
        );

        fiber.bindings.set(
            'wait-here',
            ((args: any, fiber: StageFiber) => {
                const blocked = fiber.eval(args[0]);
                if (typeof blocked === 'number') {
                    fiber.waitHere(blocked);
                }
            }).bind(this)
        );

        fiber.bindings.set(
            'wait-spell-end',
            ((args: any, fiber: StageFiber) => {
                fiber.waitSpellEnd();
            }).bind(this)
        );

        fiber.bindings.set(
            'interpolate',
            ((args: any, fiber: StageFiber) => {
                fiber.doInterpolate = Boolean(fiber.eval(args[0]));
            }).bind(this)
        );

        fiber.bindings.set(
            'wait-no-boss',
            ((args: any, fiber: StageFiber) => {
                fiber.waitNoBoss();
            }).bind(this)
        );

        fiber.bindings.set(
            'print',
            ((args: any[], fiber: StageFiber) => {
                console.log(args.map((v) => fiber.eval(v)).join(' '));
            }).bind(this)
        );

        fiber.bindings.set(
            'despawn',
            ((args: any, fiber: StageFiber) => {
                if (fiber.fairy) {
                    fiber.despawn();
                }
            }).bind(this)
        );

        fiber.bindings.set(
            'comment',
            ((args: any, fiber: StageFiber) => {
                return undefined;
            }).bind(this)
        );

        fiber.bindings.set(
            'begin-spell-card',
            ((args: any, fiber: StageFiber) => {
                fiber.loopFiber = true;
                this.scene.player!.usedSpellBomb = false;
            }).bind(this)
        );

        fiber.bindings.set(
            'win-game',
            ((args: any, fiber: StageFiber) => {
                const gs = this.scene;
                if (!gs.gameOverActive) {
                    gs.scene.run('GameWonScene');
                    gs.gameOverActive = true;
                }
            }).bind(this)
        );

        fiber.bindings.set(
            'stop-spell',
            ((args: any, fiber: StageFiber) => {
                for (const cf of this.fibers) {
                    if (cf === fiber) {
                        continue;
                    }
                    if (!cf.doInterpolate) {
                        continue;
                    }
                    if (cf.fairy && cf.fairy instanceof Boss) {
                        fiber.moveControl[0] = fiber.moveControl[1] = -1;
                        cf.destroyed = true;
                        if (fiber.fairy?.scene) {
                            fiber.moveTo[0] = fiber.moveFrom[0] =
                                fiber.fairy!.x;
                            fiber.moveTo[1] = fiber.moveFrom[1] =
                                fiber.fairy!.y;
                        }
                    }
                }

                for (const bul of this.scene.enemyProjectiles?.children.entries.slice() ||
                    []) {
                    const eb = bul as EnemyBullet;
                    new Pickup(this.scene, eb.x, eb.y, 'bossStar');
                    bul.destroy();
                }
            }).bind(this)
        );

        fiber.bindings.set(
            'spawn',
            ((args: any, fiber: StageFiber) => {
                const n = fiber.eval(args[0]);
                const x = fiber.eval(args[1]);
                const y = fiber.eval(args[2]);
                const cards = fiber.eval(args[3]) || 4;
                if (
                    typeof n !== 'string' ||
                    typeof x !== 'number' ||
                    typeof y !== 'number'
                ) {
                    console.error(`Invalid args: (spawn ${args.join(' ')})`);
                } else {
                    fiber.spawn(n, x, y, cards);
                }
            }).bind(this)
        );

        fiber.bindings.set(
            'advance-bgm',
            ((args: any, fiber: StageFiber) => {
                this.scene.advanceBgm();
            }).bind(this)
        );

        fiber.bindings.set(
            'move',
            ((args: any, fiber: StageFiber) => {
                const x = fiber.eval(args[0]);
                const y = fiber.eval(args[1]);
                const cx = fiber.eval(args[2]) || -1;
                const cy = fiber.eval(args[3]) || -1;
                if (typeof x !== 'number' || typeof y !== 'number') {
                    console.error(`Invalid args: (move ${args.join(' ')})`);
                } else {
                    fiber.move(x, y, cx, cy);
                }
            }).bind(this)
        );

        fiber.bindings.set(
            'shoot-every',
            ((args: any, fiber: StageFiber) => {
                const x = fiber.eval(args[0]);
                const t = fiber.eval(args[1]) || 'projectile';
                if (typeof x !== 'number') {
                    console.error(
                        `Invalid args: (shoot-every ${args.join(' ')})`
                    );
                } else {
                    fiber.shootEvery(x, t);
                }
            }).bind(this)
        );

        fiber.bindings.set(
            'add',
            ((args: any[], fiber: StageFiber) => {
                return args.reduce((acc, v) => {
                    const n = fiber.eval(v);
                    if (typeof n !== 'number') {
                        console.error(`Invalid args: (add ${args.join(' ')})`);
                        return acc;
                    } else {
                        return acc + n;
                    }
                }, 0);
            }).bind(this)
        );

        fiber.bindings.set(
            'sub',
            ((args: any[], fiber: StageFiber) => {
                return args.reduceRight((acc, v) => {
                    const n = fiber.eval(v);
                    if (typeof n !== 'number') {
                        console.error(`Invalid args: (sub ${args.join(' ')})`);
                        return acc;
                    } else {
                        return acc - n;
                    }
                }, 0);
            }).bind(this)
        );

        fiber.bindings.set(
            'mul',
            ((args: any[], fiber: StageFiber) => {
                return args.reduce((acc, v) => {
                    const n = fiber.eval(v);
                    if (typeof n !== 'number') {
                        console.error(`Invalid args: (mul ${args.join(' ')})`);
                        return acc;
                    } else {
                        return acc * n;
                    }
                }, 1);
            }).bind(this)
        );

        fiber.bindings.set(
            'div',
            ((args: any[], fiber: StageFiber) => {
                return args.reduceRight((acc, v) => {
                    const n = fiber.eval(v);
                    if (typeof n !== 'number') {
                        console.error(`Invalid args: (div ${args.join(' ')})`);
                        return acc;
                    } else {
                        return acc / n;
                    }
                }, 1);
            }).bind(this)
        );

        fiber.bindings.set(
            'dotimes',
            ((args: any[], fiber: StageFiber) => {
                const sym = args[0][0];
                const count = fiber.eval(args[0][1]);
                let i = 0;
                const code = args.slice(1);
                if (typeof sym !== 'string' || typeof count !== 'number') {
                    console.error(`Invalid args: (def ${args.join(' ')})`);
                } else {
                    let ret = undefined;
                    while (i < count) {
                        fiber.bindings.set(sym, i++);
                        for (const e of code) {
                            ret = fiber.eval(e);
                        }
                    }
                    return ret;
                }
            }).bind(this)
        );

        fiber.bindings.set(
            'def',
            ((args: any[], fiber: StageFiber) => {
                const n = fiber.eval(args[0]);
                const x = fiber.eval(args[1]);
                if (typeof n !== 'string') {
                    console.error(`Invalid args: (def ${args.join(' ')})`);
                } else {
                    fiber.bindings.set(n, x);
                }
            }).bind(this)
        );

        fiber.bindings.set(
            'lambda',
            ((args: any[], fiber: StageFiber) => {
                const argnames: string[] = args[0];
                const code = args[1];
                if (!Array.isArray(argnames) || !Array.isArray(code)) {
                    console.error(`Invalid λ: (lambda ${args.join(' ')})`);
                }
                return ((args: any[], fiber: StageFiber) => {
                    let i = 0;
                    argnames.map((a) =>
                        fiber.bindings.set(a, fiber.eval(args[i++]))
                    );
                    return fiber.eval(code);
                }).bind(this);
            }).bind(this)
        );

        fiber.bindings.set(
            'deffiber',
            ((args: any[], fiber: StageFiber) => {
                const n = fiber.eval(args[0]);
                const argnames: string[] = args[1];
                const code = args.slice(2);
                if (!Array.isArray(argnames) || !Array.isArray(code)) {
                    console.error(
                        `Invalid deffiber: (deffiber ${args.join(' ')})`
                    );
                }
                const pBindings = fiber.bindings;
                const λ = ((args: any[], n: StageFiber) => {
                    const bindings = new Map(pBindings);
                    let i = 0;
                    argnames.map((a) => bindings.set(a, n.eval(args[i++])));
                    new StageFiber(n, code.slice(), bindings).run();
                }).bind(this);
                return fiber.bindings.set(n, λ);
            }).bind(this)
        );
    }

    constructor(data: string, scene: GameScene) {
        this.scene = scene;
        const syntax = [
            [/\(/g, '['],
            [/\)/g, ']'],
            [/([a-zA-Z\+\-*/]+[a-zA-Z\+\-*/]+)/g, '"$1"'],
            [/(["0-9\-\]])\s+(["0-9\-\[])/g, '$1, $2'],
        ];
        const buf = data
            .split('\n')
            .map((line) => line.trim().replace(/;.*/, '').trim())
            .join(' ');
        const sBuf = syntax.reduce(
            (b, s) => b.replace(s[0], s[1] as string),
            buf
        );
        try {
            const sExpr = JSON.parse(`["progn", ${sBuf}]`);
            const fiber = new StageFiber(this, sExpr, new Map());
            this.initGlobals(fiber);
            fiber.run();
        } catch (e) {
            console.error(e);
            console.error('Error parsing SExpr:');
            console.log(sBuf);
        }
    }

    apply(λ: any, args: any, fiber: StageFiber) {
        const fun = fiber.bindings.get(λ) || λ;
        if (typeof fun === 'function') {
            return fun(args, fiber);
        } else {
            console.log(`Unknown λ: ('${fun}' ${args.join(' ')})`);
        }
    }

    eval(val: any, fiber: StageFiber) {
        if (Array.isArray(val)) {
            return this.apply(val[0], val.slice(1), fiber);
        } else if (typeof val === 'string') {
            return fiber.bindings.has(val) ? fiber.bindings.get(val) : val;
        } else {
            return val;
        }
    }

    tick(delta: number) {
        this.ticks += delta;
        this.fibers.filter((fiber) => fiber.run());
    }
}
