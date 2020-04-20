function makeResponsive() {

  var svgArea = d3.select("body").select("svg");

  if (!svgArea.empty()) {
    svgArea.remove();
  }

  var svgWidth = window.innerWidth;
  var svgHeight = window.innerHeight / 1.5;

  var margin = {
    top: 20,
    right: 40,
    bottom: 140,
    left: 150
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // Create an SVG wrapper, append an SVG group that will hold our chart,
  // and shift the latter by left and top margins.
  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // Append an SVG group
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);




  // function used for updating x-scale var upon click on axis label
  function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);

    return xLinearScale;

  }

  // function used for updating x-scale var upon click on axis label
  function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
        d3.max(data, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);

    return yLinearScale;

  }

  // function used for updating xAxis var upon click on axis label
  function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);

    return xAxis;
  }

  // function used for updating yAxis var upon click on axis label
  function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
      .duration(1000)
      .call(leftAxis);

    return yAxis;
  }

  // function used for updating circles group with a transition to
  // new circles

  function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.selectAll("circle").transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));
    circlesGroup.selectAll("text").transition()
      .duration(1000)
      .attr("dx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
  }

  // function used for updating circles group with a transition to
  // new circles

  function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.selectAll("circle").transition()
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]));
    circlesGroup.selectAll("text").transition()
      .duration(1000)
      .attr("dy", d => newYScale(d[chosenYAxis]) + 5);

    return circlesGroup;
  }

  // function used for updating circles group with new tooltip ??????????
  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
      var labelX = "Poverty:";
    } else if (chosenXAxis === "age") {
      var labelX = "Age:";
    }
    else if (chosenXAxis === "income"){
      var labelX = "Income:";
    }

    if (chosenYAxis === "obesity") {
      var labelY = "Obesity:";
    } else if (chosenYAxis === "smokes") {
      var labelY = "Smokes:";
    }
    else if (chosenYAxis === "healthcare"){
      var labelY = "Healthcare:";
    }

    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .html(function(d) {
        return (`${d.state}<br>${labelX} ${d[chosenXAxis]}%<br>${labelY} ${d[chosenYAxis]}%`);
      });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

    return circlesGroup;
  }

  // Retrieve data from the CSV file and execute everything below
  d3.csv("assets/data/data.csv").then(function(stateData, err) {
    if (err) throw err;

    // parse data
    stateData.forEach(function(data) {
      // console.log(data);
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
      data.healthcare = +data.healthcare;
    });

    console.log(stateData);

    // Initial Params
    var chosenXAxis = "poverty";
    var chosenYAxis = "obesity";

    // xLinearScale function above csv import
    var xLinearScale = xScale(stateData, chosenXAxis);

    // Create y scale function
    var yLinearScale = yScale(stateData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(stateData)
      .enter().append('g');

    circlesGroup.append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 12)
      // .attr("fill", "blue")
      // .attr("opacity", ".25")
      .classed("stateCircle", true);

    circlesGroup.append("text")
      .attr("dx", d=> xLinearScale(d[chosenXAxis]))
      .attr("dy", d => yLinearScale(d[chosenYAxis])+5)
      .text(d => d["abbr"])
      .classed("stateText", true);

    // Create group for  3 x- axis labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 30})`);

    var povertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 30)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .classed("aText", true)
      .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 50)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .classed("aText", true)
      .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 70)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .classed("aText", true)
      .text("Household Income (Median)");

    // Create group for  3 y- axis labels
    var ylabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${-90}, ${height / 2})`)

    var obesityLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 10)
      .attr("x", 0)
      .attr("value", "obesity") // value to grab for event listener
      .classed("active", true)
      .classed("aText", true)
      .text("Obesity (%)");

    var smokesLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 30)
      .attr("x", 0)
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .classed("aText", true)
      .text("Smokes (%)");

    var healthcareLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 50)
      .attr("x", 0)
      .attr("value", "healthcare") // value to grab for event listener
      .classed("inactive", true)
      .classed("aText", true)
      .text("Lacks Healthcare (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

          // replaces chosenXAxis with value
          chosenXAxis = value;

          // console.log(chosenXAxis)

          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(stateData, chosenXAxis);

          // updates x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);

          // updates circles with new x values
          circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);
          // circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          // changes classes to change bold text
          if (chosenXAxis === "poverty") {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          } else if (chosenXAxis === "age") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "income") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });

      // y axis labels event listener
      ylabelsGroup.selectAll("text")
        .on("click", function() {
          // get value of selection
          var value = d3.select(this).attr("value");
          if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenYAxis = value;

            // console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            yLinearScale = yScale(stateData, chosenYAxis);

            // updates x axis with transition
            yAxis = renderYAxes(yLinearScale, yAxis);

            // updates circles with new x values
            circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);
            // circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenYAxis === "obesity") {
              obesityLabel
                .classed("active", true)
                .classed("inactive", false);
              smokesLabel
                .classed("active", false)
                .classed("inactive", true);
              healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
            } else if (chosenYAxis === "smokes") {
              obesityLabel
                .classed("active", false)
                .classed("inactive", true);
              smokesLabel
                .classed("active", true)
                .classed("inactive", false);
              healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (chosenYAxis === "healthcare") {
              obesityLabel
                .classed("active", false)
                .classed("inactive", true);
              smokesLabel
                .classed("active", false)
                .classed("inactive", true);
              healthcareLabel
                .classed("active", true)
                .classed("inactive", false);
            }
          }
        });

  });
}

makeResponsive();

d3.select(window).on("resize", makeResponsive);
