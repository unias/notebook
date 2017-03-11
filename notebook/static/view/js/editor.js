// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

define([
    'base/js/utils',
    'view/js/handsontable.full',
    ],
function(
    utils,handson
) {
    "use strict";

    var Editor = function(selector, options) {
        var that = this;
        this.selector = selector;
        this.clean = false;
        this.contents = options.contents;
        this.events = options.events;
        this.base_url = options.base_url;
        this.file_path = options.file_path;
        this.config = options.config;
        this.generation = -1;
        this.save_enabled = false;
        var obj=document.getElementById("data_table");
		//var wid=document.getElementById("notebook_list_header").clientHeight;
		//alert("wid="+wid);
        this.table=new Handsontable(obj,{
            startRows:100,
            startColumns:10,
            //rowHeaders:true,
            rowHeaders:function(index){
                return index + parseInt($("#line_beg").val());
            },
            colHeaders:true,
            width:1000,
            height:500
            //afterScrollVertically:function(){alert(this.table.rowOffset());}
        });
    };

    Editor.prototype.load = function(starts=-1, ends=-1) {
        /** load the file */
        if(starts === -1){
            starts = 0;
            ends = 1000;
        }   
        
        var that = this;
        return this.contents.get(this.file_path, {type: 'partfile', format: 'text', starts : starts, ends : ends})
            .then(function(model) {
                //alert("1");
                //alert(model.content.split('\n'));
                //alert(model.content.split(','));
                var wid=document.getElementById("notebook_list_header").clientWidth,hei=document.body.clientHeight;
				        that.table.updateSettings({width:wid,height:hei-150});
				        var lines=model.content.split('\n');
                var len=lines.length;
                var tabledata=new Array();
                for (var x=0;x<len;x++) if(lines[x]!="") {tabledata[x]=lines[x].split(',');}
                that.table.loadData(tabledata);
                that.tabledata=tabledata;
                that.save_enabled = true;
                that.loadlines=1000;
                //that.loadlines=starts;
                Handsontable.hooks.add('afterScrollVertically',function(){
                    var x=that.table.rowOffset();
                    console.log(x);
                    if(x>that.loadlines-100){
                        that.loadlines+=100;
                        that.contents.get(that.file_path, {type: 'partfile', format: 'text', starts:that.loadlines-100, ends: that.loadlines}).then(function(model){
                            var lines_=model.content.split('\n');
                            var len_=lines_.length;
                            var tabledata_=new Array();
                            for (var x=0;x<len_;x++) if(lines_[x]!="") {tabledata_[x]=lines_[x].split(',');}
                            tabledata_=that.tabledata.concat(tabledata_);
                            that.table.loadData(tabledata_);
                            that.tabledata=tabledata_;
                            that.save_enabled = true;
                            //alert(that.loadlines);
                        });
                    }
                },that.table);
                that.events.trigger("file_loaded.Editor", model);
				$(window).resize(function(){
					var wid_=document.getElementById("notebook_list_header").clientWidth;
					var hei_=document.body.clientHeight;
					that.table.updateSettings({width:wid_,height:hei_-150});
				});
            }).catch(
            function(error) {
                that.events.trigger("file_load_failed.Editor", error);
                console.warn('Error loading: ', error);
                that.save_enabled = false;
            }
        );
    };

    Editor.prototype.get_filename = function () {
        return utils.url_path_split(this.file_path)[1];
    };

    return {Editor: Editor};
});
