const MARGIN3 = {LEFT:30, RIGHT:40, TOP:20, BOTTOM:30}
const WIDTH3 = 700 - MARGIN3.LEFT - MARGIN3.RIGHT
const HEIGHT3 = 300 - MARGIN3.TOP - MARGIN3.BOTTOM

    var format = d3.timeParse("%m/%d/%y");
    var datearray = [];

        var tooltip = d3.select("body")
            .append("div")
            .attr("class", "remove")
            .style("position", "absolute")
            .style("z-index", "20")
            .style("visibility", "hidden")
            .style("top", "30px")
            .style("left", "55px");

           
  var graph = d3.csv("data.csv").then(function(data) {
        data.forEach(function(d) {
            d.date = format(d.date);
            d.value = +d.value;
        });
    
    var nested_data = d3.nest()
          .key(function(d) { return d.year; })
          .entries(data);
    
    //console.log(nested_data);
    
    var mqpdata = nested_data.map(function(d){
      var obj = {
        month: new Date(d.key, 0, 1)
      }
      
      d.values.forEach(function(v){
        obj[v.elec_type] = v.paila;
        console.log(d.paila)
      })
      
      return obj;
    })
    
    buildStreamGraph(mqpdata);
    
  })
  
  
  function buildStreamGraph(mqpdata) {
  var data = mqpdata;
    
  
  var stack = d3.stack()
      .keys(["AE", "AREN", "BBT", "BC", "BME", "CE", "CH", "CM", "CS", "ECE", "EV", "HU", "ID", "IE", "IMGD", "MA", "ME", "MG", "PH", "RBE", "SSPS"])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetWiggle);
  
  var series = stack(data);
  
  var width = 850,
      height = 500;
  
  var x = d3.scaleTime()
      .domain(d3.extent(data, function(d){ return d.month; }))
      .range([100, width]);
  
  // setup axis
  var xAxis = d3.axisBottom(x);
    
  var y = d3.scaleLinear()
      .domain([0, d3.max(series, function(layer) { return d3.max(layer, function(d){ return d[0] + d[1];}); })])
      .range([height/2, -200]);
  
  var color = d3.scaleLinear()
      .range(["#51D0D7", "#31B5BB"]);
  
  var color = d3.scaleOrdinal(d3.schemeCategory20);
  
  var area = d3.area()
      .x(function(d) { console.info('in area function', d); return x(d.data.month); })
      .y0(function(d) { return y(d[0]); })
      .y1(function(d) { return y(d[1]); })
      .curve(d3.curveBasis);
  
    var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip");
    
  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);
  
  svg.selectAll("path")
      .data(series)
      .enter().append("path")
      .attr("d", area)
      .style("fill", function() { return color(Math.random()); })
      .on('mouseover', function(d){      
        d3.select(this).style('fill',d3.rgb( d3.select(this).style("fill") ).brighter());
            d3.select("#major").text(d.key);
    tooltip.transition()
                 .duration(700)
                 .style("opacity", 1);
                tooltip.html("Cantidad: " + "#familiares")
                 .style("left", (d3.event.pageX + 5) + "px")
                 .style("top", (d3.event.pageY - 28) + "px");
      })
      .on('mouseout', function(d){      
        d3.select(this).style('fill', 
           d3.rgb( d3.select(this).style("fill") ).darker());
           d3.select("#major").text("Mouse over");
    tooltip.transition()
                 .duration(500)
                 .style("opacity", 0);
  })
  
  svg.append("g")
              .attr("class", "axis axis--x")
              .attr("transform", "translate(0," + (height) + ")")
              .call(xAxis);  
    
    var xAxisGroup = svg.append("g").call(xAxis);
  }
