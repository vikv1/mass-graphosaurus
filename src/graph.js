module.exports = (function () {
    "use strict";

    var Frame = require('./frame.js');

    /**
     * Constructs a new Graph
     * @constructor
     * @alias Graph
     *
     * @param {Object} props - Object containing optional properties of the Graph
     * @param {Boolean} props.antialias - 'true' if antialiasing should be enabled on the graph. Defaults to 'false'.
     * @param {Number} props.fov - Degree represting the field of view for the camera. Defaults to 45.
     * @param {Boolean} props.sizeAttenuation - 'true' if nodes' size should change with distance. Defaults to 'false'.
     * @param {String} props.nodeImage - Path to an image to use for the graph nodes, defaults to no image.
     * @param {Boolean} props.nodeImageTransparent - 'true' if the node image has transparency, defaults to 'false'.
     * @param {Number} props.nodeSize - Number representing the size (in pixels) of the nodes within the graph, defaults to 10
     * @param {Number} props.edgeOpacity - Number (between 0 and 1) indicating the percentage opacity of the edges, defaults to 1 (100%)
     * @param {Number} props.edgeWidth - Number representing the width (in pixels) of the edges within the graph, defaults to 1
     * @param {Number|String} props.bgColor - Hexadecimal or CSS-style string representation the color of the background, defaults to 'white'
     * @param {Number} props.bgOpacity - Number (between 0 and 1) indicating the percentage opacity of the background, defaults to 1 (100%)
     * @param {Function} props.hover - Callback function that will be called when the mouse hovers over a node. Event data will be passed as a parameter to the callback.
     * @param {Function} props.click - Callback function that will be called when the mouse clicks a node. Event data will be passed as a parameter to the callback.
     */
    var Graph = function (props) {
        this._nodeIds = {};
        this._nodes = [];
        this._edges = [];
        this._agents = [];
        this._frames = [];
        this._autoRender = true;
        this._messageHandlers = {};
        this._initProps(props);
    };

    Graph.prototype._initProps = function (properties) {
        properties = properties || {};

        this._antialias = !!properties.antialias;

        this._fov = properties.fov !== undefined ? properties.fov : 45;

        this._sizeAttenuation = !!properties.sizeAttenuation;

        this._nodeImage = properties.nodeImage || undefined;

        this._nodeImageTransparent = !!properties.nodeImageTransparent;

        this._nodeSize = properties.nodeSize !== undefined ? properties.nodeSize : 10;

        this._bgColor = properties.bgColor !== undefined ? properties.bgColor : "white";

        this._bgOpacity = properties.bgOpacity !== undefined ? properties.bgOpacity : 1;

        this._edgeWidth = properties.edgeWidth !== undefined ? properties.edgeWidth : 1;

        this._edgeOpacity = properties.edgeOpacity !== undefined ? properties.edgeOpacity : 1;

        this._hover = properties.hover || undefined;

        this._click = properties.click || undefined;

        this._rightClick = properties.rightClick || undefined;

        return this;
    };

    /**
     * Stops the chart from rendering newly added data (e.g. edges/nodes)
     */
    Graph.prototype.disableAutoRender = function() {
        this._autoRender = false;

        return this;
    };

    /**
     * Re-enables rendering newly added data (e.g. edges/nodes)
     */
    Graph.prototype.enableAutoRender = function() {
        this._autoRender = true;
        this.syncDataToFrames();

        return this;
    };

    Graph.prototype.addNode = function (node) {
        var id = node.id();

        if (id !== undefined) {
            this._nodeIds[id] = node;
        }

        this._nodes.push(node);
        this.syncDataToFrames();

        return this;
    };

    /**
     * Add multiple nodes at the same time
     *
     * @param {Array} nodes - array of Node objects to add, as you would using the addNode function
     */
    Graph.prototype.addNodes = function(nodes) {
        nodes.forEach(function(node) {
            this.addNode(node);
        }, this);

        return this;
    };

    /**
     * Removes all nodes from the Graph. Implies removing all the edges, as well, since they'd no longer be connected to anything.
     */
    Graph.prototype.purgeNodes = function() {
        this._nodes.length = 0;
        this._nodeIds = {};
        this.purgeEdges();
    };

    Graph.prototype.node = function (id) {
        return this._nodeIds[id];
    };

    Graph.prototype.nodes = function () {
        return this._nodes;
    };

    Graph.prototype.edges = function () {
        return this._edges;
    };

    /**
     * Add an Edge to the Graph. Upon adding, if the Edge contains Node string ID's, they will be looked up in the Graph and replaced with Node instances.
     */
    Graph.prototype.addEdge = function (edge) {
        this._resolveEdgeIds(edge);
        this._edges.push(edge);
        this.syncDataToFrames();

        return this;
    };

    /**
     * Add multiple edges at the same time.
     *
     * @param {Array} edges - array of Edge objects, or edge parameters.
     */
    Graph.prototype.addEdges = function (edges) {
        edges.forEach(function(edge) {
            this.addEdge(edge);
        }, this);

        return this;
    };

    /**
     * Removes all the edges from the graph.
     */
    Graph.prototype.purgeEdges = function() {
        this._edges.length = 0;
    };

    /**
     * Replace string IDs representing Nodes in Edges with Node references
     * @private
     *
     * @param {Edge} edge - Edge that has string IDs for its Node values
     * @returns {undefined}
     */
    Graph.prototype._resolveEdgeIds = function (edge) {
        var node, nodes = edge.nodes(), type;

        type = typeof nodes[0];
        if (type === "string" || type === "number") {
            node = this.node(nodes[0]);
            if (node === undefined) {
                throw "Could not resolve id=" + nodes[0];
            }
            nodes[0] = node;
        }

        type = typeof nodes[1];
        if (type === "string" || type === "number") {
            node = this.node(nodes[1]);
            if (node === undefined) {
                throw "Could not resolve id=" + nodes[1];
            }
            nodes[1] = node;
        }
    };

    /**
     * Render the Graph in a DOM element
     *
     * @param {Element|String} elem - Element the Graph should be rendered in. Specify Element ID if string.
     * @returns {Graph} The Graph the method was called on
     */
    Graph.prototype.renderIn = function (elem) {
        var frame = new Frame(elem, this);
        this._frames.push(frame);
        return frame;
    };

    Graph.prototype.syncDataToFrames = function () {
        // TODO: instead of this method, nodes/edges should send an Event to the
        // Graph, which sends the Event to the Frame informing there has been
        // a changed and it needs to be rerendered
        if (this._autoRender) {
            this._frames.forEach(function (frame) {
                frame.syncDataFromGraph();
                frame.forceRerender();
            });
        }
    };

    /**
     * Add an Agent to the Graph
     */
    Graph.prototype.addAgent = function (agent) {
        this._agents.push(agent);
        this._frames.forEach(function (frame) {
            frame.addAgent(agent);
        });
        return this;
    };

    /**
     * Remove an Agent from the Graph
     */
    Graph.prototype.removeAgent = function (agent) {
        var index = this._agents.indexOf(agent);
        if (index !== -1) {
            this._agents.splice(index, 1);
            this._frames.forEach(function (frame) {
                frame.removeAgent(agent);
            });
        }
        return this;
    };

    /**
     * Get all agents in the Graph
     */
    Graph.prototype.agents = function () {
        return this._agents;
    };

    /**
     * Remove all agents from the Graph
     */
    Graph.prototype.purgeAgents = function () {
        this._agents.length = 0;
        this._frames.forEach(function (frame) {
            frame.purgeAgents();
        });
        return this;
    };

    /**
     * Register a message handler for specific message types
     * @param {String} messageType - Type of message to handle
     * @param {Function} handler - Function to handle the message
     */
    Graph.prototype.onMessage = function (messageType, handler) {
        if (!this._messageHandlers[messageType]) {
            this._messageHandlers[messageType] = [];
        }
        this._messageHandlers[messageType].push(handler);
        return this;
    };

    /**
     * Remove a message handler
     * @param {String} messageType - Type of message
     * @param {Function} handler - Handler function to remove
     */
    Graph.prototype.offMessage = function (messageType, handler) {
        if (this._messageHandlers[messageType]) {
            var index = this._messageHandlers[messageType].indexOf(handler);
            if (index !== -1) {
                this._messageHandlers[messageType].splice(index, 1);
            }
        }
        return this;
    };

    /**
     * Send a message to the graph (triggers registered handlers)
     * @param {Object} message - Message object with at least a 'type' property
     */
    Graph.prototype.handleMessage = function (message) {
        var messageType = message.type;
        
        if (!messageType) {
            return this;
        }

        // Call all registered handlers for this message type
        if (this._messageHandlers[messageType]) {
            this._messageHandlers[messageType].forEach(function (handler) {
                handler.call(this, message);
            }, this);
        }

        // Built-in message handlers
        if (messageType === 'spawn_agent') {
            this._handleSpawnAgent(message);
        } else if (messageType === 'move_agent') {
            this._handleMoveAgent(message);
        } else if (messageType === 'remove_agent') {
            this._handleRemoveAgent(message);
        } else if (messageType === 'add_node') {
            this._handleAddNode(message);
        } else if (messageType === 'add_edge') {
            this._handleAddEdge(message);
        }

        return this;
    };

    /**
     * Built-in handler for spawning agents
     * @private
     */
    Graph.prototype._handleSpawnAgent = function (message) {
        var Agent = require('./agent');
        
        var nodeId = message.nodeId || message.node_id;
        var startNode = nodeId ? this.node(nodeId) : null;
        
        if (!startNode && this._nodes.length > 0) {
            startNode = this._nodes[0];
        }
        
        if (!startNode) {
            return;
        }

        var agent = new Agent(startNode, {
            color: message.color || 0xFFFF00,
            size: message.size || 20,
            shape: message.shape || 'sphere',
            data: message.data || {}
        });

        if (message.id || message.agentId) {
            agent.id = message.id || message.agentId;
        }

        this.addAgent(agent);

        // Auto-move if target specified
        if (message.targetNodeId || message.target_node_id) {
            var targetNode = this.node(message.targetNodeId || message.target_node_id);
            if (targetNode) {
                agent.moveTo(targetNode, message.speed || 1);
            }
        }
    };

    /**
     * Built-in handler for moving agents
     * @private
     */
    Graph.prototype._handleMoveAgent = function (message) {
        var agentId = message.agentId || message.agent_id || message.id;
        var targetNodeId = message.targetNodeId || message.target_node_id;
        
        if (!agentId || !targetNodeId) {
            return;
        }

        var agent = this._findAgentById(agentId);
        var targetNode = this.node(targetNodeId);

        if (agent && targetNode) {
            agent.moveTo(targetNode, message.speed || 1);
        }
    };

    /**
     * Built-in handler for removing agents
     * @private
     */
    Graph.prototype._handleRemoveAgent = function (message) {
        var agentId = message.agentId || message.agent_id || message.id;
        
        if (!agentId) {
            return;
        }

        var agent = this._findAgentById(agentId);
        if (agent) {
            this.removeAgent(agent);
        }
    };

    /**
     * Find an agent by ID
     * @private
     */
    Graph.prototype._findAgentById = function (agentId) {
        for (var i = 0; i < this._agents.length; i++) {
            if (this._agents[i].id === agentId) {
                return this._agents[i];
            }
        }
        return null;
    };

    /**
     * Generate a random position within a sphere
     * @private
     * @param {Number} radius - Radius of the sphere
     * @returns {Array} [x, y, z] position
     */
    Graph.prototype._randomSpherePosition = function (radius) {
        radius = radius || 10;
        // Spherical coordinates for uniform distribution
        var theta = Math.random() * Math.PI * 2;  // azimuthal angle
        var phi = Math.acos(2 * Math.random() - 1);  // polar angle
        var r = Math.cbrt(Math.random()) * radius;  // cube root for uniform volume distribution
        
        return [
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        ];
    };

    /**
     * Built-in handler for adding nodes dynamically
     * @private
     */
    Graph.prototype._handleAddNode = function (message) {
        var Node = require('./node');
        
        var nodeId = message.id || message.nodeId;
        
        // Check if node already exists
        if (nodeId && this.node(nodeId)) {
            return;
        }
        
        // Use provided position, or generate random spherical position
        var position = message.position;
        if (!position) {
            var radius = message.radius || 10;
            position = this._randomSpherePosition(radius);
        }
        var color = message.color || 0x888888;
        
        var node = new Node(position, {
            color: color,
            id: nodeId,
            data: message.data || {}
        });
        
        this.addNode(node);
    };

    /**
     * Built-in handler for adding edges dynamically
     * @private
     */
    Graph.prototype._handleAddEdge = function (message) {
        var Edge = require('./edge');
        
        var fromNodeId = message.fromNodeId || message.from_node_id;
        var toNodeId = message.toNodeId || message.to_node_id;
        
        if (!fromNodeId || !toNodeId) {
            return;
        }
        
        var fromNode = this.node(fromNodeId);
        var toNode = this.node(toNodeId);
        
        if (!fromNode || !toNode) {
            return;
        }
        
        var color = message.color || 0xCCCCCC;
        
        var edge = new Edge([fromNode, toNode], {
            color: color
        });
        
        this.addEdge(edge);
    };

    return Graph;
}());
