class Vector { 
    constructor(x, y) {
        this.x1 = x;
        this.y1 = y;
        this.x2 = x;
        this.y2 = y;
        this.aa = Math.PI - 0.3;  // Arrow angle
    }
    
    get length() {
        return Math.sqrt(Math.pow((this.x2 - this.x1), 2) + 
                         Math.pow((this.y2 - this.y1), 2));
    }

    get angle() {
        return Math.atan2(this.y2 - this.y1, this.x2 - this.x1);
    }

    draw(ctx, rgb) {
        ctx.beginPath();
        ctx.strokeStyle = rgb;
        ctx.fillStyle   = rgb;
        ctx.lineWidth   = 3;
        ctx.arc(this.x1, this.y1, 2, 0, 2 * Math.PI, false);
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.moveTo(this.x2 + Math.cos(-this.aa - this.angle) * this.length / 10,
                  this.y2 - Math.sin(-this.aa - this.angle) * this.length / 10);
        ctx.lineTo(this.x2, this.y2);
        ctx.moveTo(this.x2 + Math.cos(this.aa - this.angle) * this.length / 10,
                  this.y2 - Math.sin(this.aa - this.angle) * this.length / 10);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
    }
}
