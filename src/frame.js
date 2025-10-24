module.exports = (function () {
    "use strict";

    var THREE = require("three"),
        TrackballControls = require("three.trackball"),
        BufferGeometrySorter = require("three-buffergeometry-sort");

    var Frame = function (elem, graph) {
        if (typeof elem === 'string') {
            elem = document.getElementById(elem);
        }

        this.graph = graph;
        this.nodesHaveBeenNormalized = false;
        this.hasCameraBeenPositioned = false;
        this.agentMeshes = [];
        this.agents = [];

        var width = elem.scrollWidth;
        var height = elem.scrollHeight;
        var aspectRatio = width/height;

        this.scale = 1;
        this.lastFrameTime = Date.now();

        this._initScene();
        this._initRenderer(width, height, elem);
        this._initNodes();
        this._initEdges();
        this._initAgents();

        this._initCamera(aspectRatio);
        this._initControls(elem);

        this._initMouseEvents(elem);

        this.syncDataFromGraph();

        this._animate();
    };

    Frame.prototype._initScene = function () {
        this.scene = new THREE.Scene();
    };

    Frame.prototype._initCamera = function (aspect) {
        var self = this;

        var viewAngle = this.graph._fov;
        var camera = new THREE.PerspectiveCamera(viewAngle, aspect);

        this.camera = camera;

        window.addEventListener('resize', function () {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            // TODO this should be the element width/height, not the window
            self.renderer.setSize(window.innerWidth, window.innerHeight);
            self.forceRerender();
        }, false);
    };

    Frame.prototype._initRenderer = function (width, height, elem) {
        var renderer = new THREE.WebGLRenderer({
            antialias: this.graph._antialias,
            alpha: true,
        });
        renderer.setClearColor(this.graph._bgColor, this.graph._bgOpacity);
        renderer.setSize(width, height);
        elem.appendChild(renderer.domElement);

        this.renderer = renderer;
    };

    Frame.prototype.forceRerender = function () {
        this.renderer.render(this.scene, this.camera);
    };

    Frame.prototype._initControls = function (elem) {
        var self = this;
        var controls = new TrackballControls(this.camera, elem);

        controls.addEventListener('change', function () {
            self.forceRerender();
        });

        this.controls = controls;
    };

    Frame.prototype._numNodes = function () {
        var bufferAttr = this.points.getAttribute('position');
        return bufferAttr.count;
    };

    Frame.prototype.positionCamera = function () {
        if (this.hasCameraBeenPositioned || this._numNodes() < 2) {
          return;
        }

        this.hasCameraBeenPositioned = true;

        // Calculate optimal camera position
        this.points.computeBoundingSphere();
        var sphere = this.points.boundingSphere;

        var optimalDistance = (
            sphere.radius * 1.5 / Math.tan(this.graph._fov / 2));

        this.camera.position.x = sphere.center.x + optimalDistance;
        this.camera.position.y = sphere.center.y;
        this.camera.position.z = sphere.center.z;

        this.controls.target = sphere.center.clone();
    };

    Frame.prototype._initNodes = function () {
        var self = this;

        var material = new THREE.PointsMaterial({
            size: this.graph._nodeSize,
            vertexColors: true,
            sizeAttenuation: this.graph._sizeAttenuation,
            depthWrite: false,
        });

        if (this.graph._nodeImage !== undefined) {
            var texture = (new THREE.TextureLoader()).load(
                this.graph._nodeImage, function () {
                    // Force a rerender after node image has finished loading
                    self.forceRerender();
                });
            material.map = texture;
        }

        this.points = new THREE.BufferGeometry();
        this.pointCloud = new THREE.Points(this.points, material);

        if (this.graph._nodeImageTransparent === true) {
            material.transparent = true;
            this.pointCloud.sortParticles = true;
        }

        this.scene.add(this.pointCloud);
    };

    Frame.prototype.syncDataFromGraph = function () {
        this._syncNodeDataFromGraph();
        this._syncEdgeDataFromGraph();
    };

    Frame.prototype._syncNodeDataFromGraph = function () {
        var nodes = this.graph.nodes();

        var positions = new THREE.BufferAttribute(
            new Float32Array(nodes.length * 3), 3);
        var colors = new THREE.BufferAttribute(
            new Float32Array(nodes.length * 3), 3);
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var pos = node._pos;
            var color = node._color;

            positions.setXYZ(i, this.scale * pos.x, this.scale * pos.y, this.scale * pos.z);
            colors.setXYZ(i, color.r, color.g, color.b);
        }
        this.points.addAttribute('position', positions);
        this.points.addAttribute('color', colors);

        this.points.computeBoundingSphere();

        this._normalizePositions();
        this.positionCamera();
    };

    Frame.prototype._normalizePositions = function () {
        if (this.nodesHaveBeenNormalized || this._numNodes() < 2) {
          return;
        }

        this.nodesHaveBeenNormalized = true;

        this.scale = 1 / this.points.boundingSphere.radius;
        var positions = this.points.attributes.position.array;

        for (var i = 0; i < positions.length; i++) {
            positions[i] *= this.scale;
        }

        if (this.edges.attributes.position) {
          positions = this.edges.attributes.position.array;
          for (i = 0; i < positions.length; i++) {
              positions[i] *= this.scale;
          }
        }
    };

    Frame.prototype._initEdges = function () {
        var material = new THREE.LineBasicMaterial({
            vertexColors: THREE.VertexColors,
            linewidth: this.graph._edgeWidth,
            opacity: this.graph._edgeOpacity,
            transparent: this.graph._edgeOpacity < 1,
        });

        this.edges = new THREE.BufferGeometry();
        this.line = new THREE.LineSegments(this.edges, material);
        this.scene.add(this.line);
    };

    Frame.prototype._initAgents = function () {
        this.agentGroup = new THREE.Group();
        this.scene.add(this.agentGroup);
    };

    Frame.prototype._syncEdgeDataFromGraph = function () {
        var edges = this.graph.edges();

        var positions = new THREE.BufferAttribute(
            new Float32Array(edges.length * 6), 3);
        var colors = new THREE.BufferAttribute(
            new Float32Array(edges.length * 6), 3);

        for (var i = 0; i < edges.length; i++) {
            var edge = edges[i];
            var nodes = edge.nodes();

            positions.setXYZ(
                2 * i,
                this.scale * nodes[0]._pos.x,
                this.scale * nodes[0]._pos.y,
                this.scale * nodes[0]._pos.z);

            positions.setXYZ(
                2 * i + 1,
                this.scale * nodes[1]._pos.x,
                this.scale * nodes[1]._pos.y,
                this.scale * nodes[1]._pos.z);

            colors.setXYZ(
                2 * i,
                edge._color.r,
                edge._color.g,
                edge._color.b);

            colors.setXYZ(
                2 * i + 1,
                edge._color.r,
                edge._color.g,
                edge._color.b);
        }

        this.edges.addAttribute('position', positions);
        this.edges.addAttribute('color', colors);
    };

    Frame.prototype._initMouseEvents = function (elem) {
        var self = this;
        var mouseDownPos = null;
        
        var createMouseHandler = function (callback, includeEdges) {
            var raycaster = new THREE.Raycaster();

            return function (evt) {
                evt.preventDefault();

                var rect = elem.getBoundingClientRect();
                var mouseX = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
                var mouseY = -((evt.clientY - rect.top) / rect.height) * 2 + 1;

                // Calculate mouse position
                var mousePosition = new THREE.Vector3(mouseX, mouseY, 0.1);
                var radiusPosition = mousePosition.clone();
                mousePosition.unproject(self.camera);

                // Calculate threshold
                var clickRadiusPx = 5;  // 5px
                var radiusX = ((evt.clientX - rect.left + clickRadiusPx) / rect.width) * 2 - 1;
                radiusPosition.setX(radiusX);
                radiusPosition.unproject(self.camera);

                var clickRadius = radiusPosition.distanceTo(mousePosition);
                var threshold = (
                    self.camera.far * clickRadius / self.camera.near);

                raycaster.params.Points.threshold = threshold;

                // Determine intersects
                var mouseDirection = (
                    mousePosition.sub(self.camera.position).normalize());
                raycaster.set(self.camera.position, mouseDirection);
                
                // Check nodes first
                var intersects = raycaster.intersectObject(self.pointCloud);
                if (intersects.length) {
                    var nodeIndex = intersects[0].index;
                    callback({
                        type: 'node',
                        node: self.graph._nodes[nodeIndex]
                    });
                    return;
                }
                
                // Check edges if enabled
                if (includeEdges) {
                    raycaster.params.Line.threshold = 0.02;
                    var edgeIntersects = raycaster.intersectObject(self.line);
                    if (edgeIntersects.length) {
                        var edgeIndex = Math.floor(edgeIntersects[0].index / 2);
                        if (edgeIndex < self.graph._edges.length) {
                            callback({
                                type: 'edge',
                                edge: self.graph._edges[edgeIndex]
                            });
                        }
                    }
                }
            };
        };

        // Track mouse down to distinguish clicks from drags
        elem.addEventListener('mousedown', function(e) {
            mouseDownPos = { x: e.clientX, y: e.clientY };
        }, false);

        if (this.graph._hover) {
            elem.addEventListener(
                'mousemove', createMouseHandler(this.graph._hover, false), false);
        }

        if (this.graph._click) {
            elem.addEventListener('mouseup', function(e) {
                if (!mouseDownPos) {
                    return;
                }
                
                var dx = e.clientX - mouseDownPos.x;
                var dy = e.clientY - mouseDownPos.y;
                var distance = Math.sqrt(dx*dx + dy*dy);
                
                mouseDownPos = null;
                
                // Only treat as click if mouse didn't move much
                if (distance < 5) {
                    createMouseHandler(self.graph._click, true)(e);
                }
            }, false);
        }

        if (this.graph._rightClick) {
            elem.addEventListener(
                'contextmenu', createMouseHandler(this.graph._rightClick, true), false);
        }
    };

    Frame.prototype._updateCameraBounds = (function () {
        var prevCameraPos;
        return function () {
            // TODO: this shouldn't update every frame
            // TODO: is this still even necessary now that we scale?
            var cameraPos = this.camera.position;

            if (cameraPos === prevCameraPos) { return; }

            var boundingSphere = this.points.boundingSphere;
            var distance = boundingSphere.distanceToPoint(cameraPos);

            if (distance > 0) {
                this.camera.near = distance;
                this.camera.far = distance + boundingSphere.radius * 2;
                this.camera.updateProjectionMatrix();
            }

            prevCameraPos = cameraPos.clone();
        };
    }());

    Frame.prototype.addAgent = function (agent) {
        var geometry, material, mesh;
        
        // Create geometry based on shape
        if (agent._shape === 'cube') {
            geometry = new THREE.BoxGeometry(agent._size * 0.01, agent._size * 0.01, agent._size * 0.01);
        } else if (agent._shape === 'cone') {
            geometry = new THREE.ConeGeometry(agent._size * 0.005, agent._size * 0.01, 8);
        } else {
            geometry = new THREE.SphereGeometry(agent._size * 0.005, 16, 16);
        }
        
        material = new THREE.MeshBasicMaterial({
            color: agent._color,
            transparent: true,
            opacity: 0.9
        });
        
        mesh = new THREE.Mesh(geometry, material);
        
        var pos = agent.getPosition();
        mesh.position.set(pos.x * this.scale, pos.y * this.scale, pos.z * this.scale);
        
        this.agentGroup.add(mesh);
        this.agents.push(agent);
        this.agentMeshes.push(mesh);
        
        this.forceRerender();
        return this;
    };

    Frame.prototype.removeAgent = function (agent) {
        var index = this.agents.indexOf(agent);
        if (index !== -1) {
            var mesh = this.agentMeshes[index];
            this.agentGroup.remove(mesh);
            this.agents.splice(index, 1);
            this.agentMeshes.splice(index, 1);
            this.forceRerender();
        }
        return this;
    };

    Frame.prototype.purgeAgents = function () {
        while (this.agentGroup.children.length > 0) {
            this.agentGroup.remove(this.agentGroup.children[0]);
        }
        this.agents = [];
        this.agentMeshes = [];
        this.forceRerender();
        return this;
    };

    Frame.prototype._updateAgents = function (deltaTime) {
        var needsRender = false;
        
        for (var i = 0; i < this.agents.length; i++) {
            var agent = this.agents[i];
            var mesh = this.agentMeshes[i];
            
            if (agent.isActive()) {
                agent.update(deltaTime);
                var pos = agent.getPosition();
                mesh.position.set(pos.x * this.scale, pos.y * this.scale, pos.z * this.scale);
                needsRender = true;
            }
        }
        
        return needsRender;
    };

    Frame.prototype._animate = function () {
        var self = this,
            sorter = new BufferGeometrySorter(5);

        // Update near/far camera range
        (function animate() {
            var currentTime = Date.now();
            var deltaTime = (currentTime - self.lastFrameTime) / 1000; // Convert to seconds
            self.lastFrameTime = currentTime;

            self._updateCameraBounds();
            var agentsNeedRender = self._updateAgents(deltaTime);
            sorter.sort(self.points.attributes, self.controls.object.position);

            // Force re-render if agents are moving
            if (agentsNeedRender) {
                self.forceRerender();
            }

            window.requestAnimationFrame(animate);
            self.controls.update();
        }());
    };

    return Frame;
}());
