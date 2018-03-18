function calc_curve(v1, v2) {
    curve = [];

    // Some magic formula for smoother speed
    // on curves of different length.
    var len = v1.dist(v2);
    var steps = Math.sqrt(len) * curve_accuracy;
    for (var t = 0; t < steps - 1; t++) {
        var s = t / steps;
        // Basis functions
        var h1 =  2 * Math.pow(s, 3) - 3 * Math.pow(s, 2) + 1;
        var h2 = -2 * Math.pow(s, 3) + 3 * Math.pow(s, 2);
        var h3 =      Math.pow(s, 3) - 2 * Math.pow(s, 2) + s;
        var h4 =      Math.pow(s, 3) -     Math.pow(s, 2);
        
        // Derivatives of basis functions
        var d1 =  6 * Math.pow(s, 2) - 6 * s;
        var d2 = -6 * Math.pow(s, 2) + 6 * s;
        var d3 =  3 * Math.pow(s, 2) - 4 * s + 1;
        var d4 =  3 * Math.pow(s, 2) - 2 * s;

        // Curve points
        var x  = (h1 * v1.x1 + 
                  h2 * v2.x1 + 
                  h3 * (v1.x2 - v1.x1) * speed_coeff + 
                  h4 * (v2.x2 - v2.x1) * speed_coeff);
        var y  = (h1 * v1.y1 + 
                  h2 * v2.y1 + 
                  h3 * (v1.y2 - v1.y1) * speed_coeff + 
                  h4 * (v2.y2 - v2.y1) * speed_coeff);
        // Tangent points
        var tx = (d1 * v1.x1 + 
                  d2 * v2.x1 + 
                  d3 * (v1.x2 - v1.x1) * speed_coeff + 
                  d4 * (v2.x2 - v2.x1) * speed_coeff);
        var ty = (d1 * v1.y1 + 
                  d2 * v2.y1 + 
                  d3 * (v1.y2 - v1.y1) * speed_coeff + 
                  d4 * (v2.y2 - v2.y1) * speed_coeff);
        curve.push([x, y, tx, ty]);
    }
    curve.push([v2.x1, v2.y1, v2.x2 - v2.x1, v2.y2 - v2.y1]);
    return curve;
}

function draw_tangents() {
    var v = new Vector(0, 0);
    for (var i = 0; i < curves.length; i++) {
        for (var j = 0; j < curves[i].length; j++) {
            v.x1 = curves[i][j][0];
            v.y1 = curves[i][j][1];
            v.x2 = v.x1 + curves[i][j][2];
            v.y2 = v.y1 + curves[i][j][3];
            v.length = 50;
            v.draw(draw_ctx);
        }
    }
}

function draw_curve(ctx, curve) {
    ctx.beginPath();
    ctx.strokeStyle = "#FFA500";
    ctx.lineWidth   = 3;
    ctx.moveTo(curve[0][0], curve[0][1]);
    for (var i = 1; i < curve.length; i++) {
        ctx.lineTo(curve[i][0], curve[i][1]);
    }
    ctx.stroke();
}

function reset_path() {
    // Clearing canvases
    path_ctx.clearRect(0, 0, path_canvas.width, path_canvas.height);
    vecs_ctx.clearRect(0, 0, vecs_canvas.width, vecs_canvas.height);

    // Redrawing vectors
    vectors[0].draw(vecs_ctx, "green")
    for (var i = 1; i < vectors.length; i++) {
        vectors[i].draw(vecs_ctx, "grey");
    }
    vectors[vectors.length - 1].draw(vecs_ctx, "red");

    // Recalculating and redrawing curves
    curves = [];
    for (var i = 1; i < vectors.length; i++) {
        var curve = calc_curve(vectors[i - 1], vectors[i]);
        curves.push(curve);
        draw_curve(path_ctx, curve);
    }
}

robot = new Robot();
function sim() {
    if (sim_on) {
        robot.step();
        robot.draw();
        setTimeout(sim, 1000 / robot_speed);
    }
}
