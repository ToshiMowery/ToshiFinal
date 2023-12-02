// Constants for the charts, that would be useful.

const MARGIN = { left: 50, bottom: 150, top: 20, right: 20 };
const CHART_WIDTH = 1500 + MARGIN.left + MARGIN.right;
const CHART_HEIGHT = 500 ;
const XADJUST = CHART_WIDTH
const YADJUST = CHART_HEIGHT -MARGIN.bottom
var BARWIDTH = 15;
setup();

function setup () {

    var body = d3.select("body");

    var select = d3.selectAll("#dataset");
    select.on("change", changeData)
    var dataType = d3.select("#type");
    dataType.on("change", changeData)
    var checkbox = d3.selectAll("input");
    checkbox.property("checked", false);
    checkbox.on("change", changeData)
    colorList = ["W", "U", "G", "B", "R"];
    for (var i = 0; i < colorList.length; i++){
      var barchart = d3.select("#Barchart-div-"+colorList[i]).append("svg").attr("width", CHART_WIDTH).attr("height", CHART_HEIGHT);
      barchart.append("g").attr("class", "xAxis").attr("transform", "translate(" + MARGIN.left + "," + ( YADJUST -MARGIN.top) + ")");
      barchart.append("g").attr("class", "yAxis").attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")");
      barchart.append("line").attr("class", "avgLine")
      barchart.append("line").attr("class", "allAvgLine")
    }
    var barchart = d3.select("#Barchart-div-Top").append("svg").attr("width", CHART_WIDTH).attr("height", CHART_HEIGHT);
      barchart.append("g").attr("class", "xAxis").attr("transform", "translate(" + MARGIN.left + "," + ( YADJUST -MARGIN.top) + ")");
      barchart.append("g").attr("class", "yAxis").attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")");
      barchart.append("line").attr("class", "avgLine")
      barchart.append("line").attr("class", "allAvgLine")
    

  changeData();
}


