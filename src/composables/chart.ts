export enum ChartStyle {
    TrendLine = 0
}

const barWidth = 2;
const barSpacing = 4;

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

export class Chart {
    element: HTMLCanvasElement;
    style: ChartStyle
    ctx: CanvasRenderingContext2D
    data: number[]
    w: number
    h: number

    constructor(id: string, style: ChartStyle, data: number[]) {
        this.element = document.getElementById(id) as HTMLCanvasElement || {} as HTMLCanvasElement
        this.style = style
        this.data = data
        this.ctx = this.element.getContext("2d") || {} as CanvasRenderingContext2D
        this.w = this.ctx.canvas.width
        this.h = this.ctx.canvas.height
        // this.ctx.scale(0.5, 0.5)

        this.draw()
    }

    draw() {
        let ctx = this.ctx

        let w = this.w
        let h = this.h

        ctx.clearRect(0, 0, w, h);
        ctx.beginPath();
        ctx.lineWidth = 4
        ctx.lineJoin = "round"
        ctx.strokeStyle = "rgba(32, 107,196, 1)"
        ctx.fillStyle = "rgba(32, 107,196, 0.2)"

        // ctx.strokeStyle = "rgba(255,255,255,0.25)";

        let minY = Math.min(...this.data);
        let maxY = Math.max(...this.data);

        let getX = (index: number): number => {
            return index * (w / this.data.length);
        }

        let getY = (index: number): number => {
            return h - (this.data[index] - minY) / (maxY - minY) * h/2;
        }

        ctx.moveTo(getX(0), getY(0));

        let i;
        for (i = 1; i < this.data.length - 2; i++) {

            let x = getX(i);
            let y = getY(i);

            let xc = (x + getX(i + 1)) / 2;
            let yc = (y + getY(i + 1)) / 2;

            ctx.quadraticCurveTo(x, y, xc, yc)
        }

        ctx.quadraticCurveTo(getX(i), getY(i), getX(i+1), getY(i+1))
        ctx.lineTo(getX(i+1), h)
        ctx.lineTo(0, h)

        ctx.stroke();
        ctx.closePath()
        ctx.fill();

    }

}
