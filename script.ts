/* PIXI動作チェック */
let type = 'WebGL'
if (!PIXI.utils.isWebGLSupported()) {
    type = 'canvas';
}
PIXI.utils.sayHello(type);

/* PIXIアプリケーション作成 */
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

/* ベクトル */
class Vector2 {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

/* パーティクル設定値IF */
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
/* パーティクル描画クラス */
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

    set width(value)
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
        this.width = option.width || 10;
        this.height = option.height || 10;
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
    
    private _innerRadius: number;
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
        this.innerRadius = this.radius * 0.5;
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

/* パーティクル格納コンテナ */
const particles = new PIXI.Container();
app.stage.addChild(particles);
app.stage.position.set(0, 0);

/* パーティクル数表示テキスト */
const text = new PIXI.Text('');
text.x = app.view.width / 2;
text.y = app.view.height / 2;
text.style.fill = 0xffffff;
app.stage.addChild(text);

/* パーティクルタイプ */
var ParticleType: any = Circle;

/* パーティクル変更用テキスト */
const shapeButton = new PIXI.Text('Shape:Circle');
shapeButton.interactive = true;
shapeButton.on('pointerdown', function (obj) {
    if (ParticleType === Circle) {
        ParticleType = Rect;
        shapeButton.text = 'Shape:Rectangle';
    } else if (ParticleType === Star) {
        ParticleType = Circle;
        shapeButton.text = 'Shape:Circle';
    } else if (ParticleType === Rect) {
        ParticleType = Star;
        shapeButton.text = 'Shape:Star';
    } else {
        shapeButton.text = 'Shape:NONE';
    }
});
shapeButton.position.set(0, 0);
shapeButton.style.fill = 0xffffff;
app.stage.addChild(shapeButton);

/* Main */
app.ticker.add(tick);
function tick(delta: number): void {
    if (touchEvent.touched) {
        for (let i = 0; i < 2; i++) {
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
