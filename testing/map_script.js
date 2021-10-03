
// TODO
// experiment with orthographic globe...?
// reduce package weight
// other performance patches

// frees up padding space within squarespace DOM, may need to be updated with time
d3.select('#viz').select(function() { return this.parentNode.parentNode; })
    .style("padding-left", "0px")
    .style("padding-right", "0px")

//d3.select('#viz').style('height', '90vh')

const viz = d3.select("#viz"),
    dot_size = 3,
    zoom_speed = 2000,
    width = parseInt(viz.style("width")),
    height = parseInt(viz.style("height"))

function calcScale() {

    if (width / height > 2) {
        return height / 2.6
    } else {
        return width / 5
    }

}

var projection = {

    airocean: d3.geoAirocean()
                .scale(33)   //make dynamic
                .angle(210)
                .translate( [width/2, height*(7/16) ]),

    patterson: d3.geoNaturalEarth1()
                .rotate( [-10, 0] )
                .scale(calcScale())
                .translate( [width/2, height/2 ]),

}

const urls = {

    shapes: "https://raw.githubusercontent.com/tk-sheldo/westfield-map/c5e1780a78d9ab6683121ea771c1a9540cb00006/100m_countries.json",

    //point_data: "https://raw.githubusercontent.com/tk-sheldo/westfield-map/4889efce42885402c7c2c0008d2ac31f8c764f6c/json_processing/joined.json"
}

var this_projection = projection.patterson
if (is_mobile()) { this_projection = projection.airocean }

const geoPathGenerator = d3.geoPath().projection(this_projection);
const graticule = d3.geoGraticule();

var zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed)
var focus = null

const [point_data, features_data] = loadPointData()

function loadPointData() {

    const pd_spreadsheet_id = '1laJ6v2f77V3VhAX_RprMpZv1gquZ_POQ5-ufZcA2g80'
    const url = 'https://docs.google.com/spreadsheets/d/' + pd_spreadsheet_id + '/gviz/tq?tqx=out:json';
    var point_data_txt;

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            point_data_txt = xmlhttp.responseText;
        }
    };
    xmlhttp.open("GET", url, false);
    xmlhttp.send(null);

    // pulls json object from the text
    var pd_json = JSON.parse(point_data_txt.substr(47).slice(0, -2));   //might need to tweak slicing

    // structure of final data object
    var clean_pd = {
        "type": "FeatureCollection",
        "name": "geo_data",
        "crs": {
            "type": "name",
            "properties": {
                "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
            }
        },
        "features": []
    };


    // pulls the column headers from the spreadsheet
    var headers = [];
    for (var col=0; col<pd_json.table.cols.length; col++) { 
        headers[col] = pd_json.table.cols[col]["label"]; 
    }


    for (var row=0; row<pd_json.table.rows.length; row++) {

        // structure of each row object
        var obj = {"type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Point",
                "coordinates": []
            }
        }

        for (var header=0; header<headers.length; header++) {
            try {
                obj.properties[headers[header]] = pd_json.table.rows[row].c[header].v
            }
            catch {
                obj.properties[headers[header]] = null
            }
        }

        obj.geometry.coordinates[0] = obj.properties.lon
        obj.geometry.coordinates[1] = obj.properties.lat

        clean_pd.features[row] = obj

        console.log(obj.properties.feature == true);

    }

    

    var features_pd = JSON.parse(JSON.stringify(clean_pd));
    features_pd.features = features_pd.features.filter(point => point.properties.type == "feature");

    console.log(clean_pd);
    console.log(features_pd);

    return [clean_pd, features_pd]

}

class ZoomHint {

    constructor() {
        this.hint = viz.select('#zoom-hint')
        this.hint.on("mousedown", reset)
        this.speed = 1000
        this.hint.style('cursor', 'inherit')
    }

    enter() {
        this.hint.style('opacity', 1)
        this.hint.style('cursor', 'pointer')
    }

