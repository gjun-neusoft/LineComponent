import './libs/jquery.xoperate.js';
import './libs/jquery.xoperate.gdrag.js';

export default class Point {
    constructor(opts){
        this.store = {};
        this.target = {};
        this.svg = opts.svg || '#Svg';
        //圆坐标
        this.x = opts.x || 0;
        this.y = opts.y || 0;
        //圆点半径
        this.r = opts.r || 10;
        //移动距离
        this.dis_x = 0;
        this.dis_y = 0

        //透明度
        this.opacity = opts.opacity || 1;
        //圆点颜色 
        this.color = opts.color || 'red';
        //拖拽反馈区
        this.hotSize = opts.hotSize || 5; 
        //拖拽回调事件，0：move，1: start, 2: end
        this.cbDrag = opts.cbDrag || [];

        //拖拽回调事件，0: enter 2: leave 
        this.cbHover = [];
}
    init(){
        //挂载svg
        this._injectSvg();
        // 初始化数据 注入store
        this._injectStore();
        //数据监听
        this._observeLine();
        //画点
        this.draw();
        //拖拽
        this._drag();

    }
    //如果外部没有对snap声明，会在组件内部声明并挂载到svg上；如果 外部有声明snap，会将snap注入到组件store数据中
    _injectSvg(){
        if(!!$(this.svg).data('snap')){
            this.store.snap = $(this.svg).data('snap');
        }else{
            $(this.svg).data('snap', Snap(this.svg));
            this.store.snap = Snap(this.svg);
        }
    }
    _injectStore(){
        const {x, y, r} = {...this};
        this.store = $.extend(this.store, {x, y, r});
    }
    _observeLine(){
        const observeObj = {
            x:{
                get: ()=>{
                    return this.x
                },
                set: (newValue)=>{
                    this.x = newValue;
                    this.setPoint();
                }
            },
            y:{
                get: ()=>{
                    return this.y
                },
                set: (newValue)=>{
                    this.y = newValue
                    this.setPoint();
                }
            },
            r:{
                get: ()=>{
                    return this.r
                },
                set: (newValue)=>{
                    this.r = newValue;
                }
            },
            dis_x: {
                get: ()=>{
                    return this.dis_x
                },
                set: (newValue)=>{
                    this.dis_x = newValue;
                    this.setPoint(this.x + this.dis_x, this.y + this.dis_y);
                }
            },
            dis_y: {
                get: ()=>{
                    return this.dis_y
                },
                set: (newValue)=>{
                    this.dis_y = newValue;
                    this.setPoint(this.x + this.dis_x, this.y + this.dis_y);
                }
            }
        }
        Object.defineProperties(this.store, {...observeObj})
    }
    draw(){
        const snap = this.store.snap;
        const point = snap.paper.circle(this.store.x, this.store.y, this.store.r).attr({
            fill: this.color,
            opacity: this.opacity
        })
        this.target.point = point;

    }
    _drag(){
        const _move = (dis_x, dis_y, cx, cy, offsetX, offsetY)=>{
            const _this = this;
            !!this.cbDrag[0] && this.cbDrag[0]({dis_x, dis_y, cx, cy, _this})
            this.store.dis_x = dis_x;
            this.store.dis_y = dis_y;
        }
        const _start = (x, y, target)=>{
        }
        const _end = (data)=>{
            this.store.x += this.store.dis_x;
            this.store.y += this.store.dis_y;
        }
        $(this.target.point.node).gdrag(_move, _start, _end);
    }
    setPoint(x = this.store.x, y = this.store.y, r = this.store.r){
        this.target.point.attr({
            'cx': x, 
            'cy': y,
            'r': r
        })
    }

}