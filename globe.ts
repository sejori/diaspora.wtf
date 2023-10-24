import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import data from "./world.json" assert { type: "json" };

const width = d3.select("#map").node().getBoundingClientRect().width;
const height = 500;
const sensitivity = 75;

const projection = d3.geoOrthographic()
  .scale(250)
  .center([0, 0])
  .rotate([0,-30])
  .translate([width / 2, height / 2]);


const initialScale = projection.scale();
let path = d3.geoPath(projection, null);

const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const globe = svg.append("circle")
  .attr("fill", "#EEE")
  // .attr("stroke", "#000")
  // .attr("stroke-width", "0.2") - remove stroke so no borders
  .attr("cx", width/2)
  .attr("cy", height/2)
  .attr("r", initialScale)

// svg.call(d3.drag().on('drag', () => {
svg
  .on('drag', (event: any) => {
    const rotate = projection.rotate();
    const k = sensitivity / projection.scale();
    projection.rotate([
      rotate[0] + event.dx * k,
      rotate[1] - event.dy * k
    ]);
    path = d3.geoPath(projection, null)
    svg.selectAll("path").attr("d", path)
  })
  .on('zoom', (event: any) => {
    if(event.transform.k > 0.3) {
      projection.scale(initialScale * event.transform.k)
      path = d3.geoPath(projection, null)
      svg.selectAll("path").attr("d", path)
      globe.attr("r", projection.scale())
    }
    else {
      event.transform.k = 0.3
    }
  })

const map = svg.append("g")
map.append("g")
  .attr("class", "countries" )
  .selectAll("path")
  .data(data.features)
  .enter().append("path")
  .attr("class", (d: any) => "country_" + d.properties.name.replace(" ","_"))
  .attr("d", path)
  .attr("fill", "white")
  .style('stroke', 'black')
  .style('stroke-width', 0.3)
  .style("opacity",0.8)

//Optional rotate
d3.timer(function() {
  const rotate = projection.rotate()
  const k = sensitivity / projection.scale()
  projection.rotate([
    rotate[0] - 1 * k,
    rotate[1]
  ])
  path = d3.geoPath(projection, null)
  svg.selectAll("path").attr("d", path)
}, 200, null)