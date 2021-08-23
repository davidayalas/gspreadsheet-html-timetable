/**
 * Functionlity to manage drawing of Google Spreadsheets into HTML tables
 */

let drawTables = (function(){

  let settings = {};

  //Transforms google spreadsheet json to array
  let createGsMatrix = function(results){

      if(!results.feed){
        return;
      }

      let gs_matrix = [], gs_col, gs_row;

      let orders = {
        setted : {},
        get : function(l){
          if(!this.setted[l]){
            let ncols = 26;
            let col = 0;
            for(let i=l.length;i>0;i--){
              col += ((l.charCodeAt(i-1)-65)+1)*(Math.pow(ncols,(l.length-i)));
            }
            this.setted[l] = col-1;
          }
          return this.setted[l];
        },
      }

      //creates gs_matrix
      let gs_max_cols = 0;
      for(let i=0,z=results.feed.entry.length;i<z;i++){
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
          for(let k=0;k<=gs_max_cols;k++){
              if(!r[k]){r[k]=""}
          }
      });
      return gs_matrix;
  }

  // Basic dom get one element
  let getElement = function(selector){
    let element = document.querySelector(selector);
    if(!element){
      console.info("Element doesn't exist ", selector);
      return document.createElement("p");
    }
    return element;

  }

  // Basic dom get list of elements
  let getElements = function(selector){
    let elements = document.querySelectorAll(selector);
    if(elements.length===0){
      console.info("Element doesn't exist ", selector);
      return [document.createElement("p")];
    }
    return elements;
  }

  let getScript = function(src, callback){
    var callbackFN;
    if(src.indexOf("callback=?")>-1){
        callbackFN = "mycustomcallback_"+(+new Date());
        src = src.replace("callback=?","callback=" + callbackFN);
        window[callbackFN] = function(data){
            callback(data);
        }
    }
    var s = document.createElement( "script" );
    s.onload = function(data){
      callback(data);
    }
    s.src = src;
    document.head.appendChild(s);
  }    

  //draw desktop table
  let drawTable = function(gs_matrix){
    if(!settings.desktop_container){
        return;
    }

    let id = "gs_table_" + (+new Date());
      
    let container = getElement(settings.desktop_container)
    container.insertAdjacentHTML('beforeend', "<table id='"+id+"' class='gs_desktop_table "+settings.desktop_css+"'><thead></thead><tbody></tbody></table>");

    id = "#" + id;

    let nList;
    for(let i=0;i<gs_matrix.length;i++){
      if(gs_matrix[i]){
        getElement(id + (i===0?" thead":" tbody")).insertAdjacentHTML('beforeend',"<tr></tr>");
        for(let k=0,y=gs_matrix[i].length;k<y;k++){
          nList = getElements(id+ (i===0?" thead":" tbody") + " tr");
          nList[nList.length-1].insertAdjacentHTML('beforeend', "<"+(i===0 || k===0?"th":"td") + (k===0 && i>1?" scope='row'":" ") + "" + (i===0?" scope='col'":" ") + " data-label='"+gs_matrix[0][k]+"'>"+gs_matrix[i][k]+"</"+(i===0 || k===0?"th":"td")+">")
        }
      }
    }           
  }

  //draw responsive table
  let drawResponsiveTable = function(gs_matrix){
    if(!settings.responsive_container){
        return;
    }
    let id = "gs_table_" + (+new Date());

    let container = document.querySelector(settings.responsive_container)
    container.insertAdjacentHTML('beforeend', "<table id='"+id+"' class='gs_responsive_table "+settings.responsive_css+"'><thead></thead><tbody></tbody></table>");

    id = "#" + id;
    let colspan = (gs_matrix && gs_matrix[0] && gs_matrix[0][0]?false:true);

    for(let i=0;i<gs_matrix[0].length;i++){
      if(gs_matrix[0][i]){
          document.querySelector(id + " tbody").insertAdjacentHTML('beforeend',"<tr><th "+(colspan?"colspan='2'":"")+" class='gs_responsive_th'>"+gs_matrix[0][i]+"</th></tr>");

          for(let k=1,y=gs_matrix.length;k<y;k++){
            if(gs_matrix[k][i] && (i>0 || !colspan)){
              getElement(id + " tbody").insertAdjacentHTML('beforeend',"<tr>"+(colspan?"<th>"+gs_matrix[k][0]+"</th>":"")+"<td>"+gs_matrix[k][i]+"</td></tr>");
            }
          }
      }
    }           
  }

  //exposed function
  return function(options) {

    //default values
    settings = {
      spreadsheet : "1c_vDuF6yEuLHDKANUk_2drO0HFIgWQRqrWN3GIVGFRg",
      desktop_container : "body",
      responsive_container : "body",
      desktop_css : "",
      responsive_css : ""
    };

    for(let k in options){
      settings[k] = options[k]
    }

    //This two lines were for the older version of spreadsheet api output format.
    //getScript("https://spreadsheets.google.com/feeds/cells/"+settings.spreadsheet+"/od6/public/basic?alt=json-in-script&callback=?", function(results){
    //    gs_matrix = createGsMatrix(results);

    getScript("https://sheets.googleapis.com/v4/spreadsheets/"+settings.spreadsheet+"/values/Sheet1?key="+settings.api_key+"&callback=?", function(results){
        gs_matrix = results.values;
        if(!gs_matrix){
          return;
        }
        drawTable(gs_matrix);
        drawResponsiveTable(gs_matrix);
        if(settings.callback && typeof settings.callback === "function"){
            settings.callback();
        }
    }); 
  };
 
}());
