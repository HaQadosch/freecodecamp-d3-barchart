import "./styles.css";
import * as d3 from "d3";

const fetchData = async () => {
  const parseDate = d3.utcParse("%Y-%m-%d");
  const data = await d3.json(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
  );
  return data.data.map(([date, gdp]) => [parseDate(date), gdp]);
};

fetchData().then(dataset => {
  const padding = 50;
  const width = 1000;
  const height = 500;

  const year = d3.timeFormat("%Y");
  const quarter = d3.timeFormat("%Y Q%q");
  const yyymmdd = d3.timeFormat("%Y-%m-%d");

  const xScale = d3
    .scaleTime()
    .domain([dataset[0][0], dataset[dataset.length - 1][0]])
    .range([padding, width - padding]);

  const barWidth = (width - padding - padding) / dataset.length;

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(dataset, ([_, GDP]) => GDP)])
    .range([height - padding, padding]);

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  const svg = d3
    .select("#app")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const tooltip = d3
    .select("#app")
    .append("div")
    .style("opacity", 0)
    .attr("id", "tooltip")
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");

  const mouseover = function(d) {
    tooltip.style("opacity", 1);
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1);
  };
  var mousemove = function([date, gdp]) {
    tooltip
      .html(`${quarter(date)} -$${gdp}B`)
      .attr("data-date", yyymmdd(date))
      .style("left", d3.mouse(this)[0] + 70 + "px")
      .style("top", d3.mouse(this)[1] + "px");
  };
  var mouseleave = function(d) {
    tooltip.style("opacity", 0);
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.8);
  };

  svg
    .selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("data-date", ([date, _]) => yyymmdd(date))
    .attr("data-gdp", ([_, gdp]) => gdp)
    .attr("fill", "blue")
    .attr("class", "bar")
    .attr("x", ([date]) => xScale(date))
    .attr("y", ([, gdp]) => yScale(gdp))
    .attr("width", barWidth)
    .attr("height", ([, gdp]) => height - padding - yScale(gdp))
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);

  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${height - padding})`)
    .call(xAxis);

  svg
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${padding}, 0)`)
    .call(yAxis);

  svg
    .append("text")
    .attr("id", "title")
    .text("Federal Reserve Economic Data, Gross Domestic Product")
    .attr("x", width / 2)
    .attr("y", 0 + padding / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px");
});
