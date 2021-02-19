import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import ButtonIcon from '../buttonIcon/buttonIcon';
import styles from './styles.less';

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c === 'x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

var GraphCreator = function(svg, nodes, edges) {
    var thisGraph = this;

    thisGraph.idct = 0;

    thisGraph.nodes = nodes || [];
    thisGraph.edges = edges || [];

    thisGraph.state = {
        selectedNode: null,
        selectedEdge: null,
        mouseDownNode: null,
        mouseDownLink: null,
        justDragged: false,
        justScaleTransGraph: false,
        lastKeyDown: -1,
        shiftNodeDrag: false,
        selectedText: null
    };

    // define arrow markers for graph links
    var defs = svg.append('defs');
    defs.append('svg:marker')
        .attr('id', 'end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', "32")
        .attr('markerWidth', 3.5)
        .attr('markerHeight', 3.5)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5');

    //define arrow markers for leading arrow
    defs.append('marker')
        .attr('id', 'mark-end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 7)
        .attr('markerWidth', 3.5)
        .attr('markerHeight', 3.5)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5');

    thisGraph.svg = svg;
    thisGraph.svgG = svg.append("g")
        .classed(thisGraph.consts.graphClass, true);
    var svgG = thisGraph.svgG;

    // displayed when dragging between nodes
    thisGraph.dragLine = svgG.append('path')
        .attr('class', 'link dragline hidden')
        .attr('d', 'M0,0L0,0')
        .style('marker-end', 'url(#mark-end-arrow)');

    // svg nodes and edges
    thisGraph.paths = svgG.append("g").selectAll("g");
    thisGraph.circles = svgG.append("g").selectAll("g");

    thisGraph.drag = d3.behavior.drag()
        .origin(function(d) {
            // d = selected circle. The drag origin is the origin of the circle
            return {
                x: d.x,
                y: d.y
            };
        })
        .on("drag", function(args) {
            thisGraph.state.justDragged = true;
            thisGraph.dragmove.call(thisGraph, args);
        })
        .on("dragend", function(args) {
            // args = circle that was dragged
        });

    // listen for key events
    d3.select(window).on("keydown", function() {
            thisGraph.svgKeyDown.call(thisGraph);
        })
        .on("keyup", function() {
            thisGraph.svgKeyUp.call(thisGraph);
        });
    svg.on("mousedown", function(d) {
        thisGraph.svgMouseDown.call(thisGraph, d);
    });
    svg.on("mouseup", function(d) {
        thisGraph.svgMouseUp.call(thisGraph, d);
    });

    // listen for dragging
    var dragSvg = d3.behavior.zoom()
        .on("zoom", function() {
            if (d3.event.sourceEvent.shiftKey) {
                return false;
            } else {
                thisGraph.zoomed.call(thisGraph);
            }
            return true;
        })
        .on("zoomstart", function() {
            var ael = d3.select("#" + thisGraph.consts.activeEditId).node();
            if (ael) {
                ael.blur();
            }
            if (!d3.event.sourceEvent.shiftKey) d3.select('body').style("cursor", "move");
        })
        .on("zoomend", function() {
            d3.select('body').style("cursor", "auto");
        });
    thisGraph.dragSvg = dragSvg;

    svg.call(dragSvg).on("dblclick.zoom", null);
};

GraphCreator.prototype.setIdCt = function(idct) {
    this.idct = idct;
};

GraphCreator.prototype.resetZoom = function() {
    d3.select(".graph")
        .transition() // start a transition
        .duration(1000) // make it last 1 second
        .attr('transform', "translate(1,0)");

    this.dragSvg.scale(1);
    this.dragSvg.translate([1, 0]);
};

GraphCreator.prototype.consts = {
    selectedClass: "selected",
    connectClass: "connect-node",
    circleGClass: "conceptG",
    graphClass: "graph",
    activeEditId: "active-editing",
    BACKSPACE_KEY: 8,
    DELETE_KEY: 46,
    ENTER_KEY: 13,
    nodeRadius: 50
};

/* PROTOTYPE FUNCTIONS */

GraphCreator.prototype.dragmove = function(d) {
    var thisGraph = this;
    if (thisGraph.state.shiftNodeDrag) {
        thisGraph.dragLine.attr('d', 'M' + d.x + ',' + d.y + 'L' + d3.mouse(thisGraph.svgG.node())[0] + ',' + d3.mouse(this.svgG.node())[1]);
    } else {
        d.x += d3.event.dx;
        d.y += d3.event.dy;
        thisGraph.updateGraph();
    }
};

GraphCreator.prototype.deleteGraph = function(skipPrompt) {
    var thisGraph = this,
        doDelete = true;
    if (!skipPrompt) {
        doDelete = window.confirm("Press OK to delete this graph");
    }
    if (doDelete) {
        thisGraph.nodes = [];
        thisGraph.edges = [];
        thisGraph.updateGraph();
    }
};

/* select all text in element: taken from http://stackoverflow.com/questions/6139107/programatically-select-text-in-a-contenteditable-html-element */
GraphCreator.prototype.selectElementContents = function(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
};


/* insert svg line breaks: taken from http://stackoverflow.com/questions/13241475/how-do-i-include-newlines-in-labels-in-d3-charts */
GraphCreator.prototype.insertTitleLinebreaks = function(gEl, title) {
    var words = title.split(/\s+/g),
        nwords = words.length;
    var el = gEl.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-" + (nwords - 1) * 7.5);

    for (var i = 0; i < words.length; i++) {
        var tspan = el.append('tspan').text(words[i]);
        if (i > 0)
            tspan.attr('x', 0).attr('dy', '15');
    }
};


// remove edges associated with a node
GraphCreator.prototype.spliceLinksForNode = function(node) {
    var thisGraph = this,
        toSplice = thisGraph.edges.filter(function(l) {
            return (l.source === node || l.target === node);
        });
    toSplice.map(function(l) {
        thisGraph.edges.splice(thisGraph.edges.indexOf(l), 1);
    });
};

GraphCreator.prototype.replaceSelectEdge = function(d3Path, edgeData) {
    var thisGraph = this;
    d3Path.classed(thisGraph.consts.selectedClass, true);
    if (thisGraph.state.selectedEdge) {
        thisGraph.removeSelectFromEdge();
    }
    thisGraph.state.selectedEdge = edgeData;
};

GraphCreator.prototype.replaceSelectNode = function(d3Node, nodeData) {
    // A circle node has been selected.

    var thisGraph = this;
    d3Node.classed(this.consts.selectedClass, true);
    if (thisGraph.state.selectedNode) {
        thisGraph.removeSelectFromNode();
    }
    thisGraph.state.selectedNode = nodeData;

    d3.json("scripts/processes.json", function(error, json) {

        json = _.sortBy(json, function(d) {
            return d.Value
        })

        if (error) {
            alert("Error occured while getting processes. Check console for details.");
            return;
        }

        var inspector = d3.select("div#container").append("div").attr({
            id: "inspector"
        });
        var sel = inspector.append("select")
            .on("change", function(d) {
                // Update thisGraph.nodes and graph text with selected option.
                var selectedOption = this.options[this.selectedIndex];
                // selectedOption.value & selectedOption.text

                d3Node.select("text").remove();
                thisGraph.insertTitleLinebreaks(d3Node, selectedOption.text);
                nodeData.eventTypeId = parseInt(selectedOption.value);
                nodeData.title = selectedOption.text;
            });


        var options = sel.selectAll("option");

        options.data(json).enter()
            .append("option")
            .attr({
                value: function(d) {
                    return d.Key
                }
            })
            .text(function(d) {
                return d.Value
            })
            .property("selected", function(d, i) {
                return d.Key === nodeData.eventTypeId;
            });

    });
};

GraphCreator.prototype.removeSelectFromNode = function() {
    // A circle node has been deselected.

    var thisGraph = this;
    thisGraph.circles.filter(function(cd) {
        return cd.id === thisGraph.state.selectedNode.id;
    }).classed(thisGraph.consts.selectedClass, false);
    thisGraph.state.selectedNode = null;

    d3.selectAll("div#inspector").remove();

};

GraphCreator.prototype.removeSelectFromEdge = function() {
    var thisGraph = this;
    thisGraph.paths.filter(function(cd) {
        return cd === thisGraph.state.selectedEdge;
    }).classed(thisGraph.consts.selectedClass, false);
    thisGraph.state.selectedEdge = null;
};

GraphCreator.prototype.pathMouseDown = function(d3path, d) {
    var thisGraph = this,
        state = thisGraph.state;
    d3.event.stopPropagation();
    state.mouseDownLink = d;

    if (state.selectedNode) {
        thisGraph.removeSelectFromNode();
    }

    var prevEdge = state.selectedEdge;
    if (!prevEdge || prevEdge !== d) {
        thisGraph.replaceSelectEdge(d3path, d);
    } else {
        thisGraph.removeSelectFromEdge();
    }
};

// mousedown on node
GraphCreator.prototype.circleMouseDown = function(d3node, d) {
    var thisGraph = this,
        state = thisGraph.state;
    d3.event.stopPropagation();
    state.mouseDownNode = d;

    if (d3.event.shiftKey) {
        // Automatically create node when they shift + drag?
        state.shiftNodeDrag = d3.event.shiftKey;
        // reposition dragged directed edge
        thisGraph.dragLine.classed('hidden', false)
            .attr('d', 'M' + d.x + ',' + d.y + 'L' + d.x + ',' + d.y);
        return;
    }
};

// mouseup on nodes
GraphCreator.prototype.circleMouseUp = function(d3node, d) {
    var thisGraph = this,
        state = thisGraph.state,
        consts = thisGraph.consts;
    // reset the states
    state.shiftNodeDrag = false;
    d3node.classed(consts.connectClass, false);

    var mouseDownNode = state.mouseDownNode;

    if (!mouseDownNode) return;

    thisGraph.dragLine.classed("hidden", true);

    if (mouseDownNode !== d) {
        // we're in a different node: create new edge for mousedown edge and add to graph
        var newEdge = {
            source: mouseDownNode,
            target: d
        };
        var filtRes = thisGraph.paths.filter(function(d) {
            if (d.source === newEdge.target && d.target === newEdge.source) {
                thisGraph.edges.splice(thisGraph.edges.indexOf(d), 1);
            }
            return d.source === newEdge.source && d.target === newEdge.target;
        });
        if (!filtRes[0].length) {
            thisGraph.edges.push(newEdge);
            thisGraph.updateGraph();
        }
    } else {
        // we're in the same node
        if (state.justDragged) {
            // dragged, not clicked
            state.justDragged = false;
        } else {
            // clicked, not dragged
            if (d3.event.shiftKey) {
                // shift-clicked node: edit text content
                //   var d3txt = thisGraph.changeTextOfNode(d3node, d);
                //   var txtNode = d3txt.node();
                //   thisGraph.selectElementContents(txtNode);
                //   txtNode.focus();

            } else {
                if (state.selectedEdge) {
                    thisGraph.removeSelectFromEdge();
                }
                var prevNode = state.selectedNode;

                if (!prevNode || prevNode.id !== d.id) {
                    thisGraph.replaceSelectNode(d3node, d);
                } else {
                    thisGraph.removeSelectFromNode();
                }
            }
        }
    }
    state.mouseDownNode = null;
    return;

}; // end of circles mouseup

// mousedown on main svg
GraphCreator.prototype.svgMouseDown = function() {
    this.state.graphMouseDown = true;
};

// mouseup on main svg
GraphCreator.prototype.svgMouseUp = function() {
    var thisGraph = this,
        state = thisGraph.state;
    if (state.justScaleTransGraph) {
        // dragged not clicked
        state.justScaleTransGraph = false;
    } else if (state.graphMouseDown && d3.event.shiftKey) {
        // clicked not dragged from svg
        var xycoords = d3.mouse(thisGraph.svgG.node()),
            d = {
                id: thisGraph.idct++,
                title: "",
                x: xycoords[0],
                y: xycoords[1],
                eventTypeId: null
            };
        thisGraph.nodes.push(d);
        thisGraph.updateGraph();
    } else if (state.shiftNodeDrag) {
        // dragged from node
        state.shiftNodeDrag = false;
        thisGraph.dragLine.classed("hidden", true);
    }
    state.graphMouseDown = false;
};

// keydown on main svg
GraphCreator.prototype.svgKeyDown = function() {
    var thisGraph = this,
        state = thisGraph.state,
        consts = thisGraph.consts;
    // make sure repeated key presses don't register for each keydown
    if (state.lastKeyDown !== -1) return;

    state.lastKeyDown = d3.event.keyCode;
    var selectedNode = state.selectedNode,
        selectedEdge = state.selectedEdge;

    switch (d3.event.keyCode) {
        case consts.BACKSPACE_KEY:
        case consts.DELETE_KEY:
            d3.event.preventDefault();
            if (selectedNode) {
                thisGraph.nodes.splice(thisGraph.nodes.indexOf(selectedNode), 1);
                thisGraph.spliceLinksForNode(selectedNode);
                state.selectedNode = null;
                thisGraph.updateGraph();
            } else if (selectedEdge) {
                thisGraph.edges.splice(thisGraph.edges.indexOf(selectedEdge), 1);
                state.selectedEdge = null;
                thisGraph.updateGraph();
            }
            break;
    }
};

GraphCreator.prototype.svgKeyUp = function() {
    this.state.lastKeyDown = -1;
};

// call to propagate changes to graph
GraphCreator.prototype.updateGraph = function() {

    var thisGraph = this,
        consts = thisGraph.consts,
        state = thisGraph.state;

    thisGraph.paths = thisGraph.paths.data(thisGraph.edges, function(d) {
        return String(d.source.id) + "+" + String(d.target.id);
    });
    var paths = thisGraph.paths;
    // update existing paths
    paths.style('marker-end', 'url(#end-arrow)')
        .classed(consts.selectedClass, function(d) {
            return d === state.selectedEdge;
        })
        .attr("d", function(d) {
            return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
        });

    // add new paths
    paths.enter()
        .append("path")
        .style('marker-end', 'url(#end-arrow)')
        .classed("link", true)
        .attr("d", function(d) {
            return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
        })
        .on("mousedown", function(d) {
            thisGraph.pathMouseDown.call(thisGraph, d3.select(this), d);
        })
        .on("mouseup", function(d) {
            state.mouseDownLink = null;
        });

    // remove old links
    paths.exit().remove();

    // update existing nodes
    thisGraph.circles = thisGraph.circles.data(thisGraph.nodes, function(d) {
        return d.id;
    });
    thisGraph.circles.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
    });

    // add new nodes
    var newGs = thisGraph.circles.enter()
        .append("g")
        .attr({
            "id": function(d) {
                return generateUUID();
            }
        });

    newGs.classed(consts.circleGClass, true)
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .on("mouseover", function(d) {
            if (state.shiftNodeDrag) {
                d3.select(this).classed(consts.connectClass, true);
            }
        })
        .on("mouseout", function(d) {
            d3.select(this).classed(consts.connectClass, false);
        })
        .on("mousedown", function(d) {
            thisGraph.circleMouseDown.call(thisGraph, d3.select(this), d);
        })
        .on("mouseup", function(d) {
            thisGraph.circleMouseUp.call(thisGraph, d3.select(this), d);
        })
        .call(thisGraph.drag);

    newGs.append("circle")
        .attr("r", String(consts.nodeRadius));

    newGs.each(function(d) {
        thisGraph.insertTitleLinebreaks(d3.select(this), d.title);
    });

    // remove old nodes
    thisGraph.circles.exit().remove();
};

