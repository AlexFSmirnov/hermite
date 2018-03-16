/* MOUSE AND SELECTION */
mouse_down = false;
function get_mouse_pos(canvas, evt) {
    if (evt.type.startsWith("touch")) {
        var client_x = evt.touches[0].clientX;
        var client_y = evt.touches[0].clientY;
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
            vectors[0].draw(ent_ctx, "green");
        // all the previous ones as intermediate points 
        for (var i = 1; i < vectors.length; i++) 
            vectors[i].draw(ent_ctx, "grey");
        // and pushing the new vector
        vectors.push(new Vector(mouse_pos.x, mouse_pos.y));
    }
}

function on_mouse_up(canvas, event) {
    mouse_down = false;
    var mouse_pos = get_mouse_pos(canvas, event);
    if (action_type == "control points") {
        // Marking the last vector as Finish point
        vectors[vectors.length - 1].draw(draw_ctx, "red");
        
        // Drawing and saving the curve if any 
        if (vectors.length > 1) {
            var curve = calc_curve(vectors[vectors.length - 2],
                                   vectors[vectors.length - 1]);
            curves.push(curve);
            draw_curve(path_ctx, curve);
        }
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
        btn.innerHTML = "Start simulation";
    }
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
    document.getElementById('path-canvas').style     = style + "z-index: 3;";
    document.getElementById('entities-canvas').style = style + "z-index: 2;";
    document.getElementById('draw-canvas').style     = style + "z-index: 1;";
    document.getElementById('switch').style.width    = (c_h * 0.04) * 2 + "px";
}

function setup() {
    is_loaded = true;
    document.body.style.backgroundColor = BACKGROUND_COLOR;
    window.onresize = function(event) {adjust_window();};

    draw_canvas = document.getElementById('draw-canvas');
    draw_ctx    = draw_canvas.getContext('2d');
    path_canvas = document.getElementById('path-canvas');
    path_ctx    = path_canvas.getContext('2d');
    ent_canvas  = document.getElementById('entities-canvas');
    ent_ctx     = ent_canvas.getContext('2d');

    var client_w = document.documentElement.clientWidth;
    var client_h = document.documentElement.clientHeight;
    client_w -= (client_h * 0.04);
    client_h -= (client_h * 0.08 + 6);
    draw_canvas.width  = client_w;
    draw_canvas.height = client_h;
    path_canvas.width  = client_w;
    path_canvas.height = client_h;
    ent_canvas.width   = client_w;
    draw_canvas.width  = client_w;
    draw_canvas.height = client_h;
    ent_canvas.height  = client_h;

    // General
    document.getElementById('cpoints').addEventListener('click',
        function(event) {on_click(0)});
    document.getElementById('obstacles').addEventListener('click',
        function(event) {on_click(1)});
    // Touchscreen
    path_canvas.addEventListener('touchstart', 
        function(event) {on_mouse_down(ent_canvas, event)});
    path_canvas.addEventListener('touchmove',
        function(event) {on_mouse_move(ent_canvas, event)});
    path_canvas.addEventListener('touchend',
        function(event) {on_mouse_up(ent_canvas, event)});
    // Mouse
    path_canvas.addEventListener('mousedown', 
        function(event) {on_mouse_down(ent_canvas, event)});
    path_canvas.addEventListener('mousemove',
        function(event) {on_mouse_move(ent_canvas, event)});
    path_canvas.addEventListener('mouseup',
        function(event) {on_mouse_up(ent_canvas, event)});

    adjust_window();
}
/* (END) DISPLAY AND SETUP (END) */

