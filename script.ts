import { Circle, Rect, Star, Shape } from './Shape/Shape';


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
                life: 100 + (Math.random() * app.ticker.FPS)
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
