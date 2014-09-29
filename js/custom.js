function toggleNav() {
    if ($('#site-wrapper').hasClass('show-nav')) {
        // Do things on Nav Close
        $('#site-wrapper').removeClass('show-nav');
    } else {
        // Do things on Nav Open
        $('#site-wrapper').addClass('show-nav');
    }

    //$('#site-wrapper').toggleClass('show-nav');
}


$(window).load(function() {

    var circleDataset = [{name : "New York"},{name:"Houston"},
    {name:"San Francisco"},{name:"Berkeley"}];
$('.sidebar-nav li').hover(
	function(){  $('#site-wrapper').addClass('show-nav'); },
	function(){ }
	);

$('#site-submenu').hover(
            function() {},
            function() {$('#site-wrapper').removeClass('show-nav');}
            );

    var w = 1400;
    var w2 = w/2;
    var h = 120;
    var r = 60;
    var offset = 250;

    var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .append("svg")
            .attr("x", offset);

    var circles = svg.selectAll("circle")
                    .data(circleDataset)
                    .enter()
                    .append("circle");

    circles.attr("r",r)
        .attr("cx",function(d,i){return (i) * (w2 / circleDataset.length) + r})
        .attr("cy", h/2)
        .classed("fill-blue",true)
        .classed("stroke-yellow",true)
        .transition()
           .delay(500)
           .each("start", function() { d3.select(this).style("opacity", 0); })
           .duration(500)
           .ease("linear")
           .style("opacity", 1);

    var text = svg.selectAll("text")
                .data(circleDataset)
                .enter()
                .append("text")

    text.text(function(d) {return d.name; })
           .attr("font-family", "sans-serif")
           .attr("font-size", "18px")
           .attr("id",function(d){return d.name;})
           .classed("fill-white", true)
           .transition()
           .delay(500)
           .each("start", function() { d3.select(this).style("opacity", 0); })
           .duration(500)
           .ease("linear")
           .style("opacity", 1)
           .attr("x", function(d,i){return (i) * (w2 / circleDataset.length)})
           .attr("y", h/2);
    
    text.on

}
);