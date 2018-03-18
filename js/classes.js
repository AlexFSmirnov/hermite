class Vector { 
    constructor(x, y) {
        this.x1 = x;
        this.y1 = y;
        this.x2 = x;
        this.y2 = y;
        this.aa = Math.PI - 0.3;  // Arrow angle
        this.draw_arrow = true;

        // 0 - normal vector
        // 1 - position and speed saved while trying to avoid obstacle
        // 2 - generated while trying to avoid obstacle
        this.type = 0;
    }
    
    get length() {
        return Math.sqrt(Math.pow((this.x2 - this.x1), 2) + 
                         Math.pow((this.y2 - this.y1), 2));
    }
    set length(c) {
        if (this.length != 0) {
            c = c / this.length;
            this.x2 = (this.x2 - this.x1) * c + this.x1;
            this.y2 = (this.y2 - this.y1) * c + this.y1;
        }
    }

    get angle() {
        return Math.atan2(this.y2 - this.y1, this.x2 - this.x1);
    }


    dist(other) {
        return Math.sqrt(Math.pow(this.x1 - other.x1, 2) +
                         Math.pow(this.y1 - other.y1, 2));
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
        this.curve       = 0;
        this.pos         = 0;
        this.next_vector = 1;
        this.x = 0;
        this.y = 0;
        this.a = 0;
    }

    get_sight_points() {
        var points = [];
        for (var r = 1; r < robot_sight.radius; r += robot_sight.accuracy) {
            var points_rad = []
            for (var i = 0; i < robot_sight.accuracy; i++) {
                var a = robot_sight.angle / (robot_sight.accuracy - 1) * i;
                a = a - robot_sight.angle / 2 + this.a;
                points_rad.push({x: this.x + r * Math.cos(a),
                                 y: this.y + r * Math.sin(a),
                                 a: a});
            }
            points.push(points_rad);
        }
        return points;
    }
    get_collision() {
        for (var i = 0; i < obstacles.length; i++) {
            var o = obstacles[i];
            var all_points = this.get_sight_points();
            for (var r = 0; r < all_points.length; r++) {
                var points = all_points[r];
                for (var j = 0; j < points.length; j++) {
                    if (o.is_in(points[j].x, points[j].y)) {
                        return [points[j], Boolean(j > points.length / 2)];
                    }
                }
            }
        }
        return null;
    }

    step() {
        var res = this.get_collision();
        // If collision found, trying to avoid
        if (res && vectors[this.next_vector].type != 1) {
            var col   = res[0];
            var side  = res[1];

            // Remembering the current position and "speed"
            var v1    = new Vector(this.x, this.y);
            v1.x2     = v1.x1 + curves[this.curve][this.pos][2];
            v1.y2     = v1.y1 + curves[this.curve][this.pos][3];
            v1.type   = 1;
            v1.length = robot_sight.radius / 5;
            v1.draw_arrow = draw_arrows;

            if (vectors[this.next_vector - 1].type == 1) {
                vectors[this.next_vector - 1] = v1;
                this.pos = 0;
            } else {
                vectors.splice(this.next_vector, 0, v1);
                this.next_vector += 1;
                this.curve += 1;
                this.pos = 0;
            }

            // Calculating angle for avoiding the obstacle
            if (side) {
                var a = col.a - (robot_sight.angle / 2 + 0.2);
            } else {
                var a = col.a + (robot_sight.angle / 2 + 0.2);
            }

            // Calculating new intermediate vector coordinates
            var x1    = (this.x   + robot_sight.radius * Math.cos(a));
            var y1    = (this.y   + robot_sight.radius * Math.sin(a));
            var x2    = (x1 + 0.2 * robot_sight.radius * Math.cos(this.a));
            var y2    = (y1 + 0.2 * robot_sight.radius * Math.sin(this.a));

            var v2    = new Vector(x1, y1);
            v2.x2     = x2;
            v2.y2     = y2;
            v2.type   = 2;
            v2.draw_arrow = draw_arrows;
            
            // Updating the next vector if it was the one previously 
            // added while trying to avoid obstacles or adding the
            // new vector before the next one otherwise
            if (vectors[this.next_vector].type == 2) {
                vectors[this.next_vector] = v2;
            } else {
                vectors.splice(this.next_vector, 0, v2);
            }

            // And recalculating and redrawing all curves
            reset_path();
        }
        if (this.pos == curves[this.curve].length - 1) {
            this.curve = (this.curve + 1) % curves.length;
            this.next_vector = this.curve + 1;
            this.pos = 0;

            // After finishing the cycle
            if (this.curve == 0) {
                // Clearing the real path canvas
                real_ctx.clearRect(0, 0, real_canvas.width, real_canvas.height);

                // Removing all unneeded vectors
                var new_vectors = [];
                for (var i = 0; i < vectors.length - 1; i++) {
                    if (!(vectors[i].type == 2 && vectors[i + 1].type == 1)) {
                        new_vectors.push(vectors[i]);
                    }
                }
                new_vectors.push(vectors[vectors.length - 1]);
                vectors = new_vectors;

                // Redrawing re-calculated path
                reset_path();
            }
        } else {
            this.pos += 1;
        }
    }

    draw() {
        var [x, y, tx, ty] = curves[this.curve][this.pos];
        var a = Math.atan2(ty, tx);
        [this.x, this.y, this.a] = [x, y, a];

        real_ctx.beginPath();
        real_ctx.strokeStyle = "cyan";
        real_ctx.lineWidth   = 2;
        real_ctx.arc(this.x, this.y, 1, 0, Math.PI * 2);
        real_ctx.stroke();

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
