class Vector { 
    constructor(x, y) {
        this.x1 = x;
        this.y1 = y;
        this.x2 = x;
        this.y2 = y;
        this.aa = Math.PI - 0.3;  // Arrow angle
        this.draw_arrow = true;
        
        // Was this vector created while avoiding obstacle?
        this.obst = false;
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
        this.next_vector = 0;
        this.x = 0;
        this.y = 0;
        this.a = 0;

        // Was this vector added while trying to avoid obstacles?
        this.obst = false;  
    }

    get_sight_points() {
        var points = [];
        for (var i = 0; i < robot_sight.accuracy; i++) {
            var a = robot_sight.angle / (robot_sight.accuracy - 1) * i;
            a = a - robot_sight.angle / 2 + this.a;
            points.push({x: this.x + robot_sight.radius * Math.cos(a),
                         y: this.y + robot_sight.radius * Math.sin(a),
                         a: a});
        }
        return points;
    }
    get_collision() {
        for (var i = 0; i < obstacles.length; i++) {
            var o = obstacles[i];
            var points = this.get_sight_points();
            for (var j = 0; j < points.length; j++) {
                if (o.is_in(points[j].x, points[j].y)) {
                    return [points[j], Boolean(j > points.length / 2)];
                }
            }

        }
        return null;
    }

    step() {
        var res = this.get_collision();
        // If collision found, trying to avoid
        if (res) {
            var col  = res[0];
            var side = res[1];

            // Calculating angle for avoiding the obstacle
            if (side) {
                var a = col.a - (robot_sight.angle / 2 + 0.2);
            } else {
                var a = col.a + (robot_sight.angle / 2 + 0.2);
            }

            // Calculating new intermediate vector coordinates
            var x1 = (this.x   + robot_sight.radius * Math.cos(a));
            var y1 = (this.y   + robot_sight.radius * Math.sin(a));
            var x2 = (x1 + 0.3 * robot_sight.radius * Math.cos(a));
            var y2 = (y1 + 0.3 * robot_sight.radius * Math.sin(a));

            var v1  = new Vector(x1, y1);
            v1.x2   = x2;
            v1.y2   = y2;
            v1.obst = true;

            // Updating the next vector if it was the one previously 
            // added while trying to avoid obstacles or adding the
            // new vector before the next one otherwise
            if (vectors[this.next_vector].obst) {
                vectors[this.next_vector] = v1;
            } else {
                vectors.splice(this.next_vector, 0, v1);
            }

            // And recalculating and redrawing all curves
            reset_path();
        }
        this.curve_point = (this.curve_point + 1) % (curves.length * curve_accuracy);
        this.next_vector = Math.floor(this.curve_point / curve_accuracy) + 1;
    }

    draw() {
        var seg = curves[(Math.floor(this.curve_point / curve_accuracy))];
        var [x, y, tx, ty] = seg[this.curve_point % curve_accuracy];
        var a = Math.atan2(tx, ty);
        [this.x, this.y, this.a] = [x, y, a];

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
                     -Math.PI / 2 - robot_sight.angle / 2,
                     -Math.PI / 2 + robot_sight.angle / 2);

        robo_ctx.stroke();
        robo_ctx.restore();
    }
}

class Obstacle {
    constructor(x, y) {
        this._x1 = x;
        this._y1 = y;
        this._x2 = x;
        this._y2 = y;
    }

    get width() {
        return Math.abs(this.x2 - this.x1);
    }
    get height() {
        return Math.abs(this.y2 - this.y1);
    }
    get x1() {
        return Math.min(this._x1, this._x2);
    }
    get x2() {
        return Math.max(this._x1, this._x2);
    }
    get y1() {
        return Math.min(this._y1, this._y2);
    }
    get y2() {
        return Math.max(this._y1, this._y2);
    }
    set_ends(x2, y2) {
        this._x2 = x2;
        this._y2 = y2;
    }
    move([init_x, init_y], new_x, new_y) {
        this._x1 += new_x - init_x;
        this._y1 += new_y - init_y;
        this._x2 += new_x - init_x;
        this._y2 += new_y - init_y;
    }

    is_in(x, y) {
        return (this.x1 <= x && x <= this.x2 &&
                this.y1 <= y && y <= this.y2);
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle   = "grey";
        ctx.strokeStyle = "cyan";
        ctx.lineWidth   = 3;
        ctx.fillRect(this.x1, this.y1, this.width, this.height);
        ctx.strokeRect(this.x1, this.y1, this.width, this.height);
        ctx.stroke();
    }
    clear(ctx) {
        ctx.clearRect(this.x1-3, this.y1-3, this.width+6, this.height+6);
    }
}
