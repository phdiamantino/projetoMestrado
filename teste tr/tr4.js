const MARGIN3 = {LEFT:30, RIGHT:40, TOP:20, BOTTOM:30}
const WIDTH3 = 700 - MARGIN3.LEFT - MARGIN3.RIGHT
const HEIGHT3 = 300 - MARGIN3.TOP - MARGIN3.BOTTOM

chart("excomment_sentiments.csv", "blue");
var datearray = [];
var colorrange = [];

function chart(csvpath, color) {
    if (color == "blue") {
        colorrange = ["#045A8D", "#2B8CBE", "#74A9CF" ];}
    else if (color == "pink") {
        colorrange = ["#980043", "#DD1C77", "#DF65B0"];} 
    else if (color == "orange") {
        colorrange = ["#B30000", "#E34A33", "#FC8D59"];}
    strokecolor = colorrange[0];

// Add SVG
var svgTR = d3.select("#themeRiver").append("svg")
    .attr("width", WIDTH3 + MARGIN3.LEFT + MARGIN3.RIGHT)
    .attr("height", HEIGHT3 + MARGIN3.TOP + MARGIN3.BOTTOM)
    .append("g")
    .attr("transform", "translate(" + MARGIN3.LEFT + "," + MARGIN3.TOP + ")");

    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "remove")
        .style("position", "absolute")
        .style("z-index", "20")
        .style("visibility", "hidden")
        .style("top", "30px")
        .style("opacity", 0)
        .style("left", "55px")
        .style("font-size", 17);

var format = d3.timeParse("%Y-%m-%d")   


var color = d3.scaleOrdinal()
        .range(colorrange);


  var graph = d3.csv(csvpath).then(function(data) {
        data.forEach(function(d) {
            d.date = format(d.date);
            d.value = +d.value;
        });

    var nest2 = d3.nest()
        .key(d=> d.sentiment)
        .entries(data) 
    const sentimentKeys  =[]
    for (i in nest2){ sentimentKeys.push(nest2[i].key)}
    console.log(nest2)
    console.log(sentimentKeys)


    // Stack 
    var stack = d3.stack()
        .keys(sentimentKeys)
        .value(d=>d.data.values.score)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetWiggle);
    console.log(stack(nest2))
    var stackedData = stack(nest2)


    // Add X & Y axis
    var x = d3.scaleTime()
            .domain(d3.extent(data, d=> d.date))
            .range([0, WIDTH3 ]);
        svgTR.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + HEIGHT3 + ")")
            .call(d3.axisBottom(x));

    var y = d3.scaleLinear()
                y.domain([d3.min(stackedData, function(layer) {
                  return d3.min(layer, function(d) {
                      return d[0] + d[1];
                  })
              }), d3.max(stackedData, function(layer) {
                  return d3.max(layer, function(d) {
                      return d[0] + d[1];
                  })
              })])
            /*.domain([d3.min(stackedData, l => d3.min(l, d => d[0])),
                    d3.max(stackedData, l => d3.max(l, d => d[1]))])*/
            .range([HEIGHT3, 0]);
        svgTR.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(y));
        svgTR.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + WIDTH3 + ", 0)")
            .call(d3.axisRight(y));

    var area = d3.area()
        //.x(d =>  console.log(x(new Date(d.data.date))))
        .x(d => x(new Date(d.data.key)))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]))

        // Exbibe as áreas
        svgTR.selectAll(".layer")
            .data(stackedData).enter()
            .append("path")
            .style("stroke-width",0.3)
            .attr("d", area)
            .style("fill", (data, d => color(d.sentiment)))
            //.style("fill", ((d,i) => color[i]))


            // Elementos de interação
        svgTR.selectAll(".layer")
            .attr("opacity", 1)
            .on("mouseover", function(d, i) {
                svgTR.selectAll(".layer").transition()
                .duration(250)
                .attr("opacity", function(d, j) {return j != i ? 0.6 : 1;})
            })
        
        .on("mousemove", function(d, i) {
                mousex = d3.mouse(this);
                mousex = mousex[0];
                var invertedx = x.invert(mousex);
                invertedx = invertedx.getMonth() + invertedx.getDate();
                var selected = (d);
                console.log(new Date(selected[0].data.key));
                for (var k = 0; k < selected.length; k++) {
                    datearray[k] = new Date(selected[k].data.key)
                    mid = datearray[k]
                    datearray[k] = mid.getMonth() + mid.getDate();
                }
                console.log(datearray);
                mousedate = datearray.indexOf(invertedx);
                console.log(d[mousedate]);
                pro = d[mousedate].data[d.key];
                d3.select(this)
                    .classed("hover", true)
                    .attr("stroke", strokecolor)
                    .attr("stroke-width", "0.5px"), 
                    tooltip.html( "<p>" + d.key + "<br>" + pro + "</p>" ).style("visibility", "visible")
                    })

        .on("mouseout", function(d, i) {
            svgTR.selectAll(".layer")
              .transition()
              .duration(250)
              .attr("opacity", "1");
              d3.select(this)
              .classed("hover", false)
              .attr("stroke-width", "0px"), tooltip.html( "<p>" + d.key + "<br>" + pro + "</p>" ).style("visibility", "hidden");
        })
            
          var vertical = d3.select("#themeRiver")
                .append("div")
                .attr("class", "remove")
                .style("position", "absolute")
                .style("z-index", "19")
                .style("width", "1px")
                .style("height", "380px")
                .style("top", "10px")
                .style("bottom", "30px")
                .style("left", "0px")
                .style("background", "#fff");
        
          d3.select("#themeRiver")
              .on("mousemove", function(){  
                 mousex = d3.mouse(this);
                 mousex = mousex[0] + 5;
                 vertical.style("left", mousex + "px" )})
              .on("mouseover", function(){  
                 mousex = d3.mouse(this);
                 mousex = mousex[0] + 5;
                 vertical.style("left", mousex + "px")});

})
}