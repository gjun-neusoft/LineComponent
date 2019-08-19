import Line from './Line_component'
import Point from './Point_component'
let lock = true;
let stemp = Date.now();
let n = 0;
const hLineDragEvents = {
    onStart: (data) => {
        const _this = data._this;
        _this.store.dis_x = 0;
        _this.store.dis_y = 0;
        vLine.store.dis_x = 0;
        vLine.store.dis_y = 0

    },
    onMove: (data) => {
        const _this = data._this;
        if(lock){
            // _this.lockX = false;
            setTimeout(()=>{
                vLine.store.dis_x = _this.store.dis_x;
                vLine.store.dis_y = _this.store.dis_y;
            })
        }
    },
    onEnd: (data) => {
        if(lock){
            setTimeout(()=>{
                hLine.lockX = true;
                vLine.store.x1 += hLine.store.dis_x;
                vLine.store.x2 += hLine.store.dis_x;
                vLine.store.cx += vLine.store.dis_x;
                vLine.store.cy += vLine.store.dis_y;
            })
        }
    }
}
const vLineDragEvents = {
    onStart: (data) => {
        const _this = data._this;
        _this.store.dis_x = 0;
        _this.store.dis_y = 0;
        hLine.store.dis_x = 0;
        hLine.store.dis_y = 0;
    },
    onMove: (data) => {
        const _this = data._this;
        if(lock){
            // _this.lockY = false;

            setTimeout(()=>{
                hLine.store.dis_x = _this.store.dis_x;
                hLine.store.dis_y = _this.store.dis_y;
            })
        }
    },
    onEnd: () => {
        if(lock){
            setTimeout(()=>{
                vLine.lockY = true;
                hLine.store.y1 += vLine.store.dis_y;
                hLine.store.y2 += vLine.store.dis_y;
                hLine.store.cx += hLine.store.dis_x;
                hLine.store.cy += hLine.store.dis_y;
            })
        }
    }
}
const hCenterDragEvents = {
    onMove: (data)=>{
        console.log('cbcenterdrag     move')
        if(lock){
            console.log('lock')
            vLine.store.dis_x = data.dis_x;
            vLine.store.dis_y = data.dis_y;
        }
    },
    onStart: (data)=>{
        console.log('cbcenterdrag     start')
        vLine.store.dis_x = 0;
        vLine.store.dis_y = 0;
        hLine.store.dis_x = 0;
        hLine.store.dis_y = 0;
    },
    onEnd: (data)=>{
        console.log('cbcenterdrag     end')
        if(lock){
            setTimeout(()=>{
                hLine.lockX = true;
                vLine.store.x1 += hLine.store.dis_x;
                vLine.store.x2 += hLine.store.dis_x;
                
                vLine.store.cx += vLine.store.dis_x;
                vLine.store.cy += vLine.store.dis_y;
            })
            
        }

    }
}
const vCenterDragEvents = {
    onMove: (data)=>{
        console.log('cbcenterdrag     move')
        const _this = data._this;
        if(lock){
            // _this.lockY = false;

            setTimeout(()=>{
                hLine.store.dis_x = _this.store.dis_x;
                hLine.store.dis_y = _this.store.dis_y;
            })
        }
    },
    onStart: (data)=>{
        console.log('cbcenterdrag     start')
        const _this = data._this;
        _this.store.dis_x = 0;
        _this.store.dis_y = 0;
        hLine.store.dis_x = 0;
        hLine.store.dis_y = 0
        
    },
    onEnd: (data)=>{
        console.log('cbcenterdrag     end')
        if(lock){
            setTimeout(()=>{
                vLine.lockY = true;
                hLine.store.y1 += vLine.store.dis_y;
                hLine.store.y2 += vLine.store.dis_y;
                hLine.store.cx += hLine.store.dis_x;
                hLine.store.cy += hLine.store.dis_y;
            })
        }
    }
}
const opts1 = {
    svg: '#Svg',
    x1: 0,
    y1: $('#Svg').outerHeight()/2,
    x2: $('#Svg').outerWidth(),
    y2: $('#Svg').outerHeight()/2,
    cx: $('#Svg').outerWidth()/2,
    cy: $('#Svg').outerHeight()/2,
    stroke: 'blue',
    strokeWidth: 1,
    break_size: 50,
    lockX: true,
    
    cbDrag: [
        hLineDragEvents.onMove,
        hLineDragEvents.onStart,
        hLineDragEvents.onEnd
    ],
    cbCenterDrag: [
        hCenterDragEvents.onMove,
        hCenterDragEvents.onStart,
        hCenterDragEvents.onEnd
    ]
}
const opts2 = {
    svg: '#Svg',
    x1: $('#Svg').outerWidth()/2,
    y1: 0,
    x2: $('#Svg').outerWidth()/2,
    y2: $('#Svg').outerHeight(),
    cx: $('#Svg').outerWidth()/2,
    cy: $('#Svg').outerHeight()/2,
    stroke: 'green',
    strokeWidth: 1,
    break_size: 50,
    lockY: true,
    cbDrag: [
        vLineDragEvents.onMove,
        vLineDragEvents.onStart,
        vLineDragEvents.onEnd
    ],
    cbCenterDrag: [
        vCenterDragEvents.onMove,
        vCenterDragEvents.onStart,
        vCenterDragEvents.onEnd
    ]
}


