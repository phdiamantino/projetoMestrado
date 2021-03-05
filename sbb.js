const MARGIN2 = {LEFT:10, RIGHT:10, TOP:10, BOTTOM:10}
const WIDTH2 = 650 - MARGIN2.LEFT - MARGIN2.RIGHT
const HEIGHT2 = 400 - MARGIN2.TOP - MARGIN2.BOTTOM

// Àrea do SB
const svgSB = d3.select("#sumburst").append("svg") 
        .attr("width", WIDTH2 + MARGIN2.LEFT + MARGIN2.RIGHT)
        .attr("height",HEIGHT2 + MARGIN2.TOP + MARGIN2.BOTTOM)
    .append("g")
        .attr("transform", `translate(${WIDTH2 /2}, ${HEIGHT2 /2})`)

    const formatNumber = d3.format(',d');
    const partition = d3.partition();

    const xSB = d3.scaleLinear()
        .range([0, 2 * Math.PI])
    
    radius = (Math.min(WIDTH2, HEIGHT2) / 1.8);
    const ySB = d3.scaleSqrt()
        .range([0, radius]);

    const arc = d3.arc()
        .startAngle(d=> Math.max(0, Math.min(2 * Math.PI, xSB(d.x0))) )
        .endAngle(d=> Math.max(0, Math.min(2 * Math.PI, xSB(d.x1))) )
        .innerRadius(d=> Math.max(0, ySB(d.y0)) )
        .outerRadius(d=> Math.max(0, ySB(d.y1)) );
    
    // cria a hierarquia
    function toTree(files) {
        const root = {};
        // Create structure where folder name is also a key in parent object
        for (const {key, value} of files) {
            key.match(/[^\/]+/g).reduce((acc, folder) => {
                if (!acc.folders) acc.folders = {};
                return acc.folders[folder] || (acc.folders[folder] = { key: folder, value: null }); 
            }, root).value = value;
        }
        // Optional: replace folders object by folders array, recursively
        (function recurse(node) {
            if (!node.folders) return;
            node.children = Object.values(node.folders);
            node.children.forEach(recurse);
        })(root);
        return root;
    }

    var tooltipSB = svgSB.append("text")
        .attr("font-size", 12)
        .attr("fill", "#000")
        .attr("fill-opacity", 0)
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + 0 + "," + (10 + HEIGHT2/2)  +")")
        .style("pointer-events", "none");


    d3.json("data/rm_technical_debt.json").then(function(data) {
        data = data.slice(0,754) // usa apenas o repositorio jUnit, comentar se quiser testar todo repositório
        const tm = data.length  //tamanho do db

        const arq = d3.nest()
            .key(d=> d.filename)
            .rollup(v=> d3.sum(v, d=> d.debts.length))
            //.rollup(v => v.length)
        .entries(data)
        console.log(arq)
        console.log(arq[0].key.split("/")[0])
        console.log(toTree(arq))
        const arqJson = toTree(arq)

    root = d3.hierarchy(arqJson)
          .sum(d=>+d.value);
       console.log(root)

    // Transforma os dados em um json Hierarquico
       function arcVisible(d) {
        return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    //Legenda
    function mouseover(d) {
        tooltipSB.text((d.children ? d : d.parent).data.key + ": " +
            d.value + " debt" +
            (d.value > 1 ? "s" : ""))
            .style("font-family", "Verdana")
            .style("font-size", "13px")
            .transition()
            .attr("fill-opacity", 1);
    };
    function mouseout() {
        tooltipSB.transition()
            .attr("fill-opacity", 0);
    };
    
    //var color = d3.scaleOrdinal(d3.schemeCategory10)
    //color = d3.scaleOrdinal(d3.quantize(d3.schemeSet2, root.children.length + 1))
    var color =d3.scaleOrdinal().range(d3.quantize(d3.interpolateRainbow, root.children.length + 1));
   
    
    //Visualização
        // Add um arco para cada um dos nós na hierarquia
        //Partition(root) adiciona os valores x0, x1, y0 e y1 a cada nó.
    svgSB.selectAll("path")
        .data(partition(root).descendants().filter(d => d.depth))
        .enter().append("path")
        .attr("display", d => d.depth ? null : "none") // area branca central
        .attr("d", arc)
        .style("fill", d=> color((d.children ? d : d.parent).data.key))
        /*.attr("fill", d => {
            while ((d => d.depth) >1)
            d= d.children
            console.log(color((d ? d : d.parent).data.key))
            //return color((d.children ? d : d.parent).data.key)
        })*/
        .style("stroke-width",0.3)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("click", click)
            .append("title")
            .text(d=> (d.children ? d : d.parent).data.key+ "\n" + formatNumber(d.value))


        function click(d) {
        svgSB.transition()
            .duration(300)
            .tween("scales", function() {
                var xd = d3.interpolate(xSB.domain(), [d.x0, d.x1]),
                    yd = d3.interpolate(ySB.domain(), [d.y0, 1]);
                    yr = d3.interpolate(ySB.range(), [d.y0 ? 25 : 0, radius]);
                return function(t) { xSB.domain(xd(t));
                                     ySB.domain(yd(t)).range(yr(t));
                                     return arc(d)};
            })
            .selectAll("path")
                .attrTween("d", d=> function() { return arc(d); })
    }

})