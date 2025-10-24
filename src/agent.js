module.exports = (function () {
    "use strict";

    var THREE = require("three");

    /**
     * Constructs a new Agent
     * @constructor
     * @alias Agent
     *
     * @param {Node} startNode - The node where the agent starts
     * @param {Object} props - Object containing optional properties of the Agent
     * @param {Number|String} props.color - Hexadecimal or CSS-style string representation of a color; defaults to 'yellow'
     * @param {Number} props.size - Size of the agent marker; defaults to 20
     * @param {String} props.shape - Shape of the agent ('sphere', 'cube', 'cone'); defaults to 'sphere'
     * @param {Object} props.data - Custom data attached to the agent
     */
    var Agent = function (startNode, props) {
        this._currentNode = startNode;
        this._targetNode = null;
        this._progress = 0;
        this._speed = 1;
        this._active = true;
        this._initProps(props);
    };

    Agent.prototype._initProps = function (properties) {
        properties = properties || {};

        var color = properties.color !== undefined ? properties.color : "yellow";
        this._color = new THREE.Color(color);

        this._size = properties.size !== undefined ? properties.size : 20;
        this._shape = properties.shape || 'sphere';
        this.data = properties.data || {};

        return this;
    };

    /**
     * Get current position of the agent
     */
    Agent.prototype.getPosition = function () {
        if (!this._targetNode) {
            return this._currentNode._pos.clone();
        }

        // Interpolate between current and target node
        var start = this._currentNode._pos;
        var end = this._targetNode._pos;
        
        return new THREE.Vector3(
            start.x + (end.x - start.x) * this._progress,
            start.y + (end.y - start.y) * this._progress,
            start.z + (end.z - start.z) * this._progress
        );
    };

    /**
     * Move agent to target node
     */
    Agent.prototype.moveTo = function (targetNode, speed) {
        this._targetNode = targetNode;
        this._progress = 0;
        this._speed = speed !== undefined ? speed : 1;
        return this;
    };

    /**
     * Update agent movement (called each frame)
     */
    Agent.prototype.update = function (deltaTime) {
        if (!this._active || !this._targetNode) {
            return false;
        }

        this._progress += this._speed * deltaTime;

        if (this._progress >= 1) {
            this._currentNode = this._targetNode;
            this._targetNode = null;
            this._progress = 0;
            return true; // Movement complete
        }

        return false;
    };

    /**
     * Check if agent is currently moving
     */
    Agent.prototype.isMoving = function () {
        return this._targetNode !== null;
    };

    /**
     * Get current node
     */
    Agent.prototype.getCurrentNode = function () {
        return this._currentNode;
    };

    /**
     * Set agent color
     */
    Agent.prototype.setColor = function (color) {
        this._color.set(color);
        return this;
    };

    /**
     * Get agent color
     */
    Agent.prototype.color = function () {
        return this._color.getHexString();
    };

    /**
     * Activate/deactivate agent
     */
    Agent.prototype.setActive = function (active) {
        this._active = active;
        return this;
    };

    /**
     * Check if agent is active
     */
    Agent.prototype.isActive = function () {
        return this._active;
    };

    return Agent;
}());

