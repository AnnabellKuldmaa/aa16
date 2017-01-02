if (!d3) {
    throw "d3 wasn't included!";
}
(function () {
    d3.warping = {};

    // HELPER FUNCTIONS
    genRandom = function(n, m, box_w){
    	var data = new Array();
    	//var startX = box_w / 2;
    	//var startY = box_w / 2;
    	var startX = 100;
    	var startY = 100;
    	var stepX = box_w;
    	var stepY = box_w;
    	var xpos = startX;
    	var ypos = startY;
    	var newValue = 0;
    	var count = 0;
    	for (var index_a = 0; index_a < m; index_a++){
        	data.push(new Array());
        		for (var index_b = 0; index_b < n; index_b++){
            		newValue = Math.round(Math.random() * (100 - 1) + 1);
            		data[index_a].push({ 
                                	time: index_b, 
                                	value: newValue,
                                	x: xpos,
                                	y: ypos,
                                	count: count
                            	});
            		xpos += stepX;
            		count += 1;
        		}
        	xpos = startX;
        	ypos += stepY;
    	}
    	return data;
    };

    generate_random = function (n, m){
		var d1 = []; // timeseries 1
		var d2 = []; // timeseries 2
		for (var i = 0; i < n; i++) {           // Loop n times
    		var newNumber = Math.floor(Math.random() * 20);  // New random number (0-30)
    		d1.push(newNumber);             // Add new number to array
		}
		for (var i = 0; i < m; i++) {           // Loop m times
    		var newNumber = Math.floor(Math.random() * 20);  // New random number (0-30)
    		d2.push(newNumber);             // Add new number to array
		}
		return {"d1": d1, "d2": d2};
	};

	// generate matrix with zeros
	zero2D = function (rows, cols) {
  		var array = [], row = [];
  		while (cols--) row.push(0);
  		while (rows--) array.push(row.slice());
  		return array;
	};
	// Distance/cost matrix (n is y-axis and m is x-axis)
	d3.warping.matrix = function(n, m){
		var margin = 400;
		var box_w = 25; // size of the matrix box
        var width = n*(box_w) + margin;
        var height = m*(box_w) + margin;
        
        var data = genRandom(n, m, box_w);
        //var dat = zero2D(n, m);
        var dat = generate_random(n, m);
        var d1 = dat.d1; //n
		var d2 = dat.d2; //m
		
        var y = d3.scale.linear().range([30, 0]);
		y.domain(d3.extent(d1, function(d) { return d; }));
        var x = d3.scale.linear()
        	.range([0, n*box_w]);
        x.domain([0,n]);
        
        var y2 = d3.scale.linear().range([30, 0]);
		y2.domain(d3.extent(d2, function(d) { return d; }));
        var x2 = d3.scale.linear()
        	.range([0, m*box_w]);
        x2.domain([0, m]);

		var xAxis = d3.svg.axis().scale(x)
    		.orient("bottom").ticks(n);

		var valueline1 = d3.svg.line()
    		.x(function(d,i) { return x(i); })
    		.y(function(d,i) { return y(d); });

        var valueline1_1 = d3.svg.line()
    		.y(function(d,i) { return x(i); })
    		.x(function(d,i) { return y(d); });

    	var valueline2 = d3.svg.line()
    		.y(function(d,i) { return x2(i); })
    		.x(function(d,i) { return y2(d); });
        
		var values = [].concat.apply([], data);
		var heatmapColor = d3.scale.linear()
    		.domain([d3.min(values, function(d) { return d.value; }), d3.max(values, function(d) { return d.value; })])
   			.range(["#FFF0F0", "#8b0000"]);

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
				.data(data)
				.enter().append("g")
				.attr("class", "row");
		var col = row.selectAll(".cell")
				.data(function(d){return d;})
				.enter().append("rect")
				.attr("class", "cell")
				.attr("x", function(d) {return d.x;})
				.attr("y", function(d) {return d.y;})
				.attr("width", box_w)
				.attr("height", box_w)
				.on('mouseover', function() {
                    d3.select(this)
                        .style('fill', '#FFF');
                 })
                 .on('mouseout', function() {
                    d3.select(this)
                        .style('fill', function(d){return heatmapColor(d.value);});
                 })
                 .on('click', function() {
                    console.log(d3.select(this));
                 })
				.style("fill", function(d){return heatmapColor(d.value);})
				.style("stroke", '#555');

		var text = row.selectAll(".label")
        	.data(function(d) {return d;})
      		.enter().append("text")
        		.attr("x", function(d) { return d.x + box_w/2 })
        		.attr("y", function(d) { return d.y + box_w/2 })
        		.attr("text-anchor","middle")
        		.attr("dy",".35em")
        		.text(function(d) { return d.value });

        var ylabels = matrix.append("g")
        	.attr("class", "y axis")
        	.selectAll(".ylabel")
        	.data(d2)
        	.enter().append("text")
        	.text(function(d) {return d;})
        	.attr("x", 100)
        	.attr("y", function(d,i) {return i*box_w+100;})
        	.style("text-anchor", "end")
        	.attr("transform", "translate(-6," + box_w/1.5 + ")");

        var xlabels = matrix.append("g")
        	.attr("class", "x axis")
        	.selectAll(".xlabel")
        	.data(d1)
        	.enter().append("text")
        	.text(function(d) {return d;})
        	.attr("y", 100)
        	.attr("x", function(d,i){return i*box_w + 100;})
        	.style("text-anchor", "middle")
        	.attr("transform", "translate("+ box_w/2 + ", -6)");

        var line1 = matrix.append("g")
        	.attr("class", "linechart");
        line1
        	.append("path")
        	.attr("class", "line1")
        	.attr("d", valueline1(d1));
        line1.selectAll("dot")
        	.data(d1)
      		.enter().append("circle")
        		.attr("r", 1.5)
        		.attr("class", "line1_dot")
        		.attr("cx", function(d,i) { return x(i); })
        		.attr("cy", function(d) { return y(d); });
        line1.attr("transform", "translate(" + (100+box_w/2) + "," + 45 + ")" );
        //line1.append("g")
       // .attr("class", "x axis")
       // .call(xAxis);
        var line2 = matrix.append("g")
        	.attr("class", "linechart");
        line2
        	.append("path")
        	.attr("class", "line2")
        	.attr("d", valueline2(d2));
        line2.selectAll("dot")
        	.data(d2)
      		.enter().append("circle")
        		.attr("r", 1.5)
        		.attr("class", "line2_dot")
        		.attr("cy", function(d,i) { return x2(i); })
        		.attr("cx", function(d) { return y2(d); });
        line2.attr("transform", "translate(" + 45 + "," + (100+box_w/2) + ")" );
        
        function subtractArrays(ar1, ar2){
    		var ar3 = [];
    		for(var i in ar1)
        		ar3.push(Math.abs(ar1[i] - ar2[i]));
    		return ar3;
		} 
		var min_distance = Math.min(subtractArrays(d1, d2));
		var sep = min_distance < 30 ? 50 : 20;
        var align_data = [{id: "d1", "values": d1}, {id: "d2", "values": d2.map(function(d) {return (d+sep);})}];
        var z = d3.scale.ordinal().range(["blue", "green"]);

        z.domain(align_data.map(function(c) { return c.id; }));
        
        // Create the line charts
        var alignment = chart.append("g")
                .attr("class", "linedata")
        		.attr("transform", "translate(0," + (100+box_w/2)+ ")")
        		.selectAll(".lines")
    			.data(align_data)
    			.enter().append("g")
        		.attr("class", "alignment");
        		//.attr("transform", "translate(50," + (100+box_w/2)+ ")");
        
        alignment.append("path")
        	.attr("class", "line")
        	.attr("d", function(d){return valueline2(d.values);})
        	.style("stroke", function(d) { return z(d.id); });
        
        var alignment_line = d3.svg.line()
    		.x(function(d,i){return y2(d[1]);})
    		.y(function(d,i){return x2(d[0]);})
    		.interpolate("linear");
       
        function range(start, end) {
    		var foo = [];
    		for (var i = start; i <= end; i++) {
        		foo.push(i);
    		}
    		return foo;
		}
        var line_data = [];
        line_data = range(0,n).map(function(e, i, a) {
  			return [e, align_data[0].values[i]]
		});
		var line_data2 = [];
        line_data2 = range(0,m).map(function(e, i, a) {
  			return [e, align_data[1].values[i]]
		});
		
		for (var i = 0; i < Math.min(n,m); i++){
			var dat = [line_data[i], line_data2[i]];
			chart.select(".linedata").append("path")
    			.attr("d", function(d) { return alignment_line(dat)})
    			//.attr("transform", "translate(0,0)")
    			.style("stroke-width", 1)
            	.style("stroke", "grey")
            	.style("fill", "none");

		};
        var dims_mat = d3.select(".matrix").node().getBBox();
        var dims_line = d3.select(".linedata").node().getBBox()
       
        
        //d3.select(".linedata").attr("x", 0);
        d3.select(".linedata").attr("transform", "translate(" + (-dims_line.x + dims_line.width/2+50) + "," + (100+box_w/2)+ ")")
		//set the width
		//d3.select("svg").attr("width", (-dims_line.x + dims_mat.width + dims_line.width + 250));
		matrix.attr("transform", "translate("+ (-dims_line.x + dims_line.width + 10) + ",0)");
		d3.select("svg").attr("width", (-dims_line.x + dims_mat.width + dims_line.width + 250));


	}


}());



