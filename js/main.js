const width = 1000;
const height = 600;
const body = d3.select("body");
const choropleth = body.append("svg");
const legend = choropleth.append("g");
const tooltip = body.append("div");
const path = d3.geoPath();
// const data = d3.map();
const counties = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
const userEducation = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

choropleth
  .attr("id", "choropleth");

tooltip
  .attr("id", "tooltip");

// const colorQuantizeScale = d3.scaleQuantize([2.6, 75.1], d3.schemeSpectral[10]);
const colorThresholdScale = d3.scaleThreshold().domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 10)).range(d3.schemeSpectral[11]);
// schemeRdBu[11]
// [2.6, 9.85, 17.21, 24.35, 31.6, 38.85, 46.1, 53.35, 60.6, 67.85, 75.1] // I calculated these by hand // 75.1 - 2.6 / 10 = 7.25 increment to get values between 2.6 to 75.1
// [2.6, 75.1]
// shortcut to get values for domain array: d3.range(2.6, 75.1, (75.1 -2.6) / 10)
// colorThresholdScale
//   .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 10))
//   .range(d3.schemeSpectral[10]); 

choropleth
  .attr("viewBox", [0, 0, 1000, 600]);

legend  
  .attr("transform", `translate(${width - 425}, ${60})`)
  .attr("id", "legend")
  .selectAll("rect")
  .data(d3.range(2.6, 75.1, (75.1 -2.6) / 10))
  .enter()
  .append("rect")
  .attr("width", d => 30)
  .attr("height", d => 10)
  .attr("x", (d, i) => i * 30)
  .attr("fill", (d, i) => colorThresholdScale(d))

const legendAxis = d3.axisTop(colorThresholdScale);

legendAxis
  .tickSize(15)
  // .tickValues(d3.range(2.6, 75.1, (75.1 - 2.6) / 10))
  .tickPadding(10)
  .tickValues(d3.range(2.6, 82.35, (82.35 - 2.6) / 11))
legend
  .append("g")
  .call(legendAxis)
.attr("transform", (d, i) => `translate(${0}, ${0})`)

const ticks = d3.selectAll(".tick");
  
ticks
  .attr("transform", (d, i)=> `translate(${i * 30}, ${10})`)

const tickText = d3.selectAll(".tick text");

tickText
  .attr("style", "color: green;")

const tickLines = d3.selectAll(".tick line");

tickLines
  .attr("stroke", "black")
  .attr("stroke-width", 1)
// legend
//   .attr("id", "legend")
//   .attr("width", 400)
//   .attr("transform", `translate(${width - 425}, ${50})`);


// legend
//   .append("rect")
//   .attr("width", 300)
//   .attr("height", 10)
  // .attr("fill", colorThresholdScale)
  // .attr("fill", d3.scaleQuantize([1, 10], d3.schemeSpectral[12]));
  // .attr("fill", colorQuantizeScale)


Promise.all([d3.json(counties), d3.json(userEducation), "Thank You God for all your help."]).then(
 // (values) => {console.log(values)} // This works.
  ([mapData, educationData]) => {
    // use object/array destructuring to get the data I wanted 
    // console.log(mapData, educationData);
    const bachelorsOrHigher = educationData.map((obj => obj.bachelorsOrHigher));
    
console.log(Math.min(...bachelorsOrHigher), Math.max(...bachelorsOrHigher)) // 2.6, 75.1
    // 75.1 - 2.6 = 72.5
    // 72.5 / 10 number of ticks I want
    // 7.25
    
    // const data = Object.assign(new Map(educationData, ({fips: id, bachelorsOrHigher}) => [id, +bachelorsOrHigher]))
    
    const data = new Map(educationData.map(obj => [obj.fips, obj.bachelorsOrHigher]));
    
    // test to see if Map can contain an object for a properties/key's value
    
    const mapObjValues = new Map(educationData.map(obj => (
      [obj.fips, { // object
        state: obj.state,
        county: obj.area_name
   }])));
    
    console.log(data.get(6079))
   // seems to be working
console.log(mapObjValues.get(51610).county)
    
  const quatileScale = d3.scaleQuantile().domain(educationData).range(d3.schemeSpectral[10]);
    
    choropleth
      .selectAll("path")
      .data(topojson.feature(mapData, mapData.objects.counties).features)
      .join("path")
      .attr("class", "county")
      // attr("fill", use function to fill by requirements)
      // .attr("fill", "none")
      .attr("fill", function (d) {d.percentBOH = data.get(d.id); return colorThresholdScale(d.percentBOH);})
      .attr("stroke", "black")
      .attr("d", path)
      // .attr("data-id", d => d.id)
      // .attr("data-fips", (d, i) => educationData[i].fips) // they don't match up
      .attr("data-fips", d => d.id)
      .attr("data-education", d => data.get(d.id))
      .attr("state", d => mapObjValues.get(d.id).state)
      .attr("county", d => mapObjValues.get(d.id).county);
    
    // make map: 
    choropleth
      .append("path")
      .datum(topojson.mesh(mapData, mapData.objects.states, (a, b) => a !== b))
      .attr("fill", "none")
      .attr("stroke", "yellow" )
      .attr("stroke-linejoin", "round")
      .attr("d", path);
    
  const counties = d3.selectAll(".county");
    
  counties
    .on("mouseover", 
       function (d) {
        tooltip
          .style("opacity", 1)
          .attr("data-education", d3.select(this).attr("data-education"))
          .attr("state", d3.select(this).attr("state"))
          .attr("county", d3.select(this).attr("county"));
         
        tooltip.html(`
          ${d3.select(this).attr("county")},
${d3.select(this).attr("state")}
<br/> 
${d3.select(this).attr("data-education")}% Bachelors or Higher`
        )
    })
    
    .on("mousemove",
       function(event) {
        tooltip
          .style("left", event.pageX + "px")
          .style("top", event.pageY + "px")
    })
    
    .on("mouseout",
       function (d) {
        tooltip
          .style("opacity", 0)
    })
  }
  
);

// console.log("What's going on?")

// d3.json(counties, 

// function (error, mapData) {
//   if (error) throw error;
//   return mapData;
// })
// .then(
//   mapData => {
//     console.log(mapData);
// });

// d3.json(userEducation, 
        
// function (error, educationData) {
//   if (error) throw error;
//   return educationData;
// })
// .then(
//   educationData => {
//     console.log(educationData)
// });
