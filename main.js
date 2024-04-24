document.addEventListener('DOMContentLoaded', function() {
    function setProjection(width, height) {
        const projection = d3.geoOrthographic()
            .translate([width / 2, height / 2])
            .scale(width / 4)
            .clipAngle(90);

        return { projection, path: d3.geoPath().projection(projection) };
    }

    function initializeChart(containerId, data) {
        const container = d3.select(containerId);
        const width = parseInt(container.style("width"));
        const height = width / 2;

        const { projection, path } = setProjection(width, height);

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`);

        const mars = svg.append("path")
            .datum({type: "Sphere"})
            .attr("fill", "url(#marsGradient)")
            .style("filter", "url(#innerShadow)");

        const craters = svg.selectAll("path.crater")
            .data(data)
            .enter()
            .append("path")
            .attr("fill", "url(#craterGradient)")
            .attr("stroke", "#902020")
            .attr("stroke-width", 0.5)
            .on("mouseover", function(event, d) {
                const tooltip = d3.select("#marsTooltip");
                const svgRect = document.getElementById('mars').getBoundingClientRect();
                const tooltipWidth = tooltip.node().offsetWidth;
                const tooltipHeight = tooltip.node().offsetHeight;
                tooltip
                    .style("display", "inline-block")
                    .html(`${d.name}`)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY) + "px")
                    .transition()
                    .duration(250)
                    .style("opacity", 1)
                    .style("transform", "translate3d(0, -20px, 0)")
            })
            .on("mouseout", function() {
                d3.select("#marsTooltip")
                .transition()
                .duration(250)
                .style("opacity", 0)
                .style("transform", "translate3d(0, -10px, 0)");
            });
            
        let rotation = [0, 0];
        const velocity = [0.2, 0.1];

        function update() {
            rotation[0] += velocity[0];
            rotation[1] += velocity[1];
            projection.rotate(rotation);
            mars.attr("d", path);
            craters.attr("d", d => path(d3.geoCircle().center([d.long, d.lat]).radius(d.diam)()));
        }
        
        d3.timer(update);
        
        return svg;
    }

    d3.csv("Mars Crater info.csv", d => ({
        name: d.CRATER_NAME,
        long: +d.LONGITUDE_CIRCLE_IMAGE,
        lat: +d.LATITUDE_CIRCLE_IMAGE,
        diam: +d.DIAM_CIRCLE_IMAGE / 65
    })).then(data => {
        const filteredCraters = data
            .filter(d => d.name.trim() !== "")
            .sort((a, b) => b.diam - a.diam)
            .slice(0, 100);

        initializeChart("#mars", filteredCraters);
    });
});