    leave() {
        this.hint.style('opacity', 0)
        this.hint.style('cursor', 'inherit')
        //setTimeout(() => { this.hint.remove(); }, this.speed);
    }
}

class Focus {

    constructor(side, data) {

        this.side = side
        this.data = data.properties

        this.speed = 1500
        this.desktop_reading_pos = "4%"

        this.div = viz.append("div")

        this.div.attr("id", "focus")
        
        this.fill_data()
    }

    /**
     * Fills focus html with content
     */
    fill_data() {

        var header = this.div.append("div").attr("id", "focus-header")
        header.append("img").attr("src", this.data.imageURL)


        var header_info = header.append("div").attr("id", "focus-header-info")
        header_info.append("p")
            .attr('id', 'name').html(this.data.name)
        header_info.append("p")
            .attr("id", "location")
            .html(this.data.location_name + ", " + this.data.country)

        this.div.append("div").attr("id", "focus-flavor-text")
            .append("p").html(this.data.text)
    }

    /**
     * Slides focus onto the viz
     */
    enter() {

        if (this.side == 'L') {
            this.div.style("left", "-100%")
            this.div.transition()
                .duration(this.speed)
                .style("left", this.desktop_reading_pos);
        } else {
            this.div.style("right", "-100%")
            this.div.transition()
                .duration(this.speed)
                .style("right", this.desktop_reading_pos);
        }    
    }

    /**
     * Slides focus out of the viz
     */
    leave() {

        if (this.side == 'L') {
            this.div.transition()
                .duration(this.speed)
                .style("left", "-100%");
        } else {
            this.div.transition()
                .duration(this.speed)
                .style("right", "-100%");
        }

        setTimeout(() => { this.div.remove(); }, this.speed);
    }
}

var zoom_hint = new ZoomHint()

// load data for map
d3.queue()
    .defer(d3.json, urls.shapes)
    .await(draw_map);

function draw_map(error, shapes) {

    if (error) throw error;

    if (!is_mobile()) {

        // draw oceans
        viz.select("#map").append('g')
            .attr('id', 'ocean')
            .append('path')
            .attr('d', geoPathGenerator({type: 'Sphere'}));

        // draw graticules
        var graticule = d3.geoGraticule();
        graticule.extent([[-180, -80],[180, 80.1]])
        viz.select("#map").append('g')
                .attr("id", "graticule")
                .append("path")
                .datum(graticule)
                .attr("d", geoPathGenerator);
    }

    // draw countries
    viz.select("#map").append( "g" )
        .attr("id", "countries")
        .selectAll( "path" )
        // Bind TopoJSON data elements, first geostiching them (for antarctica)
        .data(d3.geoStitch(topojson.feature(shapes, shapes.objects.ne_110m_admin_0_countries)).features)
        .enter().append("path")
            .attr("d", geoPathGenerator)
            .attr("id", function(d) {
                return d.properties.ADM0_A3;
            })

    // listener for zoom clicks
    viz.select("#map").append('rect')
        .attr("id", "reset-listener")
        .attr("width", width)
        .attr("height", height)
        .on("click", reset);

    viz.select("#map").append("g")
        .attr("id", "programs")
    .selectAll("circle")
        .data(point_data.features)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return this_projection(d.geometry.coordinates)[0]
        })
        .attr("cy", function(d) {
            return this_projection(d.geometry.coordinates)[1]
        })
        .attr("r", dot_size)
        .classed('program', true)
        .classed('feature', function(d) {    // FIX
            console.log(d.properties.feature == true);

            return d.properties.feature == true; 
        })
        .attr('class', function(d) {
            return d.properties.type;
        })


    const feat_radius = width / 60
        

    viz.select("#map").append("g")
        .attr("id", "features")
    .selectAll("circle")
        .data(point_data.features.filter(point => point.properties.feature))
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return this_projection(d.geometry.coordinates)[0]
        })
        .attr("cy", function(d) {
            return this_projection(d.geometry.coordinates)[1]
        })
        .attr("r", feat_radius)
        .attr('class', function(d) {
            return d.properties.type;
        })
        .classed('feature', true)
        .on("mouseover", function(d) {
            d3.select(this).transition()
                .duration("800")
                .ease(d3.easeQuadOut)
                .attr("r", feat_radius*1.3);
        })
        .on("mouseout", function(d) {
            d3.select(this).transition()
                .duration("800")
                .attr("r", feat_radius);
        })

    // program dots
    if (!(is_mobile())) {
        add_dot_listeners(viz.selectAll('.feature'))
    }
}

