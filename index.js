//WAIT FOR DOCUMENT LOAD -- RENDER MAP
        $(document).ready(function(){
            assignButtonFuncs();
            loadD3Map();
        });



//SETUP AJAX FOR A LITTLE ERROR CHECKING
        $.ajaxSetup({
              "error":function() {
                            $('#locationClose').click();
                            console.log('Oops... error occured');
              }
        });



//GENERIC STRING TEMPLATING FUNCTION
        String.prototype.format = function() {
          var args = arguments;
          return this.replace(/{(\d+)}/g, function(match, number) { 
            return typeof args[number] != 'undefined'
              ? args[number]
              : match
            ;
          });
        };			



//CAPTURE THE CITY DATA -- LOAD THIS ONLY ONCE
        var capitolCityData;
        $.getJSON( "data_stateCapitols.json" , function(data){
            capitolCityData = data;
        });

        //Related functions for capitol city data
        function getCapitol(id){
            return capitolCityData[id];    
        }






function assignButtonFuncs(){
        //CLOSE FUNCTION CLICK ACTION
         $('#locationClose').click(function(){
            $('#locationTitle').html('');
            $('#locationWeather div').animate({ height: 'toggle', opacity: 'toggle' }, 'slow', function(){ $(this).remove() });
            $('#locationTweets div').animate({ height: 'toggle', opacity: 'toggle' }, 'slow', function(){ $(this).remove() });
            $(this).hide();
        });   
}


function loadD3Map(){
        //Create the new map object
        var path = d3.geo.path();
        var svg = d3.select("#d3_map").append("svg")
            .attr('viewBox',"0 -100 900 600")
            .attr('preserveAspectRatio',"xMinYMin meet")    
            .attr("width", 900)
            .attr("height", 600)
        ;
    
        svg.append("rect").attr("class", "background");   
        var g = svg.append("g");			 
    
        //Use D3 to load the usMap data file for print
        d3.json("data_usMap.json", function(error, topology) {
              g.append("g")
                .attr("id", "states")
                .selectAll("path")
                .data(topojson.feature(topology, topology.objects.states).features)
                .enter().append("path")
                .attr("d", path)
                .attr("class", "state")
                .attr("alt",   function(d) { return 'State ID:'+d.id; })                          
                .on("click", D3State_Click);  
        });
}




//Click function coming from the D3JS object.
function D3State_Click(d) {
            //Show the close button
            $('#locationClose').show();
    
            //Scroll to the top of the page
            window.scrollTo(0,0);

            //Capture the clicked state data
            var stateData = getCapitol(d.id);
            
            //Capture state realated information from the data file.
            var capitol = stateData.capital + ", " + stateData.state;
            var zip = stateData.zip;
            var geocodeURL  = "?geocode="+stateData.latitude+","+stateData.longitude+",50mi";
            
            
            var url;
    
    
            //COLLECT THE JSON ITEM FROM THE WEATHER CHANNEL
            //  USE THE PUBLIC YAHOO YQL INTERFACE FOR SOME CURRENT WEATHER DATA.
            url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20location%3D"+encodeURIComponent('"'+zip+'"')+"&format=json&diagnostics=true";
            $.getJSON( url, function( data ) {
                
                //CHANGE THE CITY TITLE
                    $('#locationTitle').html(capitol);
                
                //CHANGE THE WEATHER INFORMATION BOX
                    //Save the weather info from Yahoo -- data structure defined from them.
                    var htmlWeatherInfo = data.query.results.channel.item.description; 
                    
                    //Clear out past options
                    $('#locationWeather div').animate({ height: 'toggle', opacity: 'toggle' }, 'slow', function(){ $(this).remove() });
                    
                    //Via jquery - create a new wetherbox -- append to DOM
                    $('<div>')
                        .addClass('weatherBox well')
                        .html(htmlWeatherInfo)
                        .appendTo('#locationWeather');
            });
            
            
    
    
            //COLLECT THE JSON ITEM FROM CUSTOM SERVICE
            //  I HOLD A PASSTHROUGH REQUEST TO SEARCH FOR "  #weather OR #snow OR #ice OR #tornado OR weather  "
            //  THIS IS DONE BY API SECURITY AND PREFERENCE 
            url = "http://www.niccolgrove.com/Weather/php/twitter-api-php.php";
            $.getJSON(url + geocodeURL, function(data){

                //Clear out past displayed tweets
                $('#locationTweets div').animate({ height: 'toggle', opacity: 'toggle' }, 'slow', function(){ $(this).remove() });

                //Collect the tweet template from the DOM
                var template_tweet = $('#template_tweet').html();
                
                //Loop through the tweets
                $.each(data.statuses, function(i,item){

                    //Create a twitter div -- append the formatted twitter item
                    $('<div>')
                        .addClass('tweetBox')
                        .append(   template_tweet.format( item.id_str, item.user.name, item.text, item.user.profile_image_url)  )
                        .appendTo('#locationTweets');
                });

            });
}   
        


