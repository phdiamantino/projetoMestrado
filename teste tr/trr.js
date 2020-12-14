const MARGIN3 = {LEFT:30, RIGHT:40, TOP:20, BOTTOM:30}
const WIDTH3 = 700 - MARGIN3.LEFT - MARGIN3.RIGHT
const HEIGHT3 = 300 - MARGIN3.TOP - MARGIN3.BOTTOM

var svgTR = d3.select("#themeRiver").append("svg")
.attr("width", WIDTH3 + MARGIN3.LEFT + MARGIN3.RIGHT)
.attr("height", HEIGHT3 + MARGIN3.TOP + MARGIN3.BOTTOM)
.append("g")
.attr("transform", "translate(" + MARGIN3.LEFT + "," + MARGIN3.TOP + ")");

var format = d3.timeParse("%Y-%m-%d")   



  var graph = d3.csv("excomment_sentiments.csv").then(function(data) {
        data.forEach(function(d) {
            d.date = format(d.date);
            d.value = +d.value;
        });

        // Versoes
        var nest = d3.nest()
            .key(d=> d.reference)
            .entries(data) 
        const keys  =[]
        for (i in nest){ keys.push(nest[i].key) }
        console.log(keys)

        var nest2 = d3.nest()
            .key(d=> d.sentiment)
            .entries(data) 
        const keys2  =[]
        for (i in nest2){ keys2.push(nest2[i].key) }
        console.log(keys2)

                //stack the data?
        var stack = d3.stack()
            .keys(keys2)
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetWiggle);
        var stackedData =stack(data)
    
            console.log(stackedData)

            // Add X & Y axis
        var x = d3.scaleOrdinal().domain(data, d=> d.date).range([ 0, WIDTH3 ]);
            svgTR.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + HEIGHT3 + ")")
                .call(d3.axisBottom(x));
        var y = d3.scaleLinear()
            .domain([d3.min(stackedData, l => d3.min(l, d => d[0])),
                     d3.max(stackedData, l => d3.max(l, d => d[1]))])
            .range([ HEIGHT3, 0 ]);
                svgTR.append("g")
                    .attr("class", "y axis")
                    .call(d3.axisLeft(y));

        // color palette
        var color = d3.scaleOrdinal(d3.schemeCategory10)
                .domain(['red', 'green', 'blue'])
                .range(['#ff0000', '#00ff00', '#0000ff']);
    

        // Show the areas
        svgTR.selectAll("mylayers")
            .data(stackedData)
            .enter()
            .append("path")
            .style("fill", data, d => color(d.sentiment))
            .style("stroke-width",0.3)
            .attr("d", d3.area()
            .x(d => x(new Date(parseDate(d.data.date))))
            .y0(d => y(d[0]))
            .y1(d => y(d[1]))
            )

})