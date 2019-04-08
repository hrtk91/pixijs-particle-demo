let type = 'WebGL'
if (!PIXI.utils.isWebGLSupported()) {
    type = 'canvas';
}
PIXI.utils.sayHello(type);

const app = new PIXI.Application({
    width: 512,
    height: 512,
    antialias: true,
    transparent: false,
    resolution: 1,
    autoResize: true,
});
app.renderer.backgroundColor = 0x061639;
app.renderer.autoResize = true;

document.body.appendChild(app.view);

class Vector2 {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

interface ParticleOption {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    radius?: number;
    fill?: number;
    alpha?: number;
    life?: number;
    shape?: number;
    points?: number;
}
class Shape extends PIXI.Graphics {
    radius: number;
    fill: number;
    maxLife: number;
    life: number;
    v: Vector2;
    shape: number;

    private _height: number;
    get height()
    {
        return Math.abs(this.scale.y) * this._height;
    }
    set height(value)
    {
        const s = this.scale.y > 0 ? 1 : -1;

        this.scale.y = s * value / this._height;
        this._height = value;
    }

    private _width: number;
    get width()
    {
        return Math.abs(this.scale.x) * this._width;
    }

    set width(value) // eslint-disable-line require-jsdoc
    {
        const s = this.scale.x > 0 ? 1 : -1;

        this.scale.x = s * value / this._width;
        this._width = value;
    }

    constructor(option?: ParticleOption ) {
        super();
        option = option || {};
        this.x = option.x || 0;
        this.y = option.y || 0;
        this.radius = option.radius || 5;
        this.width = option.width || 5;
        this.height = option.height || 5;
        this.fill = option.fill || 0xffffff;
        this.alpha = option.alpha || 1;
        this.maxLife = this.life = Math.floor(option.life || app.ticker.FPS);
        this.v = new Vector2(0, 0);
    }
    render(delta?: number): void {
        this.clear();
        if (!(0 <= this.x && this.x < app.view.width &&
            app.view.height > this.y && this.y > 0)) return;
    }
    update(delta: number): void {

    }
}

class Circle extends Shape {
    constructor(option?: ParticleOption ) {
        super(option);
        this.shape = PIXI.SHAPES.CIRC;
    }
    public render(delta?: number): void {
        super.render(delta);

        this.beginFill(this.fill, this.alpha);
        this.drawCircle(0, 0, this.radius);
        this.endFill();
    }
    public update(delta: number): void {
        this.x += this.v.x;
        this.y += this.v.y;

        this.life -= delta;
        this.scale.y = this.scale.x = this.alpha = this.life / this.maxLife;
        if (this.life < 0) {
            this.parent.removeChild(this);
        }
    }
}
class Rect extends Shape {
    constructor(option?: ParticleOption ) {
        super(option);
        this.shape = PIXI.SHAPES.RECT;
    }
    public render(delta?: number): void {
        super.render(delta);

        this.beginFill(this.fill, this.alpha);
        this.drawRect(0, 0, this.width, this.height);
        this.endFill();
    }
    public update(delta: number): void {
        this.x += this.v.x;
        this.y += this.v.y;

        this.life -= delta;
        this.scale.y = this.scale.x = this.alpha = this.life / this.maxLife;
        if (this.life < 0) {
            this.parent.removeChild(this);
        }
    }
}
class Star extends Shape {
    public points: number;
    
    private _innerRadius: number = 5;
    get innerRadius(): number
    {
        return this._innerRadius;
    }
    set innerRadius(value: number)
    {
        this._innerRadius = value;
    }

    constructor(option?: ParticleOption ) {
        super(option);

        this.shape = PIXI.SHAPES.CIRC;
        this.points = option.points || 5;
        this.innerRadius = this.radius * 0.3;
    }
    public render(delta?: number): void {
        super.render(delta);

        this.beginFill(this.fill, this.alpha);
        this.drawStar(0, 0, this.points, this.radius, this.innerRadius, this.rotation);
        this.endFill();
    }
    public update(delta: number): void {
        this.x += this.v.x;
        this.y += this.v.y;

        this.life -= delta;
        this.scale.y = this.scale.x = this.alpha = this.life / this.maxLife;
        if (this.life < 0) {
            this.parent.removeChild(this);
        }
    }
}

/* タッチイベント */
let touchEvent = {
    touched: false,
    x: 0,
    y: 0
}
function point(evt: PointerEvent) {
    touchEvent.touched = true;
}
function touched(evt: MouseEvent) {
    const x = evt.clientX - app.view.getBoundingClientRect().left;
    const y = evt.clientY - app.view.getBoundingClientRect().top;
    touchEvent.x = x;
    touchEvent.y = y;
}
function release(evt: PointerEvent) {
    const x = evt.clientX - app.view.getBoundingClientRect().left;
    const y = evt.clientY - app.view.getBoundingClientRect().top;
    touchEvent.x = x;
    touchEvent.y = y;
    touchEvent.touched = false;
}

app.view.onpointerdown = point;
app.view.onpointermove = touched;
app.view.onpointerup = release;

const particles = new PIXI.Container();
app.stage.addChild(particles);
app.stage.position.set(0, 0);

const text = new PIXI.Text('');
text.x = app.view.width / 2;
text.y = app.view.height / 2;
text.style.fill = 0xffffff;
app.stage.addChild(text);

/*
const shapeButton = new PIXI.Text('off');
shapeButton.on('mousemove', function (obj) {
    console.log('test');
    shapeButton.text = 'on';
});
shapeButton.position.set(100, 100);
shapeButton.style.fill = 0xffffff;
app.stage.addChild(shapeButton);
*/

let ParticleType = Star;


/* Main */
app.ticker.add(tick);
function tick(delta: number): void {
    if (touchEvent.touched) {
        for (let i = 0; i < 10; i++) {
            const particle = new ParticleType({
                x: touchEvent.x,
                y: touchEvent.y,
                fill: 0x2277ee,
            });
            const rad = Math.PI * (-1 + Math.random() * 2);
            particle.v.x = Math.cos(rad);
            particle.v.y = Math.sin(rad);
            particle.blendMode = PIXI.BLEND_MODES.ADD;
            particles.addChild(particle);
        }
    }

    text.text = particles.children.length.toString();

    particles.children.forEach((particle: Shape) => {
        particle.update(delta);
        particle.render(delta);
    });
}
