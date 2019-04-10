import { Vector2 } from '../Vector2/Vector2';
export { Shape, Circle, Rect, Star }

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
        this.maxLife = this.life = Math.floor(option.life || 60);
        this.v = new Vector2(0, 0);
    }
    render(delta?: number): void {}
    update(delta: number): void {}
}
class Circle extends Shape {
    constructor(option?: ParticleOption ) {
        super(option);
        this.shape = PIXI.SHAPES.CIRC;
    }
    public render(delta?: number): void {
        this.clear();

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
        this.clear();

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
        this.clear();

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
