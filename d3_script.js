// Define URLs for our zipcode shapes, and restaurant data
var ZIPCODE_URL1 = "https://raw.githubusercontent.com/karansaini282/out_repo/master/d3_puma_la.csv";
var ZIPCODE_URL2 = "https://raw.githubusercontent.com/karansaini282/out_repo/master/d3_puma_sf.csv";
var ZIPCODE_URL3 = "https://raw.githubusercontent.com/karansaini282/out_repo/master/d3_puma_ny.csv";
var ZIPCODE_URL4 = "https://raw.githubusercontent.com/karansaini282/out_repo/master/d3_puma_chic.csv";
var MAP_URL1 = "https://raw.githubusercontent.com/karansaini282/out_repo/master/d3_puma_la.geojson";
var MAP_URL2 = "https://raw.githubusercontent.com/karansaini282/out_repo/master/d3_puma_sf.geojson";
var MAP_URL3 = "https://raw.githubusercontent.com/karansaini282/out_repo/master/d3_puma_ny.geojson";
var MAP_URL4 = "https://raw.githubusercontent.com/karansaini282/out_repo/master/d3_puma_chic.geojson";

createChart('ny',false,'','36_3710');


function createChart(city,is_color,color,puma_id) {
  console.log(puma_id);
  var city_map_dict = {'sf':ZIPCODE_URL2,'la':ZIPCODE_URL1,'ny':ZIPCODE_URL3,'chic':ZIPCODE_URL4};
  var city_map_url = city_map_dict[city];
  d3.csv(city_map_url).then(data_main=>
  {
  
  var zipcodes = data_main;
  var data = zipcodes;
  var center = {'ny':[-73.275,40.6],'chic':[-87.62,41.57],'la':[-117.21,33.86],'sf':[-121.97,37.25]};
  var zoom = {'ny':8.0,'chic':8.4,'la':7.5,'sf':8.4};

  let svg        = d3.select('#chart').select("#svg1"),
      gMap       = svg.select("g"),
      canvasSize = [700, 700];
      
    var projection = d3.geoMercator()
      .scale(Math.pow(2, zoom[city] + 5.34))
      .center(center[city])
      .translate([(canvasSize[0]/2)-50,canvasSize[1]/2]);

  var path = d3.geoPath()
    .projection(projection);
  
  // Let's create a path for each (new) zipcode shape
  gMap.selectAll(".zipcode")
  .remove();
  
  plot_data = data.filter(d=>d.origin_puma==puma_id);
  
  var city_data_dict = {'sf':MAP_URL2,'la':MAP_URL1,'ny':MAP_URL3,'chic':MAP_URL4};
  var city_data_url = city_data_dict[city];
    
  var city_puma_dict = {'sf':'06_101','la':'06_3701','ny':'36_3710','chic':'17_3005'};
  
  d3.json(city_data_url).then(map_data=>  
  {
    // Handler for dropdown value change
    var dropdownChange = function() {
      var new_puma_id = d3.select(this).property('value');
      createChart(city,is_color,color,new_puma_id);
    };

    var dropdown = d3.select('#selectButton')
    .on("change", dropdownChange)
    .attr("transform", `translate(10, -200)`);

    dropdown.selectAll("option")
    .remove()
    
    dropdown.selectAll("option")
      .data(map_data.features)
      .enter().append("option")
      .attr("value", function (d) { return d.properties.puma_id; })
      .text(function (d) {
      return d.properties.NAMELSAD10;
    })
    .property("selected", function(d){ return d.properties.puma_id == puma_id; });
    
    gMap.selectAll(".zipcode")
      .data(map_data.features)
      .enter().append("path")
        .attr("class", "zipcode")
        .attr("d", path)
        .on('click',d=>{
      id = d.dest_puma?d.dest_puma:d.properties.puma_id;
      createChart(city,is_color,color,id);
      });

    gMap.selectAll(".zipcode")
        .style("fill", "white");

    if(is_color){
      plot_data = data.filter(d=>d.origin_puma==puma_id).filter(d=>((d.color==color)||(d.dest_puma==puma_id)));
    }

    gMap.selectAll(".zipcode")
        .data(plot_data, myKey)
        .style("fill", d => {
        id = d.dest_puma?d.dest_puma:d.properties.puma_id;
        if(id==puma_id){
          return 'blue';
        }
        else{
          return d.color; 
        }        
        });

    var gMap2 = d3.select('#chart').select("#svg2").select('g');
    var pArea = [50, 50, 390, 460];
    var pSize = [pArea[2]-pArea[0], pArea[3]-pArea[1]];
    var legend = gMap2.append("g")
      .attr("transform", `translate(10, ${pArea[1]+10})`);

    legend.append("rect")
      .attr("class", "legend--frame")
      .attr("x", -5)
      .attr("y", -5)
      .attr("width", 110)
      .attr("height", 80);

    var legendItems = legend.selectAll(".legend--item--box")
      .data(["ny", "la", "chic", "sf"])
      .enter().append("g")
      .on("click", d => {
        createChart(d,is_color,color,city_puma_dict[d]);
      });
    
    legendItems.append("rect")
        .attr("class", "legend--item--box")
        .attr("x", 0)
        .attr("y", (d,i) => (i*20))
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", (d,i) => (d==city?"black":"white"));

    legendItems.append("text")
        .attr("class", "legend--item--label")
        .attr("x", 20)
        .attr("y", (d,i) => (9+i*20))
        .text((d, i) => d);

    var net_dist = {'chic':['0:5000',  '5000:10000',   '10000:25000',      '25000:50000',    '50000:100000',   '100000:249000'],'sf':['0:5000',  '5000:10000',   '10000:25000',      '25000:50000',    '50000:100000',   '100000:294000'],'la':['0:5000',  '5000:10000',   '10000:25000',      '25000:50000',    '50000:100000',   '100000:533000'],'ny':['0:5000',  '5000:10000',   '10000:25000',      '25000:50000',    '50000:100000',   '100000:723000']};

    var pArea2 = [50, 50, 390, 460];
    var pSize2 = [pArea2[2]-pArea2[0], pArea2[3]-pArea2[1]];
    var palette2 = ['green','lime','yellow','orange','red','darkred'];  
    var legend2 = gMap2.append("g")
      .attr("transform", `translate(10, ${pArea2[1]+100})`);

    legend2.append("rect")
      .attr("class", "legend--frame")
      .attr("x", -5)
      .attr("y", -5)
      .attr("width", 110)
      .attr("height", 130)
      .on("click",(d,i)=>{createChart(city,false,'',puma_id);});

    var legendItems2 = legend2.selectAll(".legend--item--box")
      .data(net_dist[city])
      .enter().append("g")
      .on("click", (d,i) => {
        createChart(city,true,palette2[i],puma_id);
      });

    legendItems2.append("rect")
        .attr("class", "legend--item--box")
        .attr("x", 0)
        .attr("y", (d,i) => (i*20))
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", (d,i) => palette2[i]);

    legendItems2.append("text")
        .attr("class", "legend--item--label")
        .attr("x", 20)
        .attr("y", (d,i) => (9+i*20))
        .attr('font-size','12px')
        .text((d, i) => d);
    
    var pArea3 = [50, 50, 390, 100];
    var pSize3 = [pArea3[2]-pArea3[0], pArea3[3]-pArea3[1]];
    var palette3 = ['blue'];  
    var legend3 = gMap2.append("g")
      .attr("transform", `translate(10, ${pArea3[1]+232})`);

    legend3.append("rect")
      .attr("class", "legend--frame")
      .attr("x", -5)
      .attr("y", -5)
      .attr("width", 110)
      .attr("height", 20);

    var legendItems3 = legend3.selectAll(".legend--item--box")
      .data(['Current PUMA'])
      .enter().append("g");

    legendItems3.append("rect")
        .attr("class", "legend--item--box")
        .attr("x", 0)
        .attr("y", (d,i) => (i*20))
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", (d,i) => palette3[i]);

    legendItems3.append("text")
        .attr("class", "legend--item--label")
        .attr("x", 20)
        .attr("y", (d,i) => (9+i*20))
        .attr('font-size','12px')
        .text((d, i) => d);    
    
    var pArea4 = [50, 50, 390, 460];
    var pSize4 = [pArea4[2]-pArea4[0], pArea4[3]-pArea4[1]];
    
    var legend4 = gMap2.append("g")
      .attr("transform", `translate(10, ${pArea4[1]+245})`);

    legend4.append("image")
      .attr("xlink:href", "https://raw.githubusercontent.com/karansaini282/out_repo/master/reset.jpg")
      .attr("x", -5)
      .attr("y", 5)
      .attr("width", 120)
      .attr("height", 60)
      .on("click", (d,i) => {
        createChart(city,false,'',city_puma_dict[city]);
      });    
  
  });
  
  });
}

function myKey(d) {
  return (d.dest_puma?d.dest_puma:d.properties.puma_id);
}
