
var data; 
var newLanguage;
var curveDataSet;
var w = 1000;
var h = 500;
var padding = 50;
var yPadding = 50;

function generateButtons(){
  var uniqueParadigmList = {};
  $.each(data, function(propName, d) { 
    var curParadigmList = d.paradigms;
    if(curParadigmList.length != 0){
        $.each(curParadigmList, function(index, value){
          if(! (value in uniqueParadigmList) ){
            uniqueParadigmList[value] = true;
            $("#buttonContainer").append(  $('<button/>', {
              text: value, 
              class: "paradigm btn btn-sm btn-block selected"
              })
            );
          }
        });
    }
  });
}

function updateData(){

    //remove previous influence lines
    d3.selectAll("path").remove();
    //compute array of selected paradigms
    var selectedParadigms = [];
    $(".selected").each(function(){ selectedParadigms[selectedParadigms.length] = $(this).text(); });
    console.log(selectedParadigms);
    newLanguage = []; //holds array of languages from dataset based on selected paradigms
    curveDataSet = []; //hold array of curves [{"name1": name1, "name2" : name2, x1": x1,"y1": y1, "x2": x2, "y2": x2 },...] 
    var newData = []; //holds all data from dataset based on selected paradigms
    $.each(data, function(propName, d){ 
      var datum = d;
      noMatch = true;
      // only display languages with no paradigms if select none or select all is chosen 
      if( (selectedParadigms.length == 0 || selectedParadigms.length == $(".paradigm").length) && d.paradigms.length == 0) {
        newData[newData.length] = datum;
        newLanguage[newLanguage.length] = datum.name;
      }
      $.each(d.paradigms, function(index, value1){ 
        $.each(selectedParadigms, function(index, value2){ 
          if(noMatch && (value1 == value2) ) {
            newData[newData.length] = datum;
            newLanguage[newLanguage.length] = datum.name;
            noMatch = false;
          }

        } );
      });

    });

    
  
  console.log(newData);
  console.log(newLanguage);
  visualizeData(newData, newLanguage);
}

function addButtonHandler(){

  //handler for select all button
  $("#selectAll").click(function(){ 
    $(".paradigm").each(function(){
      if(! $(this).hasClass("selected")) $(this).addClass("selected"); 
    }); 

    updateData();

  });

  //handler for select none button
  $("#selectNone").click(function(){ 
    $(".paradigm").each(function(){
      if($(this).hasClass("selected")) $(this).removeClass("selected"); 
    }); 
    
    updateData();

  });

  //handler for individual paradigm buttons

  $(".paradigm").click(function(){
   $(this).hasClass("selected") ? $(this).removeClass("selected") : $(this).addClass("selected");  
    updateData();
  });
}




function exitTransition(selection){
  selection
    .transition()
      .duration(500)
      .ease("linear")
      .style("opacity",0)
    .remove();
}

function updateTransition(selection){
  selection
    .transition()
      .delay(500)
      .duration(500)
      .ease("linear");
}


function setUpSVG(){
  var svg = d3.select("#main")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

  svg.append("g")
    .classed("axis",true)
    .attr("id","xAxis")
    .attr("transform", "translate(0," + (h - padding) + ")");

  svg.append("g")
    .classed("axis",true)
    .attr("id","yAxis")
    .attr("transform", "translate(" + yPadding + ",0)");

  svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", w/2)
    .attr("y", h - padding/4)
    .text("Year of Release");

  svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("y", 6)
    .attr("x",0 - (h / 2))
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("# Github Repos (Log Scale)");

  svg.append("g")
    .attr("id","circleGroup");

  svg.append("g")
    .attr("id","nameGroup");

  svg.append("g")
    .attr("id","influenceGroup");

}

