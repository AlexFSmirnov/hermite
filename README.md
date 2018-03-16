# Hermite curves
## Overview
Hermite curves are very easy to calculate but also very powerful. They are used to smoothly interpolate between key-points (like object movement in keyframe animation or camera control). Understanding the mathematical background of hermite curves will help you to understand the entire family of splines. Maybe you have some experience with 3D programming and have already used them without knowing that (the so called kb-splines, curves with control over tension, continuity and bias are just a special form of the hermite curves).
> Read more [here](http://www.cubic.org/docs/hermite.htm)


## Application
Sometimes Hermite curves can be used for path planning in robotics. This makes sence because if you set some *control points* you want your robot to visit, as a result you will get a smooth path without sharp corners going through all of them. Moreover, you can set the desired speeds at those points, and the curve will be constructed in such a way so that your robot will have enough space to speed up or down.


## Simulator
[This simulator](https://alexfsmirnov.github.io/hermite) will show the capabilities of Hermite curves. Here you can select the control points, create obstacles and even run a little robot with an obstacle avoidance sensor to follow you path.

#### Creating the path
To add a control point, simply draw a vector on the screen. Here the control point is the tail of the vector, and the direction and length represent the speed.
![drawing](/pictures/drawing.gif)
If you don't want to see the vectors themselves, you can always turn them off and keep only the control points.
![vectors_hide](/pictures/vectors_hide.gif)

#### Adding obstacles
To create an obstacle you need to switch to the corresponding mode and draw a rectangle.
![drawing_obstacle](/pictures/drawing_obstacle.gif)
If you don't like the position of your obstacle, you can move it (*to move an obstacle you have to be in "Obstacles" mode!*)
![moving_obstacle](/pictures/moving_obstacle.gif)

#### Running the simulation
Now, to run the simulation, press the "Start simulation" button. A small robot will appear at the beginning of your path and will try to go to the end. It will avoid obstacles by adding new control points and adjusting the path.
![simulation](/pictures/simulation.gif)

#### A few notes
- You can't run the simulation until you have drawn at least two vectors.
- You can pause the simulation at any time.
- You can create sharp turns by clicking once, i.e. by creating a zero-length vector.
- You can add new points or obstacles even when the simulation is running.
- You can also move obstacles during the simulation, but it may result in unexpected behavior.
