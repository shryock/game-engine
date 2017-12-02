/**
 * Game engine for CSC481 assignment.
 * Group Members:
 *     Andrew Shryock      (ajshryoc)
 *     Chris Miller        (cjmille7)
 *     Colleen Britt       (cbritt)
 *     John-Michael Caskey (jmcaskey)
 *
 * This is the CollisionSystem module which is used to keep track of collidable
 * objects, providing an interface for querying collision between any two objects.
 * This is done by using a basic implementation of a QuadTree, as discussed in class.
 * On every update, the CollisionSystem object must be cleared, and objects re-inserted
 * into the system.
 *
 * The CollisionSystem object is initialized by giving the width and height of the
 * AABB containing the entire system (i.e. the canvas dimensions). The constructor
 * assumes that the center is at the point (width/2, height/2).
 */
function CollisionSystem(width, height) {

    // Max number of objects that can be contained within a QuadTree node
    var QUADTREE_CAPACITY = 4;

    // Initilize the top-level QuadTree for the CollisionSystem
    this.quadTree = new QuadTree(new AxisAlignedBoundingBox(
        new Point(width / 2, height / 2), new Point(width / 2, height / 2)));

    // Simple definition of a Point, used for defining an AxisAlignedBoundingBox
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * An AxisAlignedBoundingBox (AABB) is a collidable container around any GameObject defined
     * by two Points: center and half.
     *
     * Center is the Point at the center of teh AABB
     * Half is the size of half of the box
     *
     * This means the box has dimensions: center.x - half.x < x < center.x + half.x and
     *                                    center.y - half.y < y < center.y + half.y
     */
    function AxisAlignedBoundingBox(center, half) {
        this.center = center;
        this.half = half;

        // Returns true if the passed in point is contained with this AABB
        this.containsPoint = function(point) {
            return (point.x >= this.center.x - this.half.x &&
                point.y >= this.center.y - this.half.y &&
                point.x < this.center.x + this.half.x &&
                point.y < this.center.y + this.half.y);
        }

        // Returns true if the passed in AABB intersects this AABB
        this.intersects = function(aabb) {
            return (Math.abs(this.center.x - aabb.center.x) * 2 < (this.half.x * 2 + aabb.half.x * 2)) &&
                (Math.abs(this.center.y - aabb.center.y) * 2 < (this.half.y * 2 + aabb.half.y * 2));
        }
    }

    /**
     * A QuadTree is a data structure that maintains the AABB's of all collidable GameObjects.
     * It is recursively defined; once a QuadTree node contains greater than QUADTREE_CAPACITY points,
     * the node is divided into 4 sub-QuadTrees and the points distributed amongst them. A QuadTree
     * is defined by an AABB for the area is contains (i.e. the entire canvas for the top-level node).
     */
    function QuadTree(aabb) {
        this.aabb = aabb;

        this.capacity = QUADTREE_CAPACITY;

        this.points = [];

        // Pointers to potential sub-QuadTree nodes; these will be initialized if capacity is reached
        this.nw = null;
        this.ne = null;
        this.sw = null;
        this.se = null;

        // Inserts a point into the QuadTree, dividing it if needed
        this.insert = function(point) {
            // Check point is witin this node's bounds
            if (!this.aabb.containsPoint(point)) {
                return false;
            }

            // Add this point to the node if it's below capacity
            if (this.points.length < this.capacity) {
                this.points.push(point);
                point.node = this;
                return true;
            } else {

                // Split up the node if it is too crowded
                if (!this.nw) {
                    this.subdivide();
                }

                // Add this point whereever it can
                if (this.nw.insert(point)) {
                    return true;
                }
                if (this.ne.insert(point)) {
                    return true;
                }
                if (this.sw.insert(point)) {
                    return true;
                }
                if (this.se.insert(point)) {
                    return true;
                }
            }

            return false;
        }

        // Initializes subtrees and distributes the points amongst them
        this.subdivide = function() {
            // Initialize new subtrees
            this.nw = new QuadTree(new AxisAlignedBoundingBox(
                new Point(this.aabb.center.x - this.aabb.half.x * 0.5, this.aabb.center.y - this.aabb.half.y * 0.5),
                new Point(this.aabb.half.x * 0.5, this.aabb.half.y * 0.5)));
            this.nw.parent = this;

            this.ne = new QuadTree(new AxisAlignedBoundingBox(
                new Point(this.aabb.center.x + this.aabb.half.x * 0.5, this.aabb.center.y - this.aabb.half.y * 0.5),
                new Point(this.aabb.half.x * 0.5, this.aabb.half.y * 0.5)));
            this.ne.parent = this;

            this.sw = new QuadTree(new AxisAlignedBoundingBox(
                new Point(this.aabb.center.x - this.aabb.half.x * 0.5, this.aabb.center.y + this.aabb.half.y * 0.5),
                new Point(this.aabb.half.x * 0.5, this.aabb.half.y * 0.5)));
            this.sw.parent = this;

            this.se = new QuadTree(new AxisAlignedBoundingBox(
                new Point(this.aabb.center.x + this.aabb.half.x * 0.5, this.aabb.center.y + this.aabb.half.y * 0.5),
                new Point(this.aabb.half.x * 0.5, this.aabb.half.y * 0.5)));
            this.se.parent = this;

            // Transfer points from parent to subtrees
            for (var point of this.points) {
                this.nw.insert(point);
                this.ne.insert(point);
                this.sw.insert(point);
                this.se.insert(point);
            }

            // Reinitialize points array and set the capacity to 0 since it is no longer a leaf
            this.points = [];
            this.capacity = 0;
        }

        // Searches the QuadTree for all points within a givin AABB
        this.queryRange = function(aabb, points) {
            // Return if aabb is not within this QuadTree node
            if (!this.aabb.intersects(aabb)) {
                return points;
            }

            // Add all points contained within the passed in aabb that are in the QuadTree node
            for (var point of this.points) {
                if (aabb.containsPoint(point)) {
                    points.push(point);
                }
            }

            // Recursive base case; we have reached the bottom of the QuadTree
            if (!this.nw) {
                return points;
            }

            // Recursively query all sub-QuadTrees for their intersecting points
            points.concat(this.nw.queryRange(aabb, points));
            points.concat(this.ne.queryRange(aabb, points));
            points.concat(this.sw.queryRange(aabb, points));
            points.concat(this.se.queryRange(aabb, points));

            return points;
        }

        // Clear out the QuadTree and all sub-QuadTrees
        this.clear = function() {
            if (this.nw) this.nw.clear();
            if (this.ne) this.ne.clear();
            if (this.sw) this.sw.clear();
            if (this.se) this.se.clear();

            this.points = [];
            this.nw = null;
            this.ne = null;
            this.sw = null;
            this.se = null;
        }
    }

    // Register GameObject with the CollisionSystem by inserting it into the QuadTree.
    this.registerObject = function(gameObject) {
        this.quadTree.insert(new Point(gameObject.sprite.X + gameObject.sprite.width / 2, gameObject.sprite.Y + gameObject.sprite.height / 2));
    }

    // Clears the CollisionSystem's QuadTree
    this.clear = function() {
        this.quadTree.clear();
    }

    /**
     * Interface for the CollisionSystem; returns true if the two GameObjects are colliding.
     * This automatically sets the bounding volume of the GameObject based on the sprite width/height.
     */
    this.checkCollision = function(object1, object2) {
        var pointsInRange = [];
        var aabb = new AxisAlignedBoundingBox(new Point(object1.sprite.X + object1.sprite.width / 2, object1.sprite.Y + object1.sprite.height / 2),
            new Point(object1.sprite.width / 2, object1.sprite.height / 2));
        var center2 = new Point(object2.sprite.X + object2.sprite.width / 2, object2.sprite.Y + object2.sprite.height / 2);

        this.quadTree.queryRange(aabb, pointsInRange);

        for (var point of pointsInRange) {
            if (aabb.containsPoint(center2)) {
                return true;
            }
        }

        return false;
    }
}