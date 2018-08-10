/*!
 * jQuery plugin to transform Google Spreadsheet to HTML Tables
 * Original author: @davidayalas
 * Licensed under the MIT license
 */

(function ( $ ) {

    //Transforms google spreadsheet json to array
    var createGsMatrix = function(results){
        var gs_matrix = [], gs_col, gs_row;

        var orders = {
          setted : {},
          get : function(l){
            if(!this.setted[l]){
              var ncols = 26;
              var col = 0;
              for(var i=l.length;i>0;i--){
                col += ((l.charCodeAt(i-1)-65)+1)*(Math.pow(ncols,(l.length-i)));
              }
              this.setted[l] = col-1;
            }
            return this.setted[l];
          },
        }

        //creates gs_matrix
        var gs_max_cols = 0;
        for(var i=0,z=results.feed.entry.length;i<z;i++){
          gs_col = orders.get(results.feed.entry[i].title.$t.slice(0,1));
          gs_max_cols = (gs_max_cols<=gs_col?gs_col:gs_max_cols);
          gs_row = parseInt(results.feed.entry[i].title.$t.slice(1))-1;
          if(!gs_matrix[gs_row]){
            gs_matrix[gs_row]=[];
          }
          gs_matrix[gs_row][gs_col]=results.feed.entry[i].content.$t;
        }

        //fill empty cells
        gs_matrix.map(function(r){
            for(var k=0;k<=gs_max_cols;k++){
                if(!r[k]){r[k]=""}
            }
        });
        return gs_matrix;
    }
 
    $.drawTables = function(options) {
 
        var settings = $.extend({
            spreadsheet : "1c_vDuF6yEuLHDKANUk_2drO0HFIgWQRqrWN3GIVGFRg",
            desktop_container : "body",
            responsive_container : "body",
            desktop_css : "",
            responsive_css : ""
        }, options );

        var drawTable = function(gs_matrix){
            if(!settings.desktop_container){
                return;
            }
            var id = "gs_table_" + (+new Date());
            var container = settings.desktop_container;
            $("<table id='"+id+"' class='gs_desktop_table "+settings.desktop_css+"'><thead></thead><tbody></tbody></table>").appendTo(container);
            id = "#" + id;
            for(var i=0;i<gs_matrix.length;i++){
              if(gs_matrix[i]){
                $("<tr></tr>").appendTo(id + (i===0?" thead":" tbody"));
                for(var k=0,y=gs_matrix[i].length;k<y;k++){
                  $("<"+(i===0 || k===0?"th":"td") + (k===0 && i>1?" scope='row'":" ") + "" + (i===0?" scope='col'":" ") + " data-label='"+gs_matrix[0][k]+"'>"+gs_matrix[i][k]+"</"+(i===0 || k===0?"th":"td")+">").appendTo(id+ (i===0?" thead":" tbody") + " tr:last");
                }
              }
            }           
        }

        var drawResponsiveTable = function(gs_matrix){
            if(!settings.responsive_container){
                return;
            }
            var id = "gs_table_" + (+new Date());
            var container = settings.responsive_container;
            $("<table id='"+id+"' class='gs_responsive_table "+settings.responsive_css+"'><thead></thead><tbody></tbody></table>").appendTo(container);
            id = "#" + id;
            var colspan = (gs_matrix && gs_matrix[0] && gs_matrix[0][0]?false:true);
            for(var i=0;i<gs_matrix[0].length;i++){
                if(gs_matrix[0][i]){
                    $("<tr><th "+(colspan?"colspan='2'":"")+" class='gs_responsive_th'>"+gs_matrix[0][i]+"</th></tr>").appendTo(id + " tbody");
                    for(var k=1,y=gs_matrix.length;k<y;k++){
                        if(gs_matrix[k][i] && (i>0 || !colspan)){
                            $("<tr>"+(colspan?"<th>"+gs_matrix[k][0]+"</th>":"")+"<td>"+gs_matrix[k][i]+"</td></tr>").appendTo(id + " tbody");
                        }
                    }
                }
            }           
        }

        $.getJSON("https://spreadsheets.google.com/feeds/cells/"+settings.spreadsheet+"/od6/public/basic?alt=json-in-script&callback=?", null, function(results){
            gs_matrix = createGsMatrix(results);
            drawTable(gs_matrix);
            drawResponsiveTable(gs_matrix);
            if(settings.callback){
                settings.callback();
            }
        }); 
    };
 
}( jQuery ));
