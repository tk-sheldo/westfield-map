
// TODO
// experiment with orthographic globe...?
// reduce package weight
// other performance patches

// frees up padding space within squarespace DOM, may need to be updated with time
d3.select('#viz').select(function() { return this.parentNode.parentNode; })
    .style("padding-left", "0px")
    .style("padding-right", "0px")

d3.select('#viz').style('height')

const viz = d3.select("#viz"),
    dot_size = 4,
    zoom_speed = 2000,
    width = parseInt(viz.style("width")),
    height = parseInt(viz.style("height"))

var projection = {

    waterman: d3.geoPolyhedralWaterman()
                .rotate( [20, 0] )
                .scale(Math.min(((window.innerWidth / 6) - 16), 180))
                .translate( [width/2, height/2]),

    airocean: d3.geoAirocean()
                .scale(33)   //make dynamic
                .angle(210)
                .translate( [width/2, height*(7/16) ]),

    patterson: d3.geoNaturalEarth1()
                .rotate( [-10, 0] )
                .scale((window.innerWidth / 5))
                .translate( [width/2, height/2 ]),

                //860 -> 170
                //1280 -> 240

    mercator: d3.geoMercator()
                .scale( 50 )
                .rotate( [0,0] )
                .center( [0, 0] )
                .translate( [width/2,height/2] )
}

const urls = {

    shapes: "https://raw.githubusercontent.com/tk-sheldo/westfield-map/c5e1780a78d9ab6683121ea771c1a9540cb00006/100m_countries.json",

    point_data: "https://raw.githubusercontent.com/tk-sheldo/westfield-map/4889efce42885402c7c2c0008d2ac31f8c764f6c/json_processing/joined.json"
}

var this_projection = projection.waterman
if (is_mobile()) { this_projection = projection.airocean }

const geoPathGenerator = d3.geoPath().projection(this_projection);

const graticule = d3.geoGraticule();

var zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed)
var focus = null



// TESTING IMPORTS

const spreadsheetId = '1laJ6v2f77V3VhAX_RprMpZv1gquZ_POQ5-ufZcA2g80'
//var tx = fetch('https://docs.google.com/spreadsheets/d/1laJ6v2f77V3VhAX_RprMpZv1gquZ_POQ5-ufZcA2g80/gviz/tq?tqx=out:json')

