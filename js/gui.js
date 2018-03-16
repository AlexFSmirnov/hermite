/* MOUSE AND SELECTION */
mouse_down = false;
function get_mouse_pos(canvas, evt) {
    if (evt.type.startsWith("touch")) {
        if (evt.touches.length != 0) {
            var client_x = evt.touches[0].clientX;
            var client_y = evt.touches[0].clientY;
        } else {
            var client_x = evt.changedTouches[0].clientX;
            var client_y = evt.changedTouches[0].clientY;
        }
    } else {
        var client_x = evt.clientX;
        var client_y = evt.clientY;
    }
    
    var rect   = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;

    return {
        x: (client_x - rect.left) * scaleX,   
        y: (client_y - rect.top) * scaleY    
    }
}

function on_mouse_down(canvas, event) {
    mouse_down = true;
    var mouse_pos = get_mouse_pos(canvas, event);
    if (action_type == "control points") {
        // Marking the first vector as Start point,
        if (vectors.length > 0) 
            vectors[0].draw(vecs_ctx, "green");
        // all the previous ones as intermediate points 
        for (var i = 1; i < vectors.length; i++) 
            vectors[i].draw(vecs_ctx, "grey");
        // and pushing the new vector
        vectors.push(new Vector(mouse_pos.x, mouse_pos.y));
    }
}

function on_mouse_up(canvas, event) {
    test = event;
    mouse_down = false;
    var mouse_pos = get_mouse_pos(canvas, event);
    if (action_type == "control points") {
        // Marking the last vector as Finish point
        vectors[vectors.length - 1].draw_arrow = draw_arrows;
        vectors[vectors.length - 1].draw(vecs_ctx, "red");
        
        // Drawing and saving the curve if any 
        if (vectors.length > 1) {
            var curve = calc_curve(vectors[vectors.length - 2],
                                   vectors[vectors.length - 1]);
            curves.push(curve);
            draw_curve(path_ctx, curve);
        }

        // Clearing the "Draw canvas"
        draw_ctx.clearRect(0, 0, draw_canvas.width, draw_canvas.height);
    }
}

function on_mouse_move(canvas, event) {
    if (mouse_down) {
        var mouse_pos = get_mouse_pos(canvas, event);
        if (action_type == "control points") {
            // Clearing the "Draw canvas"
            draw_ctx.clearRect(0, 0, draw_canvas.width, draw_canvas.height);
            
            // Updating the last vector
            vectors[vectors.length - 1].x2 = mouse_pos.x;
            vectors[vectors.length - 1].y2 = mouse_pos.y;

            // Drawing the curve if any
            if (vectors.length > 1) {
                var curve = calc_curve(vectors[vectors.length - 2],
                                       vectors[vectors.length - 1]);
                draw_curve(draw_ctx, curve);
            }

            // And drawing the vector
            vectors[vectors.length - 1].draw(draw_ctx, "grey");
        }
    }
}
/* (END) MOUSE AND SELECTION (END) */


/* DISPLAY AND SETUP */
function on_switch() {
    var checkbox  = document.getElementById("checkbox");
    var obstacles = document.getElementById("obstacles");
    var cpoints   = document.getElementById("cpoints");
    if (checkbox.checked) {  // Switch to obstacles
        action_type = 1;
        obstacles.classList.value = "btn obstacles selected"
        cpoints  .classList.value = "btn points"
    } else {                 // Switch to control points
        action_type = 0;
        obstacles.classList.value = "btn obstacles"
        cpoints  .classList.value = "btn points selected"
    }
}
function on_click(btn) {
    var checkbox  = document.getElementById("checkbox");
    var obstacles = document.getElementById("obstacles");
    var cpoints   = document.getElementById("cpoints");
    if (btn == 0) {  // "Control points" pressed
        checkbox.checked = false;
        obstacles.classList.value = "btn obstacles"
        cpoints  .classList.value = "btn points selected"
    } else {         // "Obstacles" pressed
        checkbox.checked = true;
        obstacles.classList.value = "btn obstacles selected"
        cpoints  .classList.value = "btn points"
    }
}
function sim_toggle() {
    var btn = document.getElementById('play');
    if (sim_on) {
        sim_on = false;
        btn.innerHTML = "Start simulation";
    } else if (vectors.length >= 2) {
        sim_on = true;
        btn.innerHTML = "Pause simulation";
        sim();
    }
}
function vectors_toggle() {
    var btn = document.getElementById('vectors');
    if (draw_arrows) {
        draw_arrows = false;
        btn.innerHTML = "Vectors hidden";
        btn.classList.value = "btn";

        vecs_ctx.clearRect(0, 0, vecs_canvas.width, vecs_canvas.height);
        for (var i = 0; i < vectors.length; i++) {
            vectors[i].draw_arrow = false;
        }
    } else {
        draw_arrows = true;
        btn.innerHTML = "Vectors visible";
        btn.classList.value = "btn selected";

        vecs_ctx.clearRect(0, 0, vecs_canvas.width, vecs_canvas.height);
        for (var i = 0; i < vectors.length; i++) {
            vectors[i].draw_arrow = true;
        }
    }
    vectors[0].draw(vecs_ctx, "green");
    for (var i = 1; i < vectors.length - 1; i++) {
        vectors[i].draw(vecs_ctx, "grey");
    }
    vectors[vectors.length - 1].draw(vecs_ctx, "red");
}

