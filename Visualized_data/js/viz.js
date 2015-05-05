var custom_bubble_chart = (function(d3, CustomTooltip) {
  "use strict";
 
  var width = 1400,
      height = 700,
      tooltip = CustomTooltip("gates_tooltip", 240),
      layout_gravity = -0.01,
      damper = 0.1,
      nodes = [],
      vis, force, circles, 
	  radius_scale, radius_scale_costly, radius_scale_cheap, radius_scale_moderate, radius_scale_expensive,
	  cheap = false, costly = false, moderate = false,expensive =false;
 
  var center = {x: width / 2, y: height / 2};
 
  var cluster_centers = {
      "American": {x: width / 4 - 100, y: height / 2-100 },
      "Seafood": {x: width / 3 + 100, y: height / 2-100},
      "Pubs": {x: width / 2 + 100, y: height / 2-100},
	  "FastFood": {x: 2.3* width / 3, y: height / 2-100},
      "Buffets and Dinners": {x: width / 4 - 100, y: height / 2+100},
      "Mexican": {x: width / 3 + 100, y: height / 2+100},
      "Italian": {x: width / 2 + 100, y: height / 2+100},
	  "Asian": {x: 2.3* width / 3, y: height / 2+100}	
    };
 
  var fill_color = d3.scale.ordinal()
                  .domain(["0", "1", "2","3"])
                  .range(["red","green","blue","yellow"]);
				  

  var cluster_names = ["Berry Hill","Pineville","Matthews","Mallard Creek"];
 
  function custom_chart(data) {
    var max_amount = d3.max(data, function(d) { return parseInt(d.numb_of_business, 10); } );
    radius_scale = d3.scale.pow().exponent(0.5).domain([0, max_amount]).range([2, 60]);
	
    var max_costly_amount = d3.max(data, function(d) { return parseInt(d.costly, 10); } );
    radius_scale_costly = d3.scale.pow().exponent(0.5).domain([0, max_costly_amount ]).range([2, 60]);
	
    var max_cheap_amount = d3.max(data, function(d) { return parseInt(d.cheap, 10); } );
    radius_scale_cheap = d3.scale.pow().exponent(0.5).domain([0, max_cheap_amount ]).range([2, 60]);
	
    var max_moderate_amount = d3.max(data, function(d) { return parseInt(d.moderate, 10); } );
    radius_scale_moderate = d3.scale.pow().exponent(0.5).domain([0, max_moderate_amount ]).range([2, 60]);
	
	var max_expensive_amount = d3.max(data, function(d) { return parseInt(d.expensive, 10); } );
    radius_scale_expensive = d3.scale.pow().exponent(0.5).domain([0, max_expensive_amount ]).range([2, 60]);
	
	//create node objects from original data
    //that will serve as the data behind each
    //bubble in the vis, then add each node
    //to nodes to be used later
	
	// FOR EACH BUBLE ON WEB PAGE 
    data.forEach(function(d){
      var node = {
        id: d.id,
        radius: radius_scale(parseInt(d.numb_of_business, 10)),   // how big the bubble should look
		cheap_radius: radius_scale_cheap(parseInt(d.cheap, 20)), 
		moderate_radius: radius_scale_moderate(parseInt(d.moderate, 20)), 
		costly_radius: radius_scale_costly(parseInt(d.costly, 20)), 
		expensive_radius: radius_scale_expensive(parseInt(d.expensive, 20)), 
        numb_of_business: d.numb_of_business,
        name:cluster_names[d.cluster],
        cheap: d.cheap,
		moderate: d.moderate,
		costly: d.costly,
		expensive: d.expensive,
		checkin_count: d.checkin_count,
        category: d.category,
		ratio: d.checkin_count /d.numb_of_business ,
		cluster: d.cluster,
        x: Math.random() * 900,
        y: Math.random() * 800
      };
      nodes.push(node);
    });
 
    nodes.sort(function(a, b) {return b.numb_of_business- a.numb_of_business; });
 
    vis = d3.select("#vis").append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("id", "svg_vis");
 
    circles = vis.selectAll("circle")
                 .data(nodes, function(d) { return d.id ;}); // uniquness of bubble 
 
    circles.enter().append("circle")
      .attr("r", 0)
      .attr("fill", function(d) { return fill_color(d.cluster) ;})
      .attr("stroke-width", 2)
      .attr("stroke", function(d) {return d3.rgb(fill_color(d.cluster)).darker();})
      .attr("id", function(d) { return  "bubble_" + d.id; })
      .on("mouseover", function(d, i) {show_details(d, i, this);} )
      .on("mouseout", function(d, i) {hide_details(d, i, this);} );
 
    circles.transition().duration(2000).attr("r", function(d) { return d.radius; });
 
  } //end of custome chart
 
  function charge(d) {
    return -Math.pow(d.radius, 2) /5;
  }
 
  function start() {
    force = d3.layout.force()
            .nodes(nodes)
            .size([width, height]);
  }

 
  function display_group_all() {
    force.gravity(layout_gravity)
         .charge(charge)
         .friction(0.9)
         .on("tick", function(e) {
            circles.each(move_towards_center(e.alpha))
                   .attr("cx", function(d) {return d.x;})
                   .attr("cy", function(d) {return d.y;});
			circles.transition().duration(100).attr("r", function(d) { return d.radius; });	   
         });
		 
    force.start();
    hide_categories();
  }
 
  function move_towards_center(alpha) {
    return function(d) {
      d.x = d.x + (center.x - d.x) * (damper + 0.02) * alpha;
      d.y = d.y + (center.y - d.y) * (damper + 0.02) * alpha;
    };
  }
 
  function display_by_cluster() {
    force.gravity(layout_gravity)
         .charge(charge)
         .friction(0.9)
        .on("tick", function(e) {
          circles.each(move_towards_cluster(e.alpha))
                 .attr("cx", function(d) {return d.x;})
                 .attr("cy", function(d) {return d.y;});
		circles.transition().duration(100).attr("r", function(d) { return d.radius; });
        });
		cheap = costly = moderate = expensive = false;
    force.start();
    display_categories();
  }
 
  function move_towards_cluster(alpha) {
    return function(d) {
      var target = cluster_centers[d.category];
      d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
    };
  }
 ///////////////////////////////////////////////////////////////////
 function display_by_costly() {
    force.gravity(layout_gravity)
         .charge(charge)
         .friction(0.9)
        .on("tick", function(e) {
          circles.each(move_towards_cluster(e.alpha))
                 .attr("cx", function(d) {return d.x;})
                 .attr("cy", function(d) {return d.y;});
				 circles.transition().duration(100).attr("r", function(d) { return d.costly_radius; });
        });
		costly = true;
		cheap = moderate = expensive = false;
    force.start();
    display_categories();
  }
 
function display_by_cheap() {
    force.gravity(layout_gravity)
         .charge(charge)
         .friction(0.9)
        .on("tick", function(e) {
          circles.each(move_towards_cluster(e.alpha))
                 .attr("cx", function(d) {return d.x;})
                 .attr("cy", function(d) {return d.y;});
				 circles.transition().duration(100).attr("r", function(d) { return d.cheap_radius; });
        });
		cheap = true;
		costly = moderate = expensive = false;
    force.start();
    display_categories();
  }
  
  function display_by_moderate() {
    force.gravity(layout_gravity)
         .charge(charge)
         .friction(0.9)
        .on("tick", function(e) {
          circles.each(move_towards_cluster(e.alpha))
                 .attr("cx", function(d) {return d.x;})
                 .attr("cy", function(d) {return d.y;});
				 circles.transition().duration(100).attr("r", function(d) { return d.moderate_radius; });
        });
		moderate = true;
		cheap = costly = expensive = false;
    force.start();
    display_categories();  
  }
   function display_by_expensive() {
    force.gravity(layout_gravity)
         .charge(charge)
         .friction(0.9)
        .on("tick", function(e) {
          circles.each(move_towards_cluster(e.alpha))
                 .attr("cx", function(d) {return d.x;})
                 .attr("cy", function(d) {return d.y;});
				 circles.transition().duration(100).attr("r", function(d) { return d.expensive_radius; });
        });
		expensive = true;
		cheap = costly = moderate = false;
    force.start();
    display_categories();  
  }
 
  function display_categories() {
      var cat_x = {"American": width / 4 - 100, "Seafood":  width / 3 + 100, "Pubs": width / 2 + 100, "FastFood":  2.4* width / 3,"Buffets and Dinners": width / 4 - 100, "Mexican":  width / 3 + 100, "Italian": width / 2 + 100, "Asian":  2.4* width / 3};
	  var cat_y = {"American": 60, "Seafood":  60, "Pubs":60, "FastFood":  60 ,"Buffets and Dinners": 370, "Mexican":  370, "Italian": 370, "Asian":  370};
      var cat_data = d3.keys(cat_x);
      var cat= vis.selectAll(".cat")
                 .data(cat_data);
 
      cat.enter().append("text")
                   .attr("class", "cat")
                   .attr("x", function(d) { return cat_x[d]; }  )
                   .attr("y", function(d) { return cat_y[d]; } )
                   .attr("text-anchor", "middle")
                   .text(function(d) { return d;});
 
  }
 
  function hide_categories() {
      var cat = vis.selectAll(".cat").remove();
  }
 
 
  function show_details(data, i, element) {
    d3.select(element).attr("stroke", "black");
    var content = "<span class=\"name\">Cluster Name:</span><span class=\"value\"> " + data.name + "</span><br/>";
    content +="<span class=\"name\">Number Of Businesses:</span><span class=\"value\"> " + data.numb_of_business + "</span><br/>";
	content +="<span class=\"name\">Total Checkins:</span><span class=\"value\"> " + data.checkin_count + "</span><br/>";
	if(cheap){
	content +="<span class=\"name\">Number of Cheap Restaurants:</span><span class=\"value\"> " + data.cheap+ "</span>";
	}	else if (costly)
	{content +="<span class=\"name\">Number of Costly Restaurants:</span><span class=\"value\"> " + data.costly+ "</span>";
	}	else if (moderate)
	{content +="<span class=\"name\">Number of Moderate Restaurants:</span><span class=\"value\"> " + data.moderate+ "</span>";
	}	else if (expensive)
	{content +="<span class=\"name\">Number of Expensive Restaurants:</span><span class=\"value\"> " + data.expensive+ "</span>";
	}
    tooltip.showTooltip(content, d3.event);
  }
 
  function hide_details(data, i, element) {
    d3.select(element).attr("stroke", function(d) { return d3.rgb(fill_color(d.cluster)).darker();} );
    tooltip.hideTooltip();
  }
 
  var my_mod = {};
  my_mod.init = function (_data) {
    custom_chart(_data);
	//custom_chart_price(_data);
    start();
  };
  my_mod.toggle_state = function (_data) {
    custom_chart(_data);
	alert("inside toggle_state");
    start();
  };
 
  my_mod.display_all = display_group_all;
  my_mod.display_cluster = display_by_cluster;
  my_mod.display_costly = display_by_costly;
  my_mod.display_cheap = display_by_cheap;
  my_mod.display_moderate = display_by_moderate;
  my_mod.display_expensive = display_by_expensive;
  
  my_mod.toggle_view = function(view_type) {
    if (view_type == 'cluster') {
      display_by_cluster();
    } 
	 else if (view_type == 'costly'){
		 display_by_costly();
	 } 
	 else if (view_type == 'cheap'){
		 display_by_cheap();
	 } 
	 else if (view_type == 'moderate'){
		 display_by_moderate();
	 }
	 else if (view_type == 'expensive'){
		 display_by_expensive();
	 }
	else {
      display_group_all();
      }
    };
 
  return my_mod;
})(d3, CustomTooltip);