// for testing only
var pd_txt_testing = '/*O_o*/google.visualization.Query.setResponse({"version":"0.6","reqId":"0","status":"ok","sig":"739552415","table":{"cols":[{"id":"A","label":"type","type":"string"},{"id":"B","label":"name","type":"string"},{"id":"C","label":"location_name","type":"string"},{"id":"D","label":"lat","type":"number","pattern":"General"},{"id":"E","label":"lon","type":"number","pattern":"General"},{"id":"F","label":"country","type":"string"},{"id":"G","label":"ADM0_A3","type":"string"},{"id":"H","label":"text","type":"string"},{"id":"I","label":"imageURL","type":"string"}],"rows":[{"c":[{"v":"student"},{"v":"Estino"},{"v":"Naples"},{"v":40.85,"f":"40.85"},{"v":14.24,"f":"14.24"},{"v":"Italy"},{"v":"ITA"},{"v":"I grew up in Naples, the son of a pizza maker. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque fermentum commodo accumsan. Donec vehicula rutrum dictum. Maecenas eget commodo leo, ut interdum turpis. Duis sollicitudin sem non lectus auctor, et interdum sapien facilisis. Etiam sagittis imperdiet hendrerit. Mauris tempus."},{"v":"https://images.squarespace-cdn.com/content/v1/5f2d83cd0a4c0b1683b8711e/1614976174924-B6WAYGUH830ISQ0FLRFS/ke17ZwdGBToddI8pDm48kEbpNpz_g84ww2Q11MA-atpZw-zPPgdn4jUwVcJE1ZvWEtT5uBSRWt4vQZAgTJucoTqqXjS3CfNDSuuf31e0tVFBtEgj52mM8uXJqXwNJ9DglJgC4wo-TZ2620CX9P9wUp1zDMfxjoXGDCxwz3Y9Vxg/IMG_1865.jpeg?format=1000w"}]},{"c":[{"v":"student"},{"v":"Ricardo"},{"v":"Valparaíso"},{"v":-33.05,"f":"-33.05"},{"v":-71.62,"f":"-71.62"},{"v":"Chile"},{"v":"CHL"},{"v":"I moved to Hartford in 2017. Westfield is the cat\u0027s pajamas. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque fermentum commodo accumsan. Donec vehicula rutrum dictum. Maecenas eget commodo leo, ut interdum turpis. Duis sollicitudin sem non lectus auctor, et interdum sapien facilisis. Etiam sagittis imperdiet hendrerit."},{"v":"https://www.sciencemag.org/sites/default/files/styles/article_main_large/public/dogs_1280p_0.jpg?itok=cnRk0HYq"}]},{"c":[{"v":"tournament"},{"v":"The French Open"},{"v":"Paris"},{"v":48.87,"f":"48.87"},{"v":2.33,"f":"2.33"},{"v":"France"},{"v":"FRA"},{"v":"Westfield students Estino and Ricardo attended the 2020 French Open. Both qualified for the semifinals. Quisque fermentum commodo accumsan. Donec vehicula rutrum dictum. Maecenas eget commodo leo, ut interdum turpis. Duis sollicitudin sem non lectus auctor, et interdum sapien facilisis. Etiam sagittis imperdiet hendrerit."},{"v":"https://photoresources.wtatennis.com/photo-resources/2019/10/11/670f0c75-7b3a-479c-98e8-84964dad9a52/XmhwYQkb.jpg?width=1440&height=797"}]},{"c":[{"v":"speaker"},{"v":"xx"},{"v":"xx"},{"v":44.0,"f":"44"},{"v":-116.0,"f":"-116"},{"v":"xx"},{"v":"xx"},{"v":"xx"},{"v":"https://photoresources.wtatennis.com/photo-resources/2019/10/11/670f0c75-7b3a-479c-98e8-84964dad9a52/XmhwYQkb.jpg?width=1440&height=797"}]},{"c":[{"v":"tournament"},{"v":"xx"},{"v":"xx"},{"v":35.0,"f":"35"},{"v":-110.0,"f":"-110"},{"v":"xx"},{"v":"xx"},{"v":"xx"},{"v":"https://photoresources.wtatennis.com/photo-resources/2019/10/11/670f0c75-7b3a-479c-98e8-84964dad9a52/XmhwYQkb.jpg?width=1440&height=798"}]},{"c":[{"v":"student"},{"v":"xx"},{"v":"xx"},{"v":41.0,"f":"41"},{"v":100.0,"f":"100"},{"v":"xx"},{"v":"xx"},{"v":"xx"},{"v":"https://photoresources.wtatennis.com/photo-resources/2019/10/11/670f0c75-7b3a-479c-98e8-84964dad9a52/XmhwYQkb.jpg?width=1440&height=799"}]},{"c":[{"v":"speaker"},{"v":"xx"},{"v":"xx"},{"v":42.0,"f":"42"},{"v":130.0,"f":"130"},{"v":"xx"},{"v":"xx"},{"v":"xx"},{"v":"https://photoresources.wtatennis.com/photo-resources/2019/10/11/670f0c75-7b3a-479c-98e8-84964dad9a52/XmhwYQkb.jpg?width=1440&height=800"}]},{"c":[{"v":"tournament"},{"v":"xx"},{"v":"xx"},{"v":-2.0,"f":"-2"},{"v":-30.0,"f":"-30"},{"v":"xx"},{"v":"xx"},{"v":"xx"},{"v":"https://photoresources.wtatennis.com/photo-resources/2019/10/11/670f0c75-7b3a-479c-98e8-84964dad9a52/XmhwYQkb.jpg?width=1440&height=801"}]},{"c":[{"v":"student"},{"v":"xx"},{"v":"xx"},{"v":-10.0,"f":"-10"},{"v":48.0,"f":"48"},{"v":"xx"},{"v":"xx"},{"v":"xx"},{"v":"https://photoresources.wtatennis.com/photo-resources/2019/10/11/670f0c75-7b3a-479c-98e8-84964dad9a52/XmhwYQkb.jpg?width=1440&height=802"}]},{"c":[{"v":"speaker"},{"v":"xx"},{"v":"xx"},{"v":-24.0,"f":"-24"},{"v":25.0,"f":"25"},{"v":"xx"},{"v":"xx"},{"v":"xx"},{"v":"https://photoresources.wtatennis.com/photo-resources/2019/10/11/670f0c75-7b3a-479c-98e8-84964dad9a52/XmhwYQkb.jpg?width=1440&height=803"}]},{"c":[{"v":"tournament"},{"v":"xx"},{"v":"xx"},{"v":56.0,"f":"56"},{"v":-80.0,"f":"-80"},{"v":"xx"},{"v":"xx"},{"v":"xx"},{"v":"https://photoresources.wtatennis.com/photo-resources/2019/10/11/670f0c75-7b3a-479c-98e8-84964dad9a52/XmhwYQkb.jpg?width=1440&height=804"}]},{"c":[{"v":"student"},{"v":"xx"},{"v":"xx"},{"v":48.0,"f":"48"},{"v":50.0,"f":"50"},{"v":"xx"},{"v":"xx"},{"v":"xx"},{"v":"https://photoresources.wtatennis.com/photo-resources/2019/10/11/670f0c75-7b3a-479c-98e8-84964dad9a52/XmhwYQkb.jpg?width=1440&height=805"}]},{"c":[{"v":"speaker"},{"v":"xx"},{"v":"xx"},{"v":-34.0,"f":"-34"},{"v":-138.0,"f":"-138"},{"v":"xx"},{"v":"xx"},{"v":"xx"},{"v":"https://photoresources.wtatennis.com/photo-resources/2019/10/11/670f0c75-7b3a-479c-98e8-84964dad9a52/XmhwYQkb.jpg?width=1440&height=806"}]},{"c":[{"v":"tournament"},{"v":"xx"},{"v":"xx"},{"v":36.0,"f":"36"},{"v":3.0,"f":"3"},{"v":"xx"},{"v":"xx"},{"v":"xx"},{"v":"https://photoresources.wtatennis.com/photo-resources/2019/10/11/670f0c75-7b3a-479c-98e8-84964dad9a52/XmhwYQkb.jpg?width=1440&height=807"}]},{"c":[{"v":"student"},{"v":"xx"},{"v":"xx"},{"v":52.0,"f":"52"},{"v":4.0,"f":"4"},{"v":"xx"},{"v":"xx"},{"v":"xx"},{"v":"https://photoresources.wtatennis.com/photo-resources/2019/10/11/670f0c75-7b3a-479c-98e8-84964dad9a52/XmhwYQkb.jpg?width=1440&height=808"}]},{"c":[{"v":"speaker"},{"v":"xx"},{"v":"xx"},{"v":39.0,"f":"39"},{"v":32.0,"f":"32"},{"v":"xx"},{"v":"xx"},{"v":"xx"},{"v":"https://photoresources.wtatennis.com/photo-resources/2019/10/11/670f0c75-7b3a-479c-98e8-84964dad9a52/XmhwYQkb.jpg?width=1440&height=809"}]},{"c":[{"v":"tournament"},{"v":"xx"},{"v":"xx"},{"v":-25.0,"f":"-25"},{"v":57.0,"f":"57"},{"v":"xx"},{"v":"xx"},{"v":"xx"},{"v":"https://photoresources.wtatennis.com/photo-resources/2019/10/11/670f0c75-7b3a-479c-98e8-84964dad9a52/XmhwYQkb.jpg?width=1440&height=810"}]},{"c":[{"v":"student"},{"v":"xx"},{"v":"xx"},{"v":37.0,"f":"37"},{"v":-23.0,"f":"-23"},{"v":"xx"},{"v":"xx"},{"v":"xx"},{"v":"https://photoresources.wtatennis.com/photo-resources/2019/10/11/670f0c75-7b3a-479c-98e8-84964dad9a52/XmhwYQkb.jpg?width=1440&height=811"}]},{"c":[{"v":"speaker"},{"v":"xx"},{"v":"xx"},{"v":-36.0,"f":"-36"},{"v":174.0,"f":"174"},{"v":"xx"},{"v":"xx"},{"v":"xx"},{"v":"https://photoresources.wtatennis.com/photo-resources/2019/10/11/670f0c75-7b3a-479c-98e8-84964dad9a52/XmhwYQkb.jpg?width=1440&height=812"}]},{"c":[{"v":"tournament"},{"v":"xx"},{"v":"xx"},{"v":13.0,"f":"13"},{"v":100.0,"f":"100"},{"v":"xx"},{"v":"xx"},{"v":"xx"},{"v":"https://photoresources.wtatennis.com/photo-resources/2019/10/11/670f0c75-7b3a-479c-98e8-84964dad9a52/XmhwYQkb.jpg?width=1440&height=813"}]},{"c":[{"v":"student"},{"v":"xx"},{"v":"xx"},{"v":41.0,"f":"41"},{"v":2.0,"f":"2"},{"v":"xx"},{"v":"xx"},{"v":"xx"},{"v":"https://photoresources.wtatennis.com/photo-resources/2019/10/11/670f0c75-7b3a-479c-98e8-84964dad9a52/XmhwYQkb.jpg?width=1440&height=814"}]},{"c":[{"v":"speaker"},{"v":"xx"},{"v":"xx"},{"v":39.0,"f":"39"},{"v":116.0,"f":"116"},{"v":"xx"},{"v":"xx"},{"v":"xx"},{"v":"https://photoresources.wtatennis.com/photo-resources/2019/10/11/670f0c75-7b3a-479c-98e8-84964dad9a52/XmhwYQkb.jpg?width=1440&height=815"}]},{"c":[{"v":"tournament"},{"v":"xx"},{"v":"xx"},{"v":-1.0,"f":"-1"},{"v":-48.0,"f":"-48"},{"v":"xx"},{"v":"xx"},{"v":"xx"},{"v":"https://photoresources.wtatennis.com/photo-resources/2019/10/11/670f0c75-7b3a-479c-98e8-84964dad9a52/XmhwYQkb.jpg?width=1440&height=816"}]},{"c":[{"v":"student"},{"v":"xx"},{"v":"xx"},{"v":54.0,"f":"54"},{"v":-5.0,"f":"-5"},{"v":"xx"},{"v":"xx"},{"v":"xx"},{"v":"https://photoresources.wtatennis.com/photo-resources/2019/10/11/670f0c75-7b3a-479c-98e8-84964dad9a52/XmhwYQkb.jpg?width=1440&height=817"}]},{"c":[{"v":"speaker"},{"v":"xx"},{"v":"xx"},{"v":44.0,"f":"44"},{"v":20.0,"f":"20"},{"v":"xx"},{"v":"xx"},{"v":"xx"},{"v":"https://photoresources.wtatennis.com/photo-resources/2019/10/11/670f0c75-7b3a-479c-98e8-84964dad9a52/XmhwYQkb.jpg?width=1440&height=818"}]},{"c":[{"v":"tournament"},{"v":"xx"},{"v":"xx"},{"v":52.0,"f":"52"},{"v":13.0,"f":"13"},{"v":"xx"},{"v":"xx"},{"v":"xx"},{"v":"https://photoresources.wtatennis.com/photo-resources/2019/10/11/670f0c75-7b3a-479c-98e8-84964dad9a52/XmhwYQkb.jpg?width=1440&height=819"}]},{"c":[{"v":"student"},{"v":"xx"},{"v":"xx"},{"v":52.0,"f":"52"},{"v":1.0,"f":"1"},{"v":"xx"},{"v":"xx"},{"v":"xx"},{"v":"https://photoresources.wtatennis.com/photo-resources/2019/10/11/670f0c75-7b3a-479c-98e8-84964dad9a52/XmhwYQkb.jpg?width=1440&height=820"}]}],"parsedNumHeaders":1}});'

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

    return point_data_txt
}