/**
 * Adds listener event for non-mobile screens
 * @param {Object} program_dots D3 reference to all program dots
 */
function add_dot_listeners(program_dots) {

    program_dots.on("mousedown", function(d) {

        select(d, this)

        // calc which side focus box should enter from 
        var entrance = 'L'
        if (this.getBBox().x < width/2) { entrance = 'R' }

        // create and bring in focus box
        focus = new Focus(entrance, d)
        focus.enter()

        zoom_to(d)
    })
}


/**
 * Handles generic (mobile-agnostic) selection of a program on the map
 * @param {Object} program_data Data associated with the selected program
 * @param {Object} program_ref Reference to the selected program
 */
function select(program_data, program_ref) {

    if (focus !== null) { focus.leave() }

    const country_id = "#" + program_data.properties.ADM0_A3

    viz.select("#countries").selectAll("path")
        .classed("unselected", true);

    viz.select("#countries").select(country_id)
        .classed("unselected", false)
        .classed("selected", true)

    viz.select("#programs").selectAll("circle")
        .classed("unselected", true)
    
    d3.select(program_ref).classed("unselected", false)
}


function is_mobile() { return (window.innerWidth < 500) }

function bounceFeatures() {
    d3.selectAll('.feature').transition().duration(1000).attr("r", 10)
      .on("end", function() {
        d3.select(this).transition().duration(1000).attr("r", 13)
          .on("end", function() { bounceFeatures(); });
      });
}

bounceFeatures()


/**
 * Calculates and excecutes zoom to a given program
 * @param {Object} d Data associated with the program to be zoomed to
 */
function zoom_to(d) {

    var x = this_projection(d.geometry.coordinates)[0],
        y = this_projection(d.geometry.coordinates)[1],
        scale = 5,
        translate = null

    // adjust centering of zoom to compensate for focus box

    if (focus.side == 'R') {
        translate = [width / 4 - scale * x, height / 2 - scale * y];
    } else {
        translate = [ (3/4 * width) - scale * x, height / 2 - scale * y];
    }

    // zoom
    viz.select("#map").transition()
        .duration(zoom_speed)
        .call( zoom.transform, 
            d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) );

    zoom_hint.enter();
    viz.select("#legend").transition()
        .style("opacity", 0);
}

/**
 * Zoom  function
 */
function zoomed() {

    let transform = d3.event.transform

    viz.select('#map').selectAll('g').attr("transform", transform)

    viz.select("#programs").selectAll("circle")
        .attr("r", dot_size / transform.scale(1).k)

    //viz.select("#legend").style("opacity", 0)
    //setTimeout(() => { viz.select("#legend").remove(); }, zoom_speed);
}

/**
 * Remove highlight classes, focus, and zoom hint. Zoom to outer scope.
 */
function reset() {

    if (focus !== null) { focus.leave() }
    zoom_hint.leave()

    viz.select("#countries").selectAll("path")
        .classed("selected", false).classed("unselected", false);

    viz.select("#programs").selectAll("circle")
        .classed("unselected", false);

    viz.select("#legend").style("opacity", 1)

    viz.select("#map").transition()
        .duration(zoom_speed)
        .call( zoom.transform, d3.zoomIdentity );
}
