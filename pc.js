// Opção de mostrar total de dívidas naquela versão (linha) ao mouseover

// firebase init
// Select "Hosting: Configure and deploy..."
// Selecionar -> Public N N N N
// final -> firebase deploy

// construindo margens 
const MARGIN = {LEFT:70 , RIGHT:10, TOP:40, BOTTOM:10}
const WIDTH = 550 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 270 - MARGIN.TOP - MARGIN.BOTTOM


// criando área para as coord paralelas, já editadas
var svgPC = d3.select("#parallelCordinates").append("svg") 
        .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
        .attr("height",HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)
    .append("g")
        .attr("transform", "translate(" + MARGIN.LEFT + "," + MARGIN.TOP + ")");

const debts = []; 

var tooltipPC = d3.select("#parallelCordinates")
    .style("font-family", "Verdana" )
    .append("div").attr("class", "remove")
    .style("position", "absolute")
    .style("background-color", "lightgray")
    //.style("font-weight", "bold")
    

// Dataset
d3.json("data/rm_technical_debt.json").then(function(data) {
    data = data.slice(0,754) // usa apenas o repositorio jUnit, comentar se quiser testar todo repositório
    const tm = data.length  //tamanho do db

    // Quantidade e tipos de dts contidos
    for (let i=0; i<tm; i++){
        for (let j=0; j< data[i].debts.length; j++){
            for (let dt in data[i].debts[j]){
                //console.log(data[i].debts[j].name)  mostra as dividas contidas
            }
            debts.push(data[i].debts[j].name)
        }
    }
    console.log(debts.length)  //Array total de dividas

    //Transformação dos dados
    //Dados com versões como chave
    var priority_order = ["CODE_DEBT", "UNKNOWN_DEBT", "DEFECT_DEBT", 
    "REQUIREMENT_DEBT", "TEST_DEBT", "DESIGN_DEBT"];
    console.log(priority_order[0])
    const byVersion = d3.nest()
        .key(d=> d.reference)
        .key(d=> d.debts[d.debts.length -1].name).sortKeys((a,b) =>priority_order.indexOf(a) - priority_order.indexOf(b))
        //.rollup(v => v.length)
        .entries(data)
    console.log(byVersion)

    //Dados com dividas como chave  
    const byDebts = d3.nest()
        .key(d=> d.debts[d.debts.length -1].name).sortKeys((a,b) =>priority_order.indexOf(a) - priority_order.indexOf(b))
        .key(d=> d.reference)
        //.rollup(v => v.length, d => d.debts[d.debts.length -1].name)
        .rollup(v=> d3.sum(v, d=> d.debts.length))
        .entries(data)
    console.log(byDebts)

    //dimensões
    const dimensions  =[]
    for (i in byDebts){ dimensions.push(byDebts[i].key) }
    console.log(dimensions)

  // Construindo os eixos 
  const yPC = {}
  for (i in dimensions) {
    name = dimensions[i];
    yPC[name] = d3.scaleLinear()
        //.domain([0,200])
        .domain([(byDebts[i]["values"].length >=byVersion.length)? d3.min(byDebts[i]["values"], d => d.value): 0,
                d3.max(byDebts[i]["values"], d => d.value)])
        .range([HEIGHT, 0])
    }

    xPC = d3.scalePoint()
        .domain(dimensions)
        .range([0, WIDTH])

// A função path pega uma linha como entrada e retorna as coordenadas xey da linha a ser desenhada
function path(d) {
    var line = (d.values.map((k,i)=> [k.key, k.values.length])) 
    /*var ln = (d.values.map((k,i)=> (priority_order[i] == k.key)
                                           ?[k.key, k.value]
                                           :[priority_order[i], 0]))*/
    
    var line2 = dimensions.map((p,i)=> (line[p,i]==undefined)
                                                ?[p,0]
                                                :line[p,i])
                                              
    console.log(dimensions.map((p,i)=> (line[p,i]===undefined)
                                                ?[p,0] 
                                                :line[p,i]))
                                                //:(p==line[i][0])?line[p,i]:([p,0])))

    /*console.log(dimensions.map((p,i)=>  y[p](p==line[i][0])
                                                    ?(line[p,i])
                                                    :(line[p,i]==undefined) ? ([p,0]) : line[p,i]                
                                                    ))*/                           
    return d3.line()(dimensions.map((p,i)=>  [xPC(p), yPC[p](line2[i][1])]))
  }


// Desenhando as linhas
svgPC.selectAll("path")
    .data(byVersion)
        .enter().append("path") 
        .attr("class", d=> "line "+ d.key) // 2 classes para cada linha: 'linha' e a versão ->> [...(new Set(data.map(d=> d.reference)))]
        .attr("d", path)
                .on("mouseover",d=>{
                    d3.select("#versions")
                    //.text("Version: "+ d.key)
                    //.style("position", "absolute")
                    tooltipPC.html("Version: "+ d.key + "<br>" +" Tot: " + d3.sum(d.values, j=> j.values.length))
                    .style("visibility", "visible")
                })
        .append("title")
        .text(d=> "Version: "+ d.key)


  // Desenhando os eixos
  svgPC.selectAll("myAxis")
    // Para cada dimensão, adiciono um elemento 'g':
    .data(dimensions).enter()
    .append("g")
    // transforma posição correta no eixo x
    .attr("transform", d=> "translate(" + xPC(d) + ")")
   // E eu construo o eixo com a função de chamada
    .each(function(d) { d3.select(this).call(d3.axisLeft().scale(yPC[d])); })
    // Add axis title
        .append("text")
            .style("text-anchor", "middle")
            .attr("y", -20)
            //.attr("x", 120)
            .text(d => d.replace("_DEBT", ""))  // retira o _Debt dos nomes
            .style("fill", "black")
            .style("font-size", "10px")
            .style("font-family", "sans-serif")
            .attr("transform", "rotate(-15)" );//rotaçao no nome

    svgPC.append("text")
            .text("Debts:")
            .attr("fill", "black")
            .style("font-family", "sans-serif")
            .style("font-size", "15px")
            .attr("x", -71)
            .attr("y", -20)

})