function cleanPointData(point_data_txt) {

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

        console.log("row", row);

        // structure of each row object
        var obj = {"type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Point",
                "coordinates": []
            }
        }

        var i = 0;

        for (var header=0; header<headers.length; header++) {
            i = i + 1;
            console.log(header);
            console.log(pd_json);
            console.log(pd_json.table.rows[row]);
            console.log(pd_json.table.rows[row].c);
            console.log(pd_json.table.rows[row].c[header]);

            obj.properties[headers[header]] = pd_json.table.rows[row].c[header].v
        }

        obj.geometry.coordinates[0] = obj.properties.lon
        obj.geometry.coordinates[1] = obj.properties.lat

        clean_pd.features[row] = obj

    }

    return clean_pd

}

const pd_txt = loadPointData()
const point_data = cleanPointData(pd_txt)


class ZoomHint {

    constructor() {
        this.hint = viz.select('#zoom-hint')
        this.hint.on("mousedown", reset)
        this.speed = 1000

        if (is_mobile()) {
            this.hint.style("padding", "5%")
        }
    }

    enter() {
        this.hint.style('opacity', 1)
    }

    leave() {
        this.hint.style('opacity', 0)
        //setTimeout(() => { this.hint.remove(); }, this.speed);
    }
}

class Focus {