function adjust_window() {
    var c_w = document.documentElement.clientWidth;
    var c_h = document.documentElement.clientHeight;
    c_w -= (c_h * 0.04);
    c_h -= (c_h * 0.08 + 6);
    if (c_w / c_h > path_canvas.width / path_canvas.height) {
        var style = "height: " + c_h + "px; ";
    } else {
        var style = "width: " + c_w + "px; ";
    }
    document.getElementById('path-canvas').style      = style + "z-index: 0;";
    document.getElementById('vectors-canvas').style   = style + "z-index: 1;";
    document.getElementById('robot-canvas').style     = style + "z-index: 2;";
    document.getElementById('obstacles-canvas').style = style + "z-index: 3;";
    document.getElementById('draw-canvas').style      = style + "z-index: 4;";
    document.getElementById('switch').style.width     = (c_h * 0.04) * 2 + "px";
}

function setup() {
    is_loaded = true;
    document.body.style.backgroundColor = BACKGROUND_COLOR;
    window.onresize = function(event) {adjust_window();};

    path_canvas = document.getElementById('path-canvas');
    path_ctx    = path_canvas.getContext('2d');
    vecs_canvas = document.getElementById('vectors-canvas');
    vecs_ctx    = vecs_canvas.getContext('2d');
    robo_canvas = document.getElementById('robot-canvas');
    robo_ctx    = robo_canvas.getContext('2d');
    obst_canvas = document.getElementById('obstacles-canvas');
    obst_ctx    = obst_canvas.getContext('2d');
    draw_canvas = document.getElementById('draw-canvas');
    draw_ctx    = draw_canvas.getContext('2d');

    var client_w = document.documentElement.clientWidth;
    var client_h = document.documentElement.clientHeight;
    client_w -= (client_h * 0.04);
    client_h -= (client_h * 0.08 + 6);
    path_canvas.width  = client_w;
    path_canvas.height = client_h;
    vecs_canvas.width  = client_w;
    vecs_canvas.height = client_h;
    robo_canvas.width  = client_w;
    robo_canvas.height = client_h;
    obst_canvas.width  = client_w;
    obst_canvas.height = client_h;
    draw_canvas.width  = client_w;
    draw_canvas.height = client_h;

    // General
    document.getElementById('cpoints').addEventListener('click',
        function(event) {on_click(0)});
    document.getElementById('obstacles').addEventListener('click',
        function(event) {on_click(1)});
    // Touchscreen
    draw_canvas.addEventListener('touchstart', 
        function(event) {on_mouse_down(vecs_canvas, event)});
    draw_canvas.addEventListener('touchmove',
        function(event) {on_mouse_move(vecs_canvas, event)});
    draw_canvas.addEventListener('touchend',
        function(event) {on_mouse_up(vecs_canvas, event)});
    // Mouse
    draw_canvas.addEventListener('mousedown', 
        function(event) {on_mouse_down(vecs_canvas, event)});
    draw_canvas.addEventListener('mousemove',
        function(event) {on_mouse_move(vecs_canvas, event)});
    draw_canvas.addEventListener('mouseup',
        function(event) {on_mouse_up(vecs_canvas, event)});

    adjust_window();
}
/* (END) DISPLAY AND SETUP (END) */

