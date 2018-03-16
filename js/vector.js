class Vector { 
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
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
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.lineTo(this.x2 + Math.cos(-this.aa - this.angle) * this.length / 10,
                  this.y2 - Math.sin(-this.aa - this.angle) * this.length / 10);
        ctx.moveTo(this.x2, this.y2);
        ctx.lineTo(this.x2 + Math.cos(this.aa - this.angle) * this.length / 10,
                  this.y2 - Math.sin(this.aa - this.angle) * this.length / 10);
        ctx.stroke();
    }
}
