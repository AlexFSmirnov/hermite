class Vector { 
    constructor(x, y) {
        this.x1 = x;
        this.y1 = y;
        this.x2 = x;
        this.y2 = y;
        this.aa = Math.PI - 0.3;  // Arrow angle
        this.draw_arrow = true;
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
        ctx.lineWidth   = 2;
        ctx.arc(this.x1, this.y1, 2, 0, 2 * Math.PI, false);
        ctx.fill();
        if (this.draw_arrow) {
            ctx.moveTo(this.x1, this.y1);
            ctx.lineTo(this.x2, this.y2);
            ctx.moveTo(this.x2 + Math.cos(-this.aa - this.angle) * this.length / 10,
                      this.y2 - Math.sin(-this.aa - this.angle) * this.length / 10);
            ctx.lineTo(this.x2, this.y2);
            ctx.moveTo(this.x2 + Math.cos(this.aa - this.angle) * this.length / 10,
                      this.y2 - Math.sin(this.aa - this.angle) * this.length / 10);
            ctx.lineTo(this.x2, this.y2);
        }
        ctx.stroke();
    }
}

class Robot {
    constructor() {
        this.curve_point = 0;
    }

    step() {
        this.curve_point = (this.curve_point + 1) % (curves.length * curve_accuracy);
    }

    draw() {
        var seg = curves[(Math.floor(this.curve_point / curve_accuracy))];
        var [x, y, a] = seg[this.curve_point % curve_accuracy];
        robo_ctx.clearRect(0, 0, robo_canvas.width, robo_canvas.height);
        robo_ctx.save();
        robo_ctx.translate(x, y);
        robo_ctx.rotate(a + Math.PI / 2);

        robo_ctx.beginPath();

        robo_ctx.strokeStyle = "grey";
        robo_ctx.lineWidth   = 3;
        robo_ctx.strokeRect(-20, -15, 10, 30);
        robo_ctx.strokeRect(-10, -10, 20, 20);
        robo_ctx.strokeRect( 10, -15, 10, 30);

        robo_ctx.strokeStyle = "cyan";
        robo_ctx.lineWidth   = 2;
        robo_ctx.arc(0, 0, robot_sight.radius, 
                     -Math.PI / 2 - (robot_sight.angle / 180 * Math.PI) / 2,
                     -Math.PI / 2 + (robot_sight.angle / 180 * Math.PI) / 2);

        robo_ctx.stroke();
        robo_ctx.restore();
    }
}