function visualizeData(dataSet, languageSet){

  var xScale = d3.scale.linear()
                .domain( [ d3.min(dataSet, function(d){ return d.year - 1; }), d3.max(dataSet, function(d){ return d.year + 1; })  ])
                .range([padding, w - padding*2]);

  var yScale = d3.scale.log()
                .domain(d3.extent(dataSet, function(d){ return d.nbRepos; }))
                .range([h - yPadding, yPadding]);

  function enterCircle(selection){
  selection
    .classed("fill-blue",true)
    .attr("id",function(d){ return d.name; } )
    .transition()
    .delay(1000)
    .each("start", function() { d3.select(this).style("opacity", 0); })
    .duration(500)
    .ease("linear")
    .style("opacity", 1)
    .attr("cx", function(d) { return xScale(d.year); })
    .attr("cy", function(d) {return yScale(d.nbRepos); })
    .attr("r", 5);
  }

  function updateCircle(selection){
  selection
   .classed("fill-blue",true)
   .attr("id",function(d){ return d.name; } )
   .transition()
   .delay(500)
   .duration(500)
   .ease("linear")
   .attr("cx", function(d) { return xScale(d.year); })
   .attr("cy", function(d) {return yScale(d.nbRepos); })
   .attr("r", 5);
}

function enterText(selection){
  selection
     .text(function(d) {return d.name; })
     .attr("font-family", "sans-serif")
     .attr("font-size", "11px")
     .attr("id",function(d){return d.name;})
     .classed("fill-red", true)
     .transition()
     .delay(1000)
     .each("start", function() { d3.select(this).style("opacity", 0); })
     .duration(500)
     .ease("linear")
     .style("opacity", 1)
     .attr("x", function(d) { return xScale(d.year)+8; })
     .attr("y", function(d) {return yScale(d.nbRepos); });
}

function updateText(selection){
  selection
     .text(function(d) {return d.name; })
     .attr("font-family", "sans-serif")
     .attr("font-size", "11px")
     .attr("id",function(d){return d.name;})
     .classed("fill-red", true)
     .transition()
     .delay(500)
     .duration(500)
     .ease("linear")
     .attr("x", function(d) { return xScale(d.year)+8; })
     .attr("y", function(d) {return yScale(d.nbRepos); });
}


var curvePathFunction =  d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate("basis");


function enterCurve(selection,pointData){
  selection
   .classed("stroke-orange",true)
   .attr("stroke-width", "2")
   .attr("fill", "none")
   .attr("d", curvePathFunction(pointData))
   .style("opacity",0);
   
}


function makeInfluenceLines(){
  //for escaping characters like # because names and spaces like C# mess with Jquery selectors DOESN"T WORK
  function escapeRegExp(string) {
    var sel = string.replace(/([.*#+?^=!:${}()|\[\]\/\\ ])/g, "\\$1");
    return sel;
  }

  function onMouseIn(){
    $(this).css('cursor','pointer');
    var path = d3.selectAll("."+escapeRegExp($(this).attr("id")));
    if(path.node() != undefined){
     var totalLength = path.node().getTotalLength();
         path.attr("stroke-dasharray","4 4")
         .attr("stroke-dashoffset", totalLength)
         .transition()
         .style("opacity", 1)
         .duration(1000)
         .ease("linear")
         .attr("stroke-dashoffset", 0);
    }
  }

  function onMouseOut(){
    $(this).css('cursor','auto');
      d3.selectAll("."+escapeRegExp($(this).attr("id")))
   .transition()
   .style("opacity", 1)
   .duration(1000)
   .ease("linear")
   .style("opacity",0);

  }

   //compute dataset for influence pts based on selected languages in newData
    $.each(dataSet, function(propName, d){
      var datum = d;
      if(datum.influenced.length !=0){
        $.each(datum.influenced, function(index, lang){
          var curveDataSet;
          var pointsDataSet;
          if($.inArray(lang,languageSet) != -1) {
            var origin = $("#" + escapeRegExp(datum.name));
            var dest = $("#" + escapeRegExp(lang));
            pointsDataSet = [{"name": datum.name, "x": origin.attr("cx"),"y": origin.attr("cy") },{"name": lang, "x": dest.attr("cx"), "y": dest.attr("cy")}];
            curveDataSet = [{"name": datum.name+"_"+lang, "x1": origin.attr("cx"),"y1": origin.attr("cy"), "x2": dest.attr("cx"), "y2": dest.attr("cy")}];
            var curve = svg.select("#influenceGroup")
                  .data(curveDataSet);

            enterCurve(curve.append("path").attr("class",datum.name), pointsDataSet);

          }

        });
      }
     });

  $("circle").hover(onMouseIn , onMouseOut)
  $("#nameGroup").children().hover(onMouseIn , onMouseOut)

}

function nameKeyFunction(d){
  return d.name;
}

  var svg = d3.select("svg")

  var xAxis = d3.svg.axis()
            .scale(xScale)
            .ticks(10)
            .tickFormat(d3.format("d"))
            .orient("bottom");

  var yAxis = d3.svg.axis()
            .scale(yScale)
            .ticks(5)
            .orient("left");

  svg.select("#xAxis")
    .call(xAxis);

  svg.select("#yAxis")
    .call(yAxis);


  var circle = svg.select("#circleGroup").selectAll("circle")
                 .data(dataSet,nameKeyFunction)

      circle.enter()
             .append("circle")
             .call(enterCircle);
             

      circle.call(updateCircle);
             
      circle.exit()
            .call(exitTransition);

 setTimeout(makeInfluenceLines,2000);

  var text = svg.select("#nameGroup")
              .selectAll("text")
              .data(dataSet, nameKeyFunction)

      text.call(updateText);

      text.enter()
        .append("text")
        .call(enterText);

     text.exit()
        .call(exitTransition);


}

d3.json("/assets/data.json", function(error, json) {
if (error) return console.warn(error);
  data = json;
  generateButtons();
  addButtonHandler();
  setUpSVG();
  updateData();
});

