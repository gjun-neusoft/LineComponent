
// import Snap from './libs/snap.svg-min.js'
import './libs/jquery.xoperate.js';
import './libs/jquery.xoperate.gdrag.js';

export default class Line {
    constructor(opts){
        const {svg, x1, y1, cx, cy, x2, y2, stroke, strokeWidth, hotSize, isDrag, break_size, cbDrag, cbHover, cbCenterDrag, cbCenterHover, activeStroke, lockX, lockY, insize} = {...opts};
        // 组件数据
        this.store = {};
        //操作的svg
        this.svg = svg || '#Svg';
        //轴心坐标
        this.cx = cx || 0;
        this.cy = cy || 0;
        
        //计算延长线之前的移动距离 
        this.dis_x = 0;
        this.dis_y = 0;
        //计算延长线之后拖拽X轴距离
        this.drag_dx = 0;
        //计算延长线之后拖拽y轴距离
        this.drag_dy = 0;
        //当前拖拽起始点x坐标
        this.drag_x1 = 0;
        //当前拖拽起始点y坐标
        this.drag_y1 = 0;
        //当前拖拽结束点x坐标
        this.drag_x2 = 0;
        //当前拖拽结束点y坐标
        this.drag_y2 = 0;
        //当前拖拽鼠标x坐标
        this.drag_cx = 0;
        //当前拖拽鼠标y坐标
        this.drag_cy = 0;
        //锁定X轴
        this.lockX = lockX || false;
        //锁定Y轴
        this.lockY = lockY || false;

        //起始点坐标
        this.x1 = x1 || 0;
        this.y1 = y1 || 0;
        //结束点坐标
        this.x2 = x2 || 0;
        this.y2 = y2 || 0;
        //reset配置
        this.default = {
            x1: this.x1,
            x2: this.x2,
            y1: this.y1,
            y2: this.y2,
            cx: this.cx,
            cy: this.cy
        }
        //限制移动区域
        this.insize = insize || {
            x_min: 0,
            y_min: 0,
            x_max: $(this.svg).outerWidth(),
            y_max: $(this.svg).outerHeight()
        }
        //直线断点间距
        this.break_size = break_size || 0;

        //颜色
        this.stroke = stroke || '#000';
        //acitve时线的颜色
        this.activeStroke = activeStroke || 'red';
        //大小
        this.strokeWidth = strokeWidth || 2;
        //操作dom
        this.target = {};
        //是否拖拽
        this.isDrag = isDrag || true;
        //拖拽反馈区
        this.hotSize = hotSize || 20; 
        //拖拽回调事件，0：move，1: start, 2: end
        this.cbDrag = cbDrag || [];
        //拖拽回调事件，0: enter 2: leave 
        this.cbHover = cbHover || [];
        //中心区域拖拽回调  0：move，1: start, 2: end
        this.cbCenterDrag = cbCenterDrag || [],
        //中心区域hover回调  0: enter 2: leave
        this.cbCenterHover = cbCenterHover || [],
        //当前线的动作状态，外部controller会根据这个属性来与其他组件交互,暂时没用上
        this.curDrag = false;
        //斜率
        this.k = 0;
        //线的遮罩id
        this.maskId = 0;
    }
    //初始化
    init(){
        //挂载svg
        this._injectSvg();
        // 初始化数据 注入store
        this._injectStore();
        
        //数据监听
        this._observeLine();
        //画线
        this.draw();
        //拖拽
        this.isDrag && this._drag();
        //hover
        this._hover();
        
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
    //画线
    draw(){
        const snap = this.store.snap;
        let line;
        //遮罩层的ID，唯一
        this.maskId = 'mask'+new Date().getTime();

        if ( this.store.y1 === this.store.y2){ // 水平线
            line = snap.paper.path(`M${this.store.x1} ${this.store.y1} L${this.store.cx - this.hotSize/2} ${this.store.cy} M${this.store.cx + this.hotSize/2} ${this.store.cy} L${this.store.x2} ${this.store.y2}`).attr({
                stroke: '#fff',
                strokeWidth: this.strokeWidth
            })
        }
        if (this.store.x1 === this.store.x2){ // 垂直线
            line = snap.paper.path(`M${this.store.x1} ${this.store.y1} L${this.store.cx} ${this.store.cy - this.hotSize/2} M${this.store.cx} ${this.store.cy + this.hotSize/2} L${this.store.x2} ${this.store.y2}`).attr({
                stroke: '#fff',
                strokeWidth: this.strokeWidth
            })
        }
        if (!line) {
            line = snap.paper.path(`M${this.store.x1} ${this.store.y1} L${this.store.cx - this.hotSize/2} ${this.store.cy - this.hotSize/2} M${this.store.cx + this.hotSize/2} ${this.store.cy + this.hotSize/2} L${this.store.x2} ${this.store.y2}`).attr({
                stroke: '#fff',
                strokeWidth: this.strokeWidth
            })
        }
        //绘制操作的背景线
        const line_bg = snap.paper.path(`M${this.store.x1} ${this.store.y1} L${this.store.x2} ${this.store.y2}`).attr({
            'stroke': this.stroke,
            'strokeWidth': this.hotSize,
            'opacity': 0,
            'id': 'line'+this.maskId
        })
        //绘制遮罩的空心区域
        const circle = snap.paper.circle(this.store.cx, this.store.cy, this.break_size/2).attr({
            'id': this.maskId
        })
        //绘制被蒙层遮挡的底层
        const rect = snap.paper.rect(0, 0, $(this.svg).outerWidth(), $(this.svg).outerHeight()).attr({
            'fill': this.stroke,
            'id': 'rect'+this.maskId
        });
        const center_circle = snap.paper.circle(this.store.cx, this.store.cy, this.break_size/2).attr({
            'id': 'center_'+this.maskId,
            'opacity': 0
        })
        //设置底层遮罩样式
        $(rect.node).css({
            'mask': `url("#${this.maskId}")`
        })
       
        this.target.line = line;
        this.target.circle = circle;

        if(!!$(this.svg).data('rectgroup')){
            this.store.rectgroup = $(this.svg).data('rectgroup');
            this.store.rectgroup.add(rect);
        }else{
            this.store.rectgroup = snap.paper.g(rect).attr({'class': 'rect-group'});
            $(this.svg).data('rectgroup', this.store.rectgroup);
        }
        
        if(!!$(this.svg).data('linegroup')){
            this.store.linegroup = $(this.svg).data('linegroup');
            this.store.linegroup.add(line_bg, center_circle);
        }else{
            this.store.linegroup = snap.paper.g(line_bg, center_circle).attr({'class': 'line-group'});
            $(this.svg).data('linegroup', this.store.linegroup);
        }
        
        this.target.rect = rect;
        this.target.line_bg = line_bg;
        this.target.center_circle = center_circle;
        this.target.mask = snap.paper.mask().attr('id', this.maskId).toDefs();
        this.target.mask.add(line);
        this.target.mask.add(circle);
    }
    // 重置
    reset(){
        this.store.x1 = this.default.x1;
        this.store.x2 = this.default.x2;
        this.store.y1 = this.default.y1;
        this.store.y2 = this.default.y2;
        this.store.cx = this.default.cx;
        this.store.cy = this.default.cy;
        this.setLine()
    }
    //计算断点
    mathBreakPoints(circleP, mouseP, r){
        let findP1 = {
                x: null, 
                y: null
            },
            findP2 = {
                x: null,
                y: null
            }
        if(circleP.x !== mouseP.x){
            const chaX = mouseP.x - circleP.x,
                  chaY = mouseP.y - circleP.y;
            findP1 = {
                x: circleP.x + chaX/(Math.sqrt((chaX * chaX) + (chaY * chaY))/r),
                y: circleP.y + chaY/(Math.sqrt((chaX * chaX) + (chaY * chaY))/r)
            }
            findP2 = {
                x: circleP.x - chaX/(Math.sqrt((chaX * chaX) + (chaY * chaY))/r),
                y: circleP.y - chaY/(Math.sqrt((chaX * chaX) + (chaY * chaY))/r)
            }

        }else{
            findP1 = {
                x: circleP.x,
                y: circleP.y + r
            }
            findP2 = {
                x: circleP.x,
                y: circleP.y - r
            }
        }
        return {p1: findP1, p2: findP2}

    }
    //设置线属性
    setLine(x1 = this.store.x1, y1 = this.store.y1, x2 = this.store.x2, y2 = this.store.y2, cx = this.store.cx, cy = this.store.cy){
        // const _this = this;
        // const angle = this.angle({x: this.store.cx, y: this.store.cy}, {x: x1, y: y1})
        // const breakPoint = this.mathBreakPoints({x: this.store.cx, y: this.store.cy}, {x: this.store.drag_cx, y: this.store.drag_cy}, 10)

        //初始化时数据先被注入，此时线还没有draw，所以这里要判断 是否为空
        if(!$.isEmptyObject(this.target.line)){
            //主线修改全部属性
            this.target.line.attr({
                d: `M${x1} ${y1} L${x2} ${y2}`,
                'strokeWidth': this.strokeWidth
            })
            //辅线只修改直线坐标
            this.target.line_bg.attr({
                d: `M${x1} ${y1} L${x2} ${y2}`
            })
            //轴心断开区坐标
            this.target.circle.attr({
                'cx': cx,
                'cy': cy
            })
            this.target.center_circle.attr({
                'cx': cx,
                'cy': cy
            })
        }
    }

    //监听数据 
    _observeLine(){
        const observeObj = {
            //直线起始点x坐标
            x1: {
                get: ()=>{
                    return this.x1
                },
                set: (newValue)=>{
                   this.x1 = newValue;
                   this.setLine();
                }
            },
            //直线起始点y坐标
            y1: {
                get: ()=>{
                    return this.y1
                },
                set: (newValue)=>{
                    this.y1 = newValue;
                    this.setLine();
                }
            },
            //直线结束 点x坐标
            x2: {
                get: ()=>{
                    return this.x2
                },
                set: (newValue)=>{
                    this.x2 = newValue;
                    this.setLine();
                }
            },
            //直线结束 点y坐标
            y2: {
                get: ()=>{
                    return this.y2
                },
                set: (newValue)=>{
                    this.y2 = newValue;
                    this.setLine();
                }
            },
            cx: {
                get: () => {
                    return this.cx
                },
                set: (newValue) => {
                    this.cx = newValue;
                    this.setLine()
                }
            },
            cy: {
                get: () => {
                    return this.cy
                },
                set: (newValue) => {
                    this.cy = newValue;
                    this.setLine()
                }
            },
            //托动时的x坐标 ，当前 坐标
            drag_cx: {
                get: ()=>{
                    return this.drag_cx
                },
                set: (newValue)=>{
                    this.drag_cx = newValue;
                    this.setLine();
                }
            },
            //托动时的y坐标 ，当前 坐标
            drag_cy: {
                get: ()=>{
                    return this.drag_cy
                },
                set: (newValue)=>{
                    this.drag_cy = newValue;
                    this.setLine();
                }
            },
            //托动的x轴距离 
            drag_dx: {
                get: ()=>{
                    return this.drag_dx
                },
                set: (newValue)=>{
                    this.drag_dx = newValue;
                    this.setLine(this.x1 + this.drag_dx, this.y1 + this.drag_dy, this.x2 + this.drag_dx, this.y2 + this.drag_dy, this.cx + this.dis_x, this.cy + this.dis_y);
                }
            },
            //托动的y轴距离 
            drag_dy: {
                get: ()=>{
                    return this.drag_dy
                },
                set: (newValue)=>{
                    this.drag_dy = newValue;
                    this.setLine(this.x1 + this.drag_dx, this.y1 + this.drag_dy, this.x2 + this.drag_dx, this.y2 + this.drag_dy, this.cx + this.dis_x, this.cy + this.dis_y);
                }
            },
            //拖动的起始点x坐标
            drag_x1: {
                get: ()=>{
                    return this.drag_x1
                },
                set: (newValue)=>{
                    this.drag_x1 = newValue;
                }
            },
             //拖动的起始点y坐标
            drag_y1: {
                get: ()=>{
                    return this.drag_y1
                },
                set: (newValue)=>{
                    this.drag_y1 = newValue;
                }
            },
             //拖动的结束点x坐标
            drag_x2: {
                get: ()=>{
                    return this.drag_x2
                },
                set: (newValue)=>{
                    this.drag_x2 = newValue;
                }
            },
            //拖动的结束点y坐标
            drag_y2: {
                get: ()=>{
                    return this.drag_y2
                },
                set: (newValue)=>{
                    this.drag_y2 = newValue;
                }
            },
            dis_x: {
                get: ()=>{
                    return this.dis_x
                },
                set: (newValue)=>{
                    this.dis_x = newValue;
                    let np = this._mathPoint({
                        x: this.x1 + this.dis_x,
                        y: this.y1 + this.dis_y
                    },{
                        x: this.x2 + this.dis_x,
                        y: this.y2 + this.dis_y
                    })
                    this.drag_dx = np.start.x - this.x1;
                    this.drag_dy = np.start.y - this.y1;
                    
                }
            },
            dis_y: {
                get: ()=>{
                    return this.dis_y
                },
                set: (newValue)=>{
                    this.dis_y = newValue;
                    let np = this._mathPoint({
                        x: this.store.x1 + this.dis_x,
                        y: this.store.y1 + this.dis_y
                    },{
                        x: this.store.x2 + this.dis_x,
                        y: this.store.y2 + this.dis_y
                    })
                    this.store.drag_dx = np.start.x - this.store.x1;
                    this.store.drag_dy = np.start.y - this.store.y1;

                    
                }
            }

        }
        Object.defineProperties(this.store, {...observeObj})
    }
    //数据 注入到stroe中
    _injectStore(){
        const {x1, y1, x2, y2} = {...this};
        this.store = $.extend(this.store, {x1,y1,x2,y2});
    }
    //拖拽
    _drag(){
        let _move = (dis_x, dis_y, cx, cy, offsetX, offsetY)=>{
            if(offsetX <= this.insize.x_min || offsetX >= this.insize.x_max){
                return false
            }
            if(offsetY <= this.insize.y_min || offsetY >= this.insize.y_max){
                return false
            }
            const _this = this;
            !!this.cbDrag[0] && this.cbDrag[0]({dis_x, dis_y, cx, cy, _this})
            this.store.dis_x = !this.lockX ? dis_x : 0;
            this.store.dis_y = !this.lockY ? dis_y : 0;
            $(this.target.center_circle.node).attr({'cx':this.store.cx + this.store.drag_dx, 'cy':this.store.cy + this.store.drag_dy})
        },
        _start = (x, y, target)=>{
            const _this = this;
            this.curDrag = true;
            !!this.cbDrag[1] && this.cbDrag[1]({x, y, target, _this})
            //拖动的起始点坐标
            this.store.drag_x1 = x;
            this.store.drag_y1 = y;

            // this.store.drag_cx = x;
            // this.store.drag_cy = y;
        },
        _end = (data)=>{
            this.curDrag = false;
            !!this.cbDrag[2] && this.cbDrag[2](data)
            //结束拖动，当前坐标
            this.store.drag_x2 = data.x;
            this.store.drag_y2 = data.y;
            //结束拖动， 当前轴心坐标
            this.store.cx = this.store.cx + this.store.dis_x;
            this.store.cy = this.store.cy + this.store.dis_y;
            //结束拖动，两点坐标
            this.store.x1 += this.store.drag_dx;
            this.store.y1 += this.store.drag_dy;
            this.store.x2 += this.store.drag_dx;
            this.store.y2 += this.store.drag_dy;
        };
        let _cmove = (dis_x, dis_y, cx, cy)=>{
            console.log('cmove')
            const _this = this;
            !!this.cbCenterDrag[0] && this.cbCenterDrag[0]({dis_x, dis_y, cx, cy, _this});
            this.store.dis_x = dis_x;
            this.store.dis_y = dis_y;
            // $(this.target.center_circle.node).attr({
            //     'cx': this.store.cx + this.store.dis_x,
            //     'cy': this.store.cy + this.store.dis_y
            // })
        },
            _cstart = (x, y, target)=>{
                console.log('cstart')
                const _this = this;
                !!this.cbCenterDrag[1] && this.cbCenterDrag[1]({x, y, target, _this});
                this.curDrag = true;
                this.store.drag_x1 = x;
                this.store.drag_y1 = y;
            },
            _cend = (data)=>{
                console.log('cend')
                !!this.cbCenterDrag[2] && this.cbCenterDrag[2](data);
                this.curDrag = false;
                //结束拖动，当前坐标
                this.store.drag_x2 = data.x;
                this.store.drag_y2 = data.y;
                //结束拖动， 当前轴心坐标
                this.store.cx = this.store.cx + this.store.dis_x;
                this.store.cy = this.store.cy + this.store.dis_y;
                //结束拖动，两点坐标
                this.store.x1 += this.store.drag_dx;
                this.store.y1 += this.store.drag_dy;
                this.store.x2 += this.store.drag_dx;
                this.store.y2 += this.store.drag_dy;
            }
        $(this.target.line_bg.node).gdrag(_move, _start, _end);
        $(this.target.center_circle.node).gdrag(_cmove, _cstart, _cend);
    }
    
    //hover
    _hover (){
        $(this.target.line_bg.node)
            .on('mouseenter', ()=>{
                console.log('over')
                !!this.cbHover[0] && this.cbHover[0]();
                this.target.rect.attr('fill',this.activeStroke)
            })
            .on('mouseleave', ()=>{
                console.log('leave')
                if(!this.curDrag){
                    !!this.cbHover[1] && this.cbHover[1]();
                    this.target.rect.attr('fill',this.stroke)
                }
            })
    }
    angle(start,end){
        var diff_x = end.x - start.x,
            diff_y = end.y - start.y;
        //返回角度,不是弧度
        return 360*Math.atan(diff_y/diff_x)/(2*Math.PI);
    }
    hide(){
        $(this.store.linegroup.node).find('#line'+this.maskId).hide();
        $(this.store.rectgroup.node).find('#rect'+this.maskId).hide();
    }
    show(){
        $(this.store.linegroup.node).find('#line'+this.maskId).show();
        $(this.store.rectgroup.node).find('#rect'+this.maskId).show();
    }
    //计算延长线
    _mathPoint(p1, p2){
        let start, end;
        	
        // 求斜率
        //垂直线斜率判断 
        if(p1.x.toFixed(5) === p2.x.toFixed(5)) {
            start = {
                x: p1.x,
                y: 0
            };
            end = {
                x: p2.x,
                y: $(this.svg).outerHeight()
            }
        }else if(p1.y.toFixed(5) === p2.y.toFixed(5)){ 		//水平线斜率判断 
            
            start = {
                x: 0,
                y: p1.y
            };
            end = {
                x: $(this.svg).outerWidth(),
                y: p2.y
            }
            
        }else{
            // 斜率
            const k = (p2.y - p1.y)/(p2.x - p1.x);
            this.k = k;
            // 起始点截距，
            const b = p1.y - p1.x * k;
            const w = $(this.svg).outerWidth(),
                  h = $(this.svg).outerHeight();
            // 结束 点 截距
            if(-(b / k) >= 0 && -(b / k) <= w){ //与上边相交
                start = {
                    x: -(b/k),
                    y: 0
                }
                end = {
                    x: ((h-b)/k),
                    y: h
                }
                console.log('与上边相交')
            }else if(((h - b) / k) >= 0 && ((h - b)/k) <= w){ // 与下边相交
                start = {
                    x: -((h-b)/k),
                    y: h
                }
                end = {
                    x: -(b/k),
                    y: 0
                }
                console.log('与下边相交')
            }
            if(b >= 0 && b <= h){ // 与左边相交
                start = {
                    x: 0,
                    y: b
                }
                end = {
                    x: w,
                    y: k * w + b
                }
                console.log('与左边相交')
            }else if(k * w + b >= 0 && k * w + b <= h){ //与右边相交
                start = {
                    x: k * w + b,
                    y: b
                }
                end = {
                    x: 0,
                    y: b
                }
                console.log('与右边相交')
            }
        }
        return {start, end}
    }

}