function update (data) {
  var dataType = d3.select("#type").node().value;
  var max = d3.max(data, function(d){ if(dataType == "winrate"){ return Math.min(d.winrate+5, 100)} else {return Math.ceil(d.pickedAt) }});
  var mostPicked = d3.max(data, function(d){ return d.pickedAt });
  var totalGames = d3.sum(data, function(d){return d.gamesPlayed})
  var totalGameWinrate = d3.sum(data, function(d){return (d.gamesPlayed * d.winrate) })
  var avgLineVal = totalGameWinrate/totalGames
  if (dataType != "winrate"){   avgLineVal = max/2}

  updateBarChartColor(data, "G",avgLineVal);
  // var svg = d3.select("#Barchart-div-" + "B").select("svg").attr("visibility","hidden")

  updateBarChartColor(data, "U",avgLineVal);
  updateBarChartColor(data, "B",avgLineVal);
  updateBarChartColor(data, "W",avgLineVal);
  updateBarChartColor(data, "R",avgLineVal);
  topXCardsChart(data, 20, avgLineVal);


}
function updateBarChartColor (data, color, allAvg) {

  //Add legend
  

  var rareSelected = d3.select("#raremyth").node().checked;
  var uncommonSelected = d3.select("#uncommon").node().checked;
  var commonSelected = d3.select("#common").node().checked;
  data = data.filter(function(d){
    var correctRarity = false;
    if (rareSelected && (d.rarity.includes("M")||d.rarity.includes("R"))){
      correctRarity = true;
    }
    if (uncommonSelected && (d.rarity.includes("U"))){
      correctRarity = true;
    }
    if (commonSelected && d.rarity.includes("C")){
      correctRarity = true;
    }
    if (!(rareSelected||uncommonSelected||commonSelected)){
      correctRarity = true;
    }
    return d.color.includes(color) && correctRarity;
  })
  var svg = d3.select("#Barchart-div-" + color).select("svg")


  //Add legend



  var lineChild = svg.select(".avgLine").remove()
  lineChild = svg.select(".allAvgLine").remove()

  var dataType = d3.select("#type").node().value;
  var max = d3.max(data, function(d){ if(dataType == "winrate"){ return Math.min(d.winrate+5, 100)} else {return Math.ceil(d.pickedAt) }});
  var mostPicked = d3.max(data, function(d){ return d.pickedAt });
  var totalGames = d3.sum(data, function(d){return d.gamesPlayed})
  var totalGameWinrate = d3.sum(data, function(d){return (d.gamesPlayed * d.winrate) })
  var totalGamePickrate = d3.sum(data, function(d){return (d.gamesPlayed * d.pickedAt) })
  var averageWinrate = totalGameWinrate/totalGames
  if (dataType != "winrate"){   averageWinrate = totalGamePickrate/totalGames}



  var yScale = d3.scaleLinear()
          .domain([max,0])
          .range([0, YADJUST - (MARGIN.top)]);
  var yAxis = d3.axisLeft();
  yAxis.scale(yScale)
  svg.select(".yAxis").call(yAxis);
  // Sort if ascending
  data.sort(function(a,b){ if(dataType == "winrate") {return  b.winrate - a.winrate} else {return a.pickedAt - b.pickedAt }} )
  //Sort descending
  //console.log(data)
  var nameArray = []
  for (var i = 0; i < data.length; i++){
    nameArray.push(data[i].name)
  }
  

  var xScale = d3.scaleBand().range([MARGIN.left,CHART_WIDTH]).domain(nameArray);
  
  var xAxis = d3.axisBottom();
  //xScale.domain(data.map(function(d){return d.date}))
  xAxis.scale(xScale)

  BARWIDTH = (XADJUST-500) / data.length
  
  svg.select(".xAxis").attr("transform", "translate(0," + YADJUST+ ")").call(xAxis).selectAll("text")  
  .style("text-anchor", "end")
  .attr("dx", "-.8em")
  .attr("dy", ".15em")
  .attr("transform", "translate(0,0)rotate(-60)" );

  svg.selectAll("rect")
          .data(data)
          .join("rect")
          .attr("transform", "translate(" + MARGIN.left + "," + ( YADJUST ) + ")")
          .attr("x",  (d, i) => BARWIDTH/5+ i * (XADJUST-(MARGIN.left))/data.length)
          .attr("y", function (d) {
              var dVal = 0
              if (dataType == "winrate")
                  {dVal = d.winrate}
              else
                  {
                  dVal = d.pickedAt;}
              return -dVal*(YADJUST)/max
          })
          .attr("width", BARWIDTH)
          .attr("height", function (d) {
              var dVal = 0
              if (dataType == "winrate")
                  {dVal = d.winrate}
              else
                  {
                  dVal = d.pickedAt;}
              return dVal*(YADJUST)/max
          })
          .style("fill", "steelblue")
    //Draw average bars
   svg.append('line')
      .style("stroke", "red")
      .style("stroke-width", 2)
      .attr("class", "avgLine")
      .attr("x1", MARGIN.left)
      .attr("y1", (max-averageWinrate)*(YADJUST)/max)
      .attr("x2", XADJUST)
      .attr("y2", (max-averageWinrate)*(YADJUST)/max);
    svg.append('line')
      .style("stroke", "blue")
      .style("stroke-width", 2)
      .attr("class", "allAvgLine")
      .attr("x1", MARGIN.left)
      .attr("y1", (max-allAvg)*(YADJUST)/max)
      .attr("x2", XADJUST)
      .attr("y2", (max-allAvg)*(YADJUST)/max);
    
    //Draw Legend
    svg.append('rect')
      .attr("class", "legend")
      .attr('x', 5*CHART_WIDTH/6)
      .attr('y', 1*CHART_HEIGHT/2)
      .attr('width', CHART_WIDTH/6)
      .attr('height', CHART_HEIGHT/10)
      .attr('stroke', 'black')
      .attr('fill', 'lightgray');

    //
    svg.append("text")
      .attr("x",  5*CHART_WIDTH/6+100)
      .attr("y",  1*CHART_HEIGHT/2+13)
      .attr("dy", ".35em")
      .attr("color", "black")
      .text("Global Average "  + Math.round(allAvg*100)/100);

    svg.append("text")
      .attr("x",  5*CHART_WIDTH/6+100)
      .attr("y",  1*CHART_HEIGHT/2+35)
      .attr("dy", ".35em")
      .attr("color", "black")
      .text("Relative Average "+ Math.round(averageWinrate*100)/100);

    svg.append('line')
      .style("stroke", "blue")
      .style("stroke-width", 2)
      .attr("x1", 20+ 5*CHART_WIDTH/6)
      .attr("y1", 1*CHART_HEIGHT/2+13)
      .attr("x2", 90+ 5*CHART_WIDTH/6)
      .attr("y2", 1*CHART_HEIGHT/2+13);
      
    svg.append('line')
      .style("stroke", "red")
      .style("stroke-width", 2)
      .attr("x1", 20+ 5*CHART_WIDTH/6)
      .attr("y1", 1*CHART_HEIGHT/2+35)
      .attr("x2", 90+ 5*CHART_WIDTH/6)
      .attr("y2", 1*CHART_HEIGHT/2+35);
    

}