GraphCreator.prototype.zoomed = function() {
    this.state.justScaleTransGraph = true;
    d3.select("." + this.consts.graphClass)
        .attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
};

export default class FlowEditor extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
        });

        this.bind([
            'onReset',
            'onHelp',
        ]);

        this.graph = null;
    }

    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }

    componentDidMount() {
        super.componentDidMount();

        window.$Utils.requireLibrary(this.getPreactContainerName(), 'd3').then(() => {
            const { nodes, edges } = this.prop('data');

            var svg = d3.select(`#${this.id()}`).append("svg")
                .attr("width", this.prop('width'))
                .attr("height", this.prop('height'))
                .classed(styles.svg, true);
            this.graph = new GraphCreator(svg, nodes, edges);
            this.graph.setIdCt(this.id());
            this.graph.updateGraph();
        });
    }

    onReset() {
        this.graph.resetZoom();
    }

    onHelp() {
        $(`#${this.id()}-helpbox`).toggleClass('slds-hidden');
    }

    render(props, state) {
        const [{
            className,
        }, rest] = this.getPropValues();

        const id = this.id();

        return (
            <div id={ id } className={ `${styles.flowEditor} className` } data-type={ this.getTypeName() } { ...rest }>
                <div className={ `${styles.toolbox} slds-button-group` }>
                    <ButtonIcon
                        alternativeText="reset"
                        iconName="utility:sync"
                        size="medium"
                        onClick={ this.onReset }
                    >
                    </ButtonIcon>
                    <ButtonIcon
                        alternativeText="help"
                        iconName="utility:help"
                        size="medium"
                        onClick={ this.onHelp }
                    >
                    </ButtonIcon>
                </div>
                <div id={ `${id}-helpbox` } className={ `${styles.helpbox} slds-hidden` }>
                    <li><strong>Shift + Click</strong> anywhere on the screen (white space) to create a new node.</li>
                    <li><strong>Shift + Click + Dragging</strong> from one node to another will create a one way connection between them.</li>
                    <li><strong>Left Clicking</strong> on a node will select it and bring up the inspector on the right hand side, where you can change the settings associated with it.</li>
                    <li><strong>Left Clicking + Dragging</strong> on a node will reposition it.</li>
                    <li>Selecting a node and pressing <strong>Delete</strong> or <strong>Backspace</strong> will delete the node and any connections to and from it.</li>
                    <li>Similarly, selecting a connection and pressing <strong>Delete</strong> or <strong>Backspace</strong> will remove the connection.</li>
                    <li><strong>Mouse Wheel Up</strong> and <strong>Mouse Wheel Down</strong> will zoom the graph accordingly.</li>
                </div>
            </div>
        );
    }
}

FlowEditor.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    width: PropTypes.isString('width').defaultValue('100%').demoValue('100%'),
    height: PropTypes.isString('height').defaultValue('400px').demoValue('400px'),
    data: PropTypes.isObject('data').shape({
        nodes: PropTypes.isArray('nodes').shape({
            id: PropTypes.isObject('id'),
            title: PropTypes.isString('title'),
            x: PropTypes.isNumber('x'),
            y: PropTypes.isNumber('y'),
            eventTypeId: PropTypes.isString('eventTypeId'),
        }),
        edges: PropTypes.isArray('edges').shape({
            source: PropTypes.isObject('source'),
            target: PropTypes.isObject('target'),
        }),
    }).required(),
};

FlowEditor.propTypesRest = true;
FlowEditor.displayName = "FlowEditor";
