action_type = "control points";
sim_on      = 0;
draw_arrows = 1;
vectors     = [];
curves      = [];
accuracy    = 100;
speed_coeff = 5;

function calc_curve(v1, v2) {
    curve = [[v1.x1, v1.y1]];
    for (var t = 0; t < accuracy; t++) {
        var s = t / accuracy;
        var h1 =  2 * Math.pow(s, 3) - 3 * Math.pow(s, 2) + 1;
        var h2 = -2 * Math.pow(s, 3) + 3 * Math.pow(s, 2);
        var h3 =      Math.pow(s, 3) - 2 * Math.pow(s, 2) + s;
        var h4 =      Math.pow(s, 3) -     Math.pow(s, 2);
        var x  = (h1 * v1.x1 + 
                  h2 * v2.x1 + 
                  h3 * (v1.x2 - v1.x1) * speed_coeff + 
                  h4 * (v2.x2 - v2.x1) * speed_coeff);
        var y  = (h1 * v1.y1 + 
                  h2 * v2.y1 + 
                  h3 * (v1.y2 - v1.y1) * speed_coeff + 
                  h4 * (v2.y2 - v2.y1) * speed_coeff);
        curve.push([x, y]);
    }
    curve.push([v2.x1, v2.y1]);
    return curve;
}

function draw_curve(ctx, curve) {
    ctx.beginPath();
    ctx.strokeStyle = "#FFA500";
    ctx.lineWidth   = 2;
    ctx.moveTo(curve[0][0], curve[0][1]);
    for (var i = 1; i < curve.length; i++) {
        ctx.lineTo(curve[i][0], curve[i][1]);
    }
    ctx.stroke();
}