const hLine = new Line(opts1);
hLine.init();

const vLine = new Line(opts2);
vLine.init();

const p1 = {
    x: hLine.x1 + 50,
    y: hLine.y1,
    r: 10,
    cbDrag:[
        function(data){
            const _this = data._this;
            let np = hLine._mathPoint({x: hLine.store.cx, y: hLine.store.cy}, {x: _this.x+_this.dis_x, y: _this.y+_this.dis_y});
            let angle = hLine.angle({x: hLine.store.cx, y: hLine.store.cy}, {x: _this.x+_this.dis_x, y: _this.y+_this.dis_y})
            hLine.store.x1 = np.start.x;
            hLine.store.y1 = np.start.y;
            hLine.store.x2 = np.end.x;
            hLine.store.y2 = np.end.y;
            hLine.store.drag_cx = _this.x + _this.dis_x;
            hLine.store.drag_cy = _this.y + _this.dis_y;
            // const xx = hLine.store.cx + 10 * Math.cos(angle * Math.PI/180)
            // const yy = hLine.store.cy + 10 * Math.sin(angle * Math.PI/180)
            // console.log(xx, yy)
        }
    ]

}

const p2 = {
    x: hLine.x2 - 50,
    y: hLine.y2,
    r: 10,
    cbDrag:[
        function(data){
            const _this = data._this;
            let np = hLine._mathPoint({x: hLine.store.cx, y: hLine.store.cy}, {x: _this.x+_this.dis_x, y: _this.y+_this.dis_y});
            hLine.store.x1 = np.start.x;
            hLine.store.y1 = np.start.y;
            hLine.store.x2 = np.end.x;
            hLine.store.y2 = np.end.y;
        }
    ]
}

const p3 = {
    x: vLine.x1,
    y: vLine.y1 + 50,
    r: 10,
    color: 'green',
    cbDrag:[
        function(data){
            const _this = data._this;
            let np = vLine._mathPoint({x: vLine.store.cx, y: vLine.store.cy}, {x: _this.x+_this.dis_x, y: _this.y+_this.dis_y});
            vLine.store.x1 = np.start.x;
            vLine.store.y1 = np.start.y;
            vLine.store.x2 = np.end.x;
            vLine.store.y2 = np.end.y;
        }
    ]
}

const p4 = {
    x: vLine.x2,
    y: vLine.y2 - 50,
    r: 10,
    color: 'green',
    cbDrag:[
        function(data){
            const _this = data._this;
            let np = vLine._mathPoint({x: vLine.store.cx, y: vLine.store.cy}, {x: _this.x+_this.dis_x, y: _this.y+_this.dis_y});
            vLine.store.x1 = np.start.x;
            vLine.store.y1 = np.start.y;
            vLine.store.x2 = np.end.x;
            vLine.store.y2 = np.end.y;
        }
    ]
}

// const point_1 = new Point(p1)
// point_1.init();

// const point_2 = new Point(p2)
// point_2.init();

// const point_3 = new Point(p3)
// point_3.init();

// const point_4 = new Point(p4)
// point_4.init();
$('#reset').click(()=>{
    vLine.reset();
    hLine.reset();
})
$('#btn').click(()=>{
    lock = !lock
})

$('#hidebtnH').click(()=>{
    hLine.hide();
})

$('#hidebtnV').click(()=>{
    vLine.hide();
})
$('#showbtnH').click(()=>{
    hLine.show();
})

$('#showbtnV').click(()=>{
    vLine.show();
})

$('#rotate').click(()=>{
    const point_1 = new Point(p1)
    point_1.init();

    const point_2 = new Point(p2)
    point_2.init();

    const point_3 = new Point(p3)
    point_3.init();

    const point_4 = new Point(p4)
    point_4.init();
})
// Object.defineProperties(this.store, {...observeObj})