function topXCardsChart(data, num, allAvg){
  var dataType = d3.select("#type").node().value;

  var rareSelected = d3.select("#raremyth").node().checked;
  var uncommonSelected = d3.select("#uncommon").node().checked;
  var commonSelected = d3.select("#common").node().checked;
  var totalPicked = 0
  data.sort(function(a,b){ if(dataType == "winrate") {return  b.winrate - a.winrate} else {return a.pickedAt - b.pickedAt }} )
  newData = []
  for (var i = 0; i < data.length; i++){
    var correctRarity = false;
    if (rareSelected && (data[i].rarity.includes("M")||data[i].rarity.includes("R"))){
      correctRarity = true;
    }
    if (uncommonSelected && (data[i].rarity.includes("U"))){
      correctRarity = true;
    }
    if (commonSelected && data[i].rarity.includes("C")){
      correctRarity = true;
    }
    if (!(rareSelected||uncommonSelected||commonSelected)){
      correctRarity = true;
    }
    if (correctRarity && totalPicked<num){
      totalPicked+=1
      newData.push(data[i])
    }
    if(totalPicked == num){
      break;
    }
  }
  data = newData;
 
  var svg = d3.select("#Barchart-div-Top").select("svg")
  var lineChild = svg.select(".avgLine").remove()
  lineChild = svg.select(".allAvgLine").remove()

  var max = d3.max(data, function(d){ if(dataType == "winrate"){ return Math.min(d.winrate+5, 100)} else {return Math.ceil(d.pickedAt) }});
  var mostPicked = d3.max(data, function(d){ return d.pickedAt });
  var totalGames = d3.sum(data, function(d){return d.gamesPlayed})
  var totalGameWinrate = d3.sum(data, function(d){return (d.gamesPlayed * d.winrate) })
  var totalGamePickrate = d3.sum(data, function(d){return (d.gamesPlayed * d.pickedAt) })
  var averageWinrate = totalGameWinrate/totalGames
  if (dataType != "winrate"){   averageWinrate = totalGamePickrate/totalGames}



  var yScale = d3.scaleLinear()
          .domain([max,0])
          .range([0, YADJUST - (MARGIN.top)]);
  var yAxis = d3.axisLeft();
  yAxis.scale(yScale)
  svg.select(".yAxis").call(yAxis);
  // Sort if ascending
  //Sort descending
  //console.log(data)
  var nameArray = []
  for (var i = 0; i < data.length; i++){
    nameArray.push(data[i].name)
  }
  

  var xScale = d3.scaleBand().range([MARGIN.left,CHART_WIDTH]).domain(nameArray);
  
  var xAxis = d3.axisBottom();
  //xScale.domain(data.map(function(d){return d.date}))
  xAxis.scale(xScale)
  BARWIDTH = (XADJUST-500) / data.length

  svg.select(".xAxis").attr("transform", "translate(0," + YADJUST+ ")").call(xAxis).selectAll("text")  
  .style("text-anchor", "end")
  .attr("dx", "-.8em")
  .attr("dy", ".15em")
  .attr("transform", "translate(0,0)rotate(-60)" );
  
  
  svg.selectAll("rect")
          .data(data)
          .join("rect")
          .attr("transform", "translate(" + MARGIN.left + "," + ( YADJUST ) + ")")
          .attr("x",  (d, i) => BARWIDTH/5+ i * (XADJUST-(MARGIN.left))/data.length)
          .attr("y", function (d) {
              var dVal = 0
              if (dataType == "winrate")
                  {dVal = d.winrate}
              else
                  {
                  dVal = d.pickedAt;}
              return -dVal*(YADJUST)/max
          })
          .attr("width", BARWIDTH)
          .attr("height", function (d) {
//                // here we call the scale function.
              var dVal = 0
              if (dataType == "winrate")
                  {dVal = d.winrate}
              else
                  {
                  dVal = d.pickedAt;}
              return dVal*(YADJUST)/max
          })
          .style("fill", "steelblue")
   svg.append('line')
      .style("stroke", "blue")
      .style("stroke-width", 2)
      .attr("class", "avgLine")
      .attr("x1", MARGIN.left)
      .attr("y1", (max-averageWinrate)*(YADJUST)/max)
      .attr("x2", XADJUST)
      .attr("y2", (max-averageWinrate)*(YADJUST)/max);
      svg.append('line')
      .style("stroke", "red")
      .style("stroke-width", 2)
      .attr("class", "allAvgLine")
      .attr("x1", MARGIN.left)
      .attr("y1", (max-allAvg)*(YADJUST)/max)
      .attr("x2", XADJUST)
      .attr("y2", (max-allAvg)*(YADJUST)/max);

       
    
    //Draw Legend
    svg.append('rect')
      .attr("class", "legend")
      .attr('x', 5*CHART_WIDTH/6)
      .attr('y', 1*CHART_HEIGHT/2)
      .attr('width', CHART_WIDTH/6)
      .attr('height', CHART_HEIGHT/10)
      .attr('stroke', 'black')
      .attr('fill', 'lightgray');

    //
    svg.append("text")
      .attr("x",  5*CHART_WIDTH/6+100)
      .attr("y",  1*CHART_HEIGHT/2+13)
      .attr("dy", ".35em")
      .attr("color", "black")
      .text("Global Average "  + Math.round(allAvg*100)/100);

    svg.append("text")
      .attr("x",  5*CHART_WIDTH/6+100)
      .attr("y",  1*CHART_HEIGHT/2+35)
      .attr("dy", ".35em")
      .attr("color", "black")
      .text("Relative Average "+ Math.round(averageWinrate*100)/100);

    svg.append('line')
      .style("stroke", "red")
      .style("stroke-width", 2)
      .attr("x1", 20+ 5*CHART_WIDTH/6)
      .attr("y1", 1*CHART_HEIGHT/2+13)
      .attr("x2", 90+ 5*CHART_WIDTH/6)
      .attr("y2", 1*CHART_HEIGHT/2+13);
      
    svg.append('line')
      .style("stroke", "blue")
      .style("stroke-width", 2)
      .attr("x1", 20+ 5*CHART_WIDTH/6)
      .attr("y1", 1*CHART_HEIGHT/2+35)
      .attr("x2", 90+ 5*CHART_WIDTH/6)
      .attr("y2", 1*CHART_HEIGHT/2+35);
    
}
/**
 * Update the data according to document settings
 */
function changeData () {
  //  Load the file indicated by the select menu
  const dataFile = d3.select('#dataset').property('value');
  //console.log(dataFile)
  //console.log(d3.csv(`data/cardData${dataFile}.csv`));
  d3.csv(`data/cardData${dataFile}.csv`)
    .then(dataOutput => {

      const dataResult = dataOutput.map((d) => ({
        name: d.name,
        color: d.color,
        rarity: d.rarity,
        numPicked: parseInt(d.picked),
        pickedAt: parseFloat(d.ata),
        gamesPlayed: parseInt(d.games_played),
        winrate: parseFloat(d.gpwr) ? parseFloat(d.gpwr)  : 0
      }));


        update(dataResult);

    }).catch(e => {
      console.log(e);
      alert('Error!');
    });
}

