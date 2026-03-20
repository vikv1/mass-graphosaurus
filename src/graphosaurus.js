(function () {
    "use strict";

    var Graph = require("./graph");

    window.G = window.Graphosaurus = {
        Graph: Graph,
        graph: function (props) { return new Graph(props); },
    };
}());
