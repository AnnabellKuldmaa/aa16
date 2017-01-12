if (!d3) {
    throw "d3 wasn't included!";
}
(function () {
        d3.warping = {};

        // HELPER FUNCTIONS
        genRandom = function (n, m, box_w) {
            var data = new Array();
            //var startX = box_w / 2;
            //var startY = box_w / 2;
            var startX = 100;
            var startY = 100;
            var step = box_w;
            var xpos = startX;
            var ypos = startY;
            var newValue = 0;
            for (var index_a = 0; index_a < m; index_a++) {
                data.push(new Array());
                for (var index_b = 0; index_b < n; index_b++) {
                    newValue = Math.round(Math.random() * (100 - 1) + 1);
                    data[index_a].push({
                        time: index_b,
                        value: newValue,
                        x: xpos,
                        y: ypos,
                    });
                    xpos += step;
                }
                xpos = startX;
                ypos += step;
            }
            return data;
        };

        d3.warping.generate_random = function (n, m) {
            var seq1 = []; // timeseries 1
            var seq2 = []; // timeseries 2
            for (var i = 0; i < n; i++) {           // Loop n times
                var newNumber = Math.floor(Math.random() * 20);  // New random number (0-30)
                seq1.push(newNumber);             // Add new number to array
            }
            for (var i = 0; i < m; i++) {           // Loop m times
                var newNumber = Math.floor(Math.random() * 20);  // New random number (0-30)
                seq2.push(newNumber);             // Add new number to array
            }
            return {"seq1": seq1, "seq2": seq2};
        };


        // Distance/cost matrix (n is y-axis and m is x-axis)
        d3.warping.matrix = function (seq1, seq2, data_mat, path) {
            // Define the div for the tooltip
            var div = d3.select("body").append("div")
                .attr("class", "tooltip1")
                .style("opacity", 0);

            var div2 = d3.select("body").append("div")
                .attr("class", "tooltip2")
                .style("opacity", 0);

            var n = seq1.length;
            var m = seq2.length;
            var margin = 100;
            var box_w = (n < 26 && m < 26) ? 25 : 10; // size of the matrix box
            var width = n * (box_w) + margin;
            var height = m * (box_w) + margin;

            //var data = genRandom(n, m, box_w);
            //console.log(data);

            var y = d3.scale.linear().range([30, 0]);
            y.domain(d3.extent(seq1, function (d) {
                return d;
            }));
            var x = d3.scale.linear()
                .range([0, n * box_w]);
            x.domain([0, n]);

            var y2 = d3.scale.linear().range([30, 0]);
            y2.domain(d3.extent(seq2, function (d) {
                return d;
            }));
            var x2 = d3.scale.linear()
                .range([0, m * box_w]);
            x2.domain([0, m]);

            var valueline1 = d3.svg.line()
                .interpolate("cardinal")
                .x(function (d, i) {
                    return x(i);
                })
                .y(function (d, i) {
                    return y(d);
                });

            var valueline2 = d3.svg.line()
                .interpolate("cardinal")
                .y(function (d, i) {
                    return x2(i);
                })
                .x(function (d, i) {
                    return y2(d);
                });

            var values = [].concat.apply([], data_mat);
            var heatmapColor = d3.interpolateWarm;
            //var heatmapColor = d3.interpolateRainbow;

            var min = d3.min(values, function (d) {
                return d.value;
            });
            var max = d3.max(values, function (d) {
                return d.value == Infinity ? 0 : d.value;
            });
            var turnaround = d3.scale.linear().domain([0, 1]).range([1, 0]);
            /*var heatmapColor = d3.scale.linear()
             .domain([d3.min(values, function (d) {
             return d.value;
             }), d3.max(values, function (d) {
             return d.value;
             })])
             .range(["#FFF0F0", "#8b0000"])
             .interpolate(d3.interpolateRainbow);*/

            // create svg element
            var chart = d3.select("#view")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

            var matrix = chart.append("g")
                .attr("class", "matrix");
            //.attr("transform", "translate(100,0)");

            // Create the matrix grid and lines
            var row = matrix.selectAll(".row")
                .data(data_mat)
                .enter().append("g")
                .attr("class", "row");

            var col = row.selectAll(".cell")
                .data(function (d) {
                    return d;
                })
                .enter().append("rect")
                .attr("class", "cell")
                .attr("x", function (d, i) {
                    return d.x;
                })
                .attr("y", function (d, i) {
                    return d.y;
                })
                .attr("width", box_w)
                .attr("height", box_w);


            var text = row.selectAll(".label")
                .data(function (d) {
                    return d;
                })
                .enter().append("text")
                .attr("class", "mylabel")
                .attr("x", function (d) {
                    return d.x + box_w / 2
                })
                .attr("y", function (d) {
                    return d.y + box_w / 2
                });

            var cols = d3.selectAll(".cell")[0];
            var titles = d3.selectAll(".mylabel")[0];

            for (var i = 0; i < cols.length; ++i) {
                var ruut = d3.select(cols[i]);
                var title = d3.select(titles[i]);
                ruut.transition()
                    .delay(function () {
                        return (n < 20 && m < 20) ? i * 100 : i * 5;
                    })
                    .style("fill", function (d) {
                        return d.value == Infinity ? "lightgrey" : heatmapColor(turnaround((d.value - min) / (max - min)));
                        //return heatmapColor((d.value - min)/(max-min));
                    });

                title.transition()
                    .delay(function () {
                        return (n < 20 && m < 20) ? i * 101 : i * 5.5;
                    })
                    .attr("text-anchor", "middle")
                    .attr("dy", ".35em")
                    .attr("font-size", "8px")
                    .attr("font-weight", "normal")
                    .text(function (d) {
                        return (n < 26 && m < 26) ? (d.value == Infinity ? "Inf" : d.value) : "";
                    });

            }
            ;

            col.attr('pointer-events', 'none')
                .on('mouseover', function (d) {
                        //var neigh = d3.selectAll("rect");
                        //console.log(neigh);

                        var neigh = d3.selectAll(".cell").filter(function (c) {
                            return c.x == d.x - box_w && c.y == d.y - box_w || c.x == d.x - box_w && c.y == d.y || c.x == d.x && c.y == d.y - box_w;
                        });

                        if (neigh[0].length > 0) {
                            neigh[0].map(function (d) {
                                d3.select(d).style('fill', '#FFF');
                            });
                        }

                        d3.select(this)
                            .style('fill', '#F6DDCC');

                        div2.transition()
                            .duration(200)
                            .style("opacity", .9);
                        var info_text = d.formula;

                        div2.html(info_text)
                            .style("left", (d3.event.pageX + 20) + "px")
                            .style("top", (d3.event.pageY-10) + "px");

                    }
                )
                .on('mouseout', function (d) {
                    var neigh = d3.selectAll(".cell").filter(function (c) {
                        return c.x == d.x - box_w && c.y == d.y - box_w || c.x == d.x - box_w && c.y == d.y || c.x == d.x && c.y == d.y - box_w;
                    });
                    if (neigh[0].length > 0) {
                        neigh[0].map(function (d) {
                            d3.select(d).style('fill', function (d) {
                                return d.value == Infinity ? "lightgrey" : heatmapColor(turnaround((d.value - min) / (max - min)));
                                //return heatmapColor(d.value);
                            })
                        });
                    }

                    d3.select(this)
                        .style('fill', function (d) {
                            return d.value == Infinity ? "lightgrey" : heatmapColor(turnaround((d.value - min) / (max - min)));
                            //return heatmapColor(d.value);
                        });


                    div2.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
                .style("stroke", '#555')
                .style('fill', '#FFF');

            var ylabels = matrix.append("g")
                .attr("class", "y axis")
                .selectAll(".ylabel")
                .data(seq2)
                .enter().append("text")
                .text(function (d, i) {
                    return i;
                })
                .attr("x", 100)
                .attr("y", function (d, i) {
                    return i * box_w + 100;
                })
                .style("text-anchor", "end")
                .attr("font-size", "8px")
                .attr("transform", "translate(-6," + box_w / 1.5 + ")");

            var xlabels = matrix.append("g")
                .attr("class", "x axis")
                .selectAll(".xlabel")
                .data(seq1)
                .enter().append("text")
                .text(function (d, i) {
                    return i;
                })
                .attr("y", 100)
                .attr("x", function (d, i) {
                    return i * box_w + 100;
                })
                .style("text-anchor", "middle")
                .attr("font-size", "8px")
                .attr("transform", "translate(" + box_w / 2 + ", -6)");

            var line1 = matrix.append("g")
                .attr("class", "linechart");

            var path1 = line1.append("path")
                .attr("class", "line1")
                .attr("d", valueline1(seq1));

            line1.selectAll("dot")
                .data(seq1)
                .enter().append("circle")
                // .attr("r", 0)
                .attr("class", "line1_dot")
                .attr("r", 2.5)
                .style("fill", "blue")
                //.style("fill", "#000")
                .attr("cx", function (d, i) {
                    return x(i);
                })
                .attr("cy", function (d) {
                    return y(d);
                })
                .on('mouseover', function (d) {
                    d3.select(this).attr('r', 4);
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html("Value: " + d)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on('mouseout', function () {
                    d3.select(this).attr('r', 2.5);
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            /*var totalLength = path1.node().getTotalLength();
             path1
             .attr("stroke-dasharray", totalLength + " " + totalLength)
             .attr("stroke-dashoffset", totalLength)
             .transition()
             .duration(function () {
             return (n < 20 && m < 20) ? cols.length * 100 : cols.length * 5;
             })
             .ease("linear")
             .attr("stroke-dashoffset", 0);*/

            line1.attr("transform", "translate(" + (100 + box_w / 2) + "," + 45 + ")");

            var line2 = matrix.append("g")
                .attr("class", "linechart");
            var path2 = line2.append("path")
                .attr("class", "line2")
                .attr("d", valueline2(seq2));

            line2.selectAll("dot")
                .data(seq2)
                .enter().append("circle")
                //.attr("r", 0)
                .attr("class", "line2_dot")
                //.style("fill", "#000")
                .attr("r", 2.5)
                .style("fill", "green")
                .attr("cy", function (d, i) {
                    return x2(i);
                })
                .attr("cx", function (d) {
                    return y2(d);
                })
                .on('mouseover', function (d) {
                    d3.select(this).attr('r', 4);
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html("Value: " + d)
                        .style("left", (d3.event.pageX - 68) + "px")
                        .style("top", (d3.event.pageY - 10) + "px");
                })
                .on('mouseout', function () {
                    d3.select(this).attr('r', 2.5);
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            line1.selectAll("circle.line1_dot")
                .transition()
                .delay(function (d, i) {
                    return (n < 20 && m < 20) ? cols.length * 100 / (seq1.length) * i : cols.length * 5 / (seq1.length) * i;
                })
                .ease("linear")
                .attr("r", 2.5)
                .style("fill", "blue")
                .attr("cx", function (d, i) {
                    return x(i);
                })
                .attr("cy", function (d) {
                    return y(d);
                });

            /*line2.selectAll("circle.line2_dot")
             .transition()
             .delay(function (d, i) {
             return (n < 20 && m < 20) ? cols.length * 100 / (seq2.length) * i : cols.length * 5 / (seq2.length) * i;
             })
             .ease("linear")
             .attr("r", 2.5)
             .style("fill", "green")
             .attr("cy", function (d, i) {
             return x2(i);
             })
             .attr("cx", function (d) {
             return y2(d);
             });*/

            /*var totalLength = path2.node().getTotalLength();

             path2
             .attr("stroke-dasharray", totalLength + " " + totalLength)
             .attr("stroke-dashoffset", totalLength)
             .transition()
             .duration(function () {
             return (n < 20 && m < 20) ? cols.length * 100 : cols.length * 5;
             })
             .ease("linear")
             .attr("stroke-dashoffset", 0);*/

            line2.attr("transform", "translate(" + 45 + "," + (100 + box_w / 2) + ")");

            // Add path

            var pathline = d3.svg.line()
                .x(function (d) {
                    return d[0];
                })
                .y(function (d) {
                    return d[1];
                })
                .interpolate("linear");
            var showpath = matrix.append("g")
                .append("path")
                .attr("class", "pathline")
                .attr("d", pathline(path));

            showpath.style("stroke-width", 2)
                .style("stroke", "black")
                .style("fill", "none");

            var totalLength = showpath.node().getTotalLength();

            showpath
                .attr("stroke-dasharray", totalLength + " " + totalLength)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                .delay(function () {
                    return (n < 20 && m < 20) ? cols.length * 100 + 10 : cols.length * 5 + 10;
                })
                .duration(function () {
                    return (n < 20 && m < 20) ? 6000 : 10000;
                })
                .ease("linear")
                .attr("stroke-dashoffset", 0);

            var arrow = matrix.append("g").append("path")
                .attr("d", d3.svg.symbol().type("circle").size(25)(5, 1))
                .attr("stroke", "none")
                .attr("fill", "none");

            arrow.transition()
                .delay(function () {
                    return (n < 20 && m < 20) ? cols.length * 100 + 10 : cols.length * 5 + 10;
                })
                .duration(function () {
                    return (n < 20 && m < 20) ? 6000 : 10000;
                })
                .attr("stroke", "black")
                .attr("fill", "black")
                .ease("linear")
                .attrTween("transform", translateAlong(showpath.node()));

// Returns an attrTween for translating along the specified path element.
            function translateAlong(pa) {
                var l = pa.getTotalLength();
                var ps = pa.getPointAtLength(0);
                var pe = pa.getPointAtLength(l);
                var angl = Math.atan2(pe.y - ps.y, pe.x - ps.x) * (180 / Math.PI) - 90;
                var rot_tran = "rotate(" + angl + ")";
                return function (d, i, a) {

                    return function (t) {
                        var p = pa.getPointAtLength(t * l);
                        return "translate(" + p.x + "," + p.y + ") " + rot_tran;
                    };
                };
            }


// Create the alignment line charts
            function subtractArrays(ar1, ar2) {
                var ar3 = [];
                for (var i in ar1)
                    ar3.push(Math.abs(ar1[i] - ar2[i]));
                return ar3;
            };

            var min_distance = Math.min(subtractArrays(seq1, seq2));
            var sep = min_distance < 30 ? 60 : 40;
            var n_seq2 = seq2.map(function (d) {
                return (d + sep);
            });
            var align_data = [{id: "seq1", values: seq1}, {
                id: "seq2", values: n_seq2
            }];

            var z = d3.scale.ordinal().range(["blue", "green"]);

            z.domain(align_data.map(function (c) {
                return c.id;
            }));


            var alignment = chart.append("g")
                .attr("class", "linedata")
                .attr("transform", "translate(0," + (100 + box_w / 2) + ")")
                .selectAll(".lines")
                .data(align_data)
                .enter().append("g")
                .attr("class", "alignment");

            alignment.append("path")
                .attr("class", "line")
                .attr("d", function (d) {
                    return valueline2(d.values);
                })
                .style("stroke", function (d) {
                    return z(d.id);
                });

            var alignment_line = d3.svg.line()
                .x(function (d, i) {
                    return y2(d[1]);
                })
                .y(function (d, i) {
                    return x2(d[0]);
                })
                .interpolate("linear");

            function range(start, end) {
                var foo = [];
                for (var i = start; i <= end; i++) {
                    foo.push(i);
                }
                return foo;
            }

            var line_data = [];
            line_data = range(0, n).map(function (e, i, a) {
                return [i, align_data[0].values[i]]
            });
            var line_data2 = [];
            line_data2 = range(0, m).map(function (e, i, a) {
                return [i, align_data[1].values[i]]
            });

            /*for (var i = 0; i < Math.min(n, m); i++) {
             var dat = [line_data[i], line_data2[i]];
             chart.select(".linedata").append("path")
             .attr("class", "line_before")
             .attr("d", function (d) {
             return alignment_line(dat)
             })
             .style("stroke-width", 1)
             .style("stroke", "grey")
             .style("fill", "none");

             }
             ;*/
            var oldmax_x = Math.max.apply(Math, path.map(function (d) {
                return d[0];
            }));
            var oldmax_y = Math.max.apply(Math, path.map(function (d) {
                return d[1];
            }));
            var oldmin_x = Math.min.apply(Math, path.map(function (d) {
                return d[0];
            }));
            var oldmin_y = Math.min.apply(Math, path.map(function (d) {
                return d[1];
            }));
            // array of matches
            var tmp = path.map(function (d) {
                return [(((d[0] - oldmin_x) * ((n - 1) - 0)) / (oldmax_x - oldmin_x)) + 0, (((d[1] - oldmin_y) * ((m - 1) - 0)) / (oldmax_y - oldmin_y)) + 0]
            });

            for (var i = 0; i < tmp.length; i++) {
                var c = tmp[i];
                var dat = [line_data[c[0]], line_data2[c[1]]];

                var test = chart.select(".linedata").append("path")
                    .attr("class", "line_after")
                    .attr("d", function () {
                        return alignment_line(dat)
                    })
                    .style("stroke-width", 1)
                    .style("fill", "none")
                    .style("stroke", function () {
                        //return c[0] == c[1] ? "grey" : "red";
                        return i > 0 && ((c[0] == tmp[i - 1][0]) || (c[1] == tmp[i - 1][1])) ? "red" : "grey";
                    })
                    .style("display", "none");
                test.transition().delay(function () {
                    return (n < 20 && m < 20) ? cols.length * 100 + 10 + i * 6000 / tmp.length : cols.length * 5 + 10 + i * 10000 / tmp.length;
                }).style("display", "initial");

            }
            ;

            /*d3.selectAll(".line_before").transition().style("stroke", "none").delay(function () {
             return (n < 20 && m < 20) ? cols.length * 100 + 10 : cols.length * 5 + 10;
             });*/

            col.transition().delay(function (d) {
                return (n < 20 && m < 20) ? cols.length * 100 + 10 + 6000 : cols.length * 5 + 10 +10000;
            }).attr('pointer-events', 'auto');


            var dims_mat = d3.select(".matrix").node().getBBox();
            var dims_line = d3.select(".linedata").node().getBBox();


//d3.select(".linedata").attr("x", 0);
            d3.select(".linedata").attr("transform", "translate(" + (-dims_line.x + dims_line.width / 2 + 50) + "," + (100 + box_w / 2) + ")");
//set the width
//d3.select("svg").attr("width", (-dims_line.x + dims_mat.width + dims_line.width + 250));
            matrix.attr("transform", "translate(" + (-dims_line.x + dims_line.width + 10) + ",0)");
            d3.select("svg").attr("width", (-dims_line.x + dims_mat.width + dims_line.width + 250));
            d3.select("svg").attr("height", Math.max(dims_line.height, dims_mat.height) + 100);


        }


    }
    ()
)
;