    constructor(side, data) {

        this.side = side
        this.data = data.properties

        this.speed = 1500
        this.desktop_reading_pos = "4%"
        this.mobile_reading_pos = "2%"

        this.div = viz.append("div")

        if (is_mobile()) {
            this.div.attr("id", "mobile-focus")
        } else {
            this.div.attr("id", "focus")
        }
        
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

        if (is_mobile()) {
            this.div.style("top", "-100%")
            this.div.transition()
                    .duration(this.speed)
                    .style("top", this.mobile_reading_pos);
        } else {
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
    }

    /**
     * Slides focus out of the viz
     */
    leave() {

        if (is_mobile()) {
            this.div.transition()
                .duration(this.speed)
                .style("top", "-100%")
        } else {
            if (this.side == 'L') {
                this.div.transition()
                    .duration(this.speed)
                    .style("left", "-100%");
            } else {
                this.div.transition()
                    .duration(this.speed)
                    .style("right", "-100%");
            }
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
        .attr('class', function(d) {

            if (d.properties.type == "student") {
                return "student"
            }
            else if (d.properties.type == "speaker") {
                return "speaker"
            }
            else {
                return "tournament"
            }
        })
        .classed('program', true)

    // program dots
    if (is_mobile()) {
        add_mobile_dot_listeners(point_data)
    } else {
        add_dot_listeners(viz.selectAll('.program'))
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
 * Adds listener elements for mobile screens
 * @param {Object} point_data Program data associated with points
 */
function add_mobile_dot_listeners(point_data) {

    viz.select("#map").append("g")
        .attr("id", "program-shadows")
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
        .attr("r", dot_size * 4)
        .on("mousedown", function(d) {

            select(d, this)

            // create and bring in focus box
            focus = new Focus('L', d)   //'L' is placeholder, doesn't matter for mobile
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

    if (is_mobile()) {
        translate = [width / 2 - scale * x, (4/5) * height  - scale * y]

    } else {
        if (focus.side == 'R') {
            translate = [width / 4 - scale * x, height / 2 - scale * y];
        } else {
            translate = [ (3/4 * width) - scale * x, height / 2 - scale * y];
        }
    }

    // zoom
    viz.select("#map").transition()
        .duration(zoom_speed)
        .call( zoom.transform, 
            d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) );

    zoom_hint.enter()
    viz.select("#legend").style("opacity", 0)
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
