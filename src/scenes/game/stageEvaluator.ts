import { Fairy } from '../../entities/fairy';
import { GameScene } from './gameScene';

export class StageFiber {
    evaluator: StageEvaluator;
    code: any[];
    blockedUntil = 0;
    bindings: Map<string, any>;

    moveFrom: [number, number] = [0, 0];
    moveTo: [number, number] = [0, 0];
    moveStart = 0;
    shootEveryT = 0;
    nextShot = 0;
    fairy?: Fairy;

    constructor(
        evaluator: StageEvaluator,
        code: any[],
        bindings: Map<string, any>
    ) {
        this.evaluator = evaluator;
        this.code = code;
        this.bindings = bindings;
        evaluator.fibers.push(this);
    }

    interpolate() {
        const ticks = this.evaluator.ticks;
        if (
            ticks > this.blockedUntil ||
            ticks < this.moveStart ||
            !this.fairy
        ) {
            return;
        }
        const dur = this.blockedUntil - this.moveStart;
        const i = (ticks - this.moveStart) / dur;
        const x = this.moveFrom[0] + (this.moveTo[0] - this.moveFrom[0]) * i;
        const y = this.moveFrom[1] + (this.moveTo[1] - this.moveFrom[1]) * i;
        this.fairy.x = x;
        this.fairy.y = y;
        if (this.shootEveryT) {
            if (ticks > this.nextShot) {
                this.fairy.shoot();
                this.nextShot += this.shootEveryT;
            }
        }
    }

    run() {
        if (this.fairy && !this.fairy.scene) {
            return false; // Fairy ded;
        }
        this.interpolate();
        while (true) {
            if (this.blockedUntil >= this.evaluator.ticks) {
                return true;
            }
            const v = this.code.shift();
            if (v) {
                this.eval(v);
            } else {
                this.despawn();
                return false;
            }
        }
    }

    eval(val: any) {
        return this.evaluator.eval(val, this);
    }

    move(x: number, y: number) {
        const t = this.moveFrom;
        this.moveFrom = this.moveTo;
        this.moveTo = t;
        this.moveStart = this.evaluator.ticks;
        this.moveTo[0] = x;
        this.moveTo[1] = y;
    }

    wait(until: number) {
        this.blockedUntil = this.evaluator.ticks + until;
    }

    spawn(name: string, x: number, y: number) {
        this.fairy = new Fairy(this.evaluator.scene, x, y);
        this.move(x, y);
    }

    despawn() {
        if (this.fairy) {
            this.fairy.destroy();
            this.fairy = undefined;
        }
    }

    shootEvery(x: number) {
        this.shootEveryT = x;
        this.nextShot = this.evaluator.ticks + x;
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
            'spawn',
            ((args: any, fiber: StageFiber) => {
                const n = fiber.eval(args[0]);
                const x = fiber.eval(args[1]);
                const y = fiber.eval(args[2]);
                if (
                    typeof n !== 'string' ||
                    typeof x !== 'number' ||
                    typeof y !== 'number'
                ) {
                    console.error(`Invalid args: (spawn ${args.join(' ')})`);
                } else {
                    fiber.spawn(n, x, y);
                }
            }).bind(this)
        );

        fiber.bindings.set(
            'move',
            ((args: any, fiber: StageFiber) => {
                const x = fiber.eval(args[0]);
                const y = fiber.eval(args[1]);
                if (typeof x !== 'number' || typeof y !== 'number') {
                    console.error(`Invalid args: (move ${args.join(' ')})`);
                } else {
                    fiber.move(x, y);
                }
            }).bind(this)
        );

        fiber.bindings.set(
            'shoot-every',
            ((args: any, fiber: StageFiber) => {
                const x = fiber.eval(args[0]);
                if (typeof x !== 'number') {
                    console.error(`Invalid args: (move ${args.join(' ')})`);
                } else {
                    fiber.shootEvery(x);
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
                return args.reduce((acc, v) => {
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
                return args.reduce((acc, v) => {
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
                    argnames.map((a) =>
                        fiber.bindings.set(a, fiber.eval(args.shift()))
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
                    new StageFiber(
                        fiber.evaluator,
                        code.slice(),
                        bindings
                    ).run();
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
            return fiber.bindings.get(val) || val;
        } else {
            return val;
        }
    }

    tick(delta: number) {
        this.ticks += delta;
        this.fibers.filter((fiber) => fiber.run());
    }
}
