// Load the data
const iris = d3.csv("iris.csv");

// Once the data is loaded, proceed with plotting
iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Define the dimensions and margins for the SVG
    let margin = {
        top: 30,
        bottom: 50,
        left: 50,
        right: 30
      }
    
      let width = 600, height = 400;
    
    // Create the SVG container
    let svg = d3.select("#scatterplot")
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', 'lightyellow')
    
    // Set up scales for x and y axes
    // d3.min(data, d => d.bill_length_mm)-5
    let yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalWidth), d3.max(data, d => d.PetalWidth)])//d
        .range([height - margin.bottom, margin.top]);

    let xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength), d3.max(data, d => d.PetalLength)])
        .range([margin.left, width - margin.right]);

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.Species))
        .range(d3.schemeCategory10);

    // Add scales     
    let yAxis = svg.append("g")
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft().scale(yScale))

    let xAxis = svg.append("g")
        .attr('transform', `translate(0,${height-margin.bottom})`)
        .call(d3.axisBottom().scale(xScale))
        

    // Add circles for each data point
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.PetalLength))
        .attr("cy", d => yScale(d.PetalWidth))
        .attr("r", 5)
        .attr("fill", d => colorScale(d.Species));

    // Add x-axis label
    svg.append('text')
        .attr('x', width/2)
        .attr('y', height - 15)
        .text('Petal Length') 
        .style('text-anchor', 'middle')

    // Add y-axis label
    svg.append('text')
        .attr('x', 0 - (height/2))
        .attr('y', 25)
        .text('Petal Width')
        .attr('transform', 'rotate(-90)')

    // Add legend
    const legend = svg.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")");
    
    legend.append("circle")
        .attr("cx", 80)
        .attr("cy", 20)
        .attr("r", 6)
        .style("fill", colorScale);
   
    legend.append("text")
        .attr("x", 90)
        .attr("y", 20)
        .attr("dy", ".35em")
        .text(d => d)
});

iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Define the dimensions and margins for the SVG
    let margin = {
        top: 30,
        bottom: 50,
        left: 50,
        right: 30
      }
    
      let 
      width = 600,
      height = 400;

    // Create the SVG container
    let svg = d3.select("#boxplot")
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', 'lightyellow')

    // Set up scales for x and y axes
    let yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength), d3.max(data, d => d.PetalLength)])
        .range([height - margin.bottom, margin.top]);

    let xScale = d3.scaleBand()
        .domain(["Iris-setosa", "Iris-versicolor", "Iris-virginica"])
        .range([margin.left, width - margin.right])
        .padding(0.5);

    // Add scales     
    let yAxis = svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft().scale(yScale))

    let xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom().scale(xScale))

    // Add x-axis label
    svg.append('text')
        .attr('x', width/2)
        .attr('y', height - 15)
        .text('Species')
        .style('text-anchor', 'middle')

    // Add y-axis label
    svg.append('text')
        .attr('x', 0 - (height/2))
        .attr('y', 25)
        .text('Petal Length')
        .attr('transform', 'rotate(-90)')

    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.PetalLength).sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const iqr = q3 - q1;
        return { q1, median, q3, iqr };
    };

    // Map the data by species as keys, and keeps only the quartiles and interquartile range values
    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);

    // Iterate over each species in the quartilesBySpecies map 
    quartilesBySpecies.forEach((quartiles, Species) => {
        // Calculate the position of the box plot using xScale
        const x = xScale(Species);
        // Calculate the width for the box plot using the bandwidth of xScale
        const boxWidth = xScale.bandwidth();

        // Draw vertical lines
        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(quartiles.q1 - 1.5 * quartiles.iqr)) //d
            .attr("y2", yScale(quartiles.q3 + 1.5 * quartiles.iqr))
            .attr("stroke", "black");

        // Draw box
        svg.append("rect")
            .attr("x", x)
            .attr("y", yScale(quartiles.q3))
            .attr("height", yScale(quartiles.q1) - yScale(quartiles.q3))
            .attr("width", boxWidth)
            .attr("stroke", "black")
            .style("fill", "lightblue");

        // Draw median line
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(quartiles.median))
            .attr("y2", yScale(quartiles.median))
            .attr("stroke", "black")
            .style("width", 80);
        
    });
});