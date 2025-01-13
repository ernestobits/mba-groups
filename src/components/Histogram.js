import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const Histogram = ({ data, width = 600, height = 400, xLabel, yLabel, title }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous renders

    const margin = { top: 40, right: 30, bottom: 50, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3
      .scaleLinear()
      .domain([d3.min(data) - 1, d3.max(data)])
      .nice()
      .range([0, innerWidth]);

    const thresholds = d3.max(data) - d3.min(data) + 1;

    const bins = d3
      .bin()
      .domain(x.domain())
      .thresholds(thresholds)(data);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(bins, (d) => d.length)])
      .range([innerHeight, 0]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .call(d3.axisBottom(x))
      .attr("transform", `translate(0,${innerHeight})`);


    g.append("g").call(d3.axisLeft(y));

    g.selectAll("rect")
      .data(bins)
      .join("rect")
      .attr("x", (d) => x(d.x0 - 0.5))
      .attr("y", (d) => y(d.length))
      .attr("width", (d) => x(d.x1) - x(d.x0) - 3)
      .attr("height", (d) => innerHeight - y(d.length))
      .attr("fill", "steelblue");

    svg
      .append("text")
      .attr("x", margin.left + innerWidth / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text(xLabel);

    svg
      .append("text")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("transform", "rotate(-90)")
      .text(yLabel);

    svg
      .append("text")
      .attr("x", margin.left + innerWidth / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text(title);

  }, [data, width, height, xLabel, yLabel, title]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};

export default Histogram;
