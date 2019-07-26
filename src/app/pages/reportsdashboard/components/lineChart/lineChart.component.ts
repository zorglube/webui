import {Component, Input, OnInit, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, ViewChild, ElementRef} from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { CoreService, CoreEvent } from 'app/core/services/core.service';
import { ViewComponent } from 'app/core/components/view/view.component';
import { Report, ReportData } from '../report/report.component';
import { ThemeService, Theme } from 'app/services/theme/theme.service';

import {UUID} from 'angular2-uuid';
import * as moment from 'moment';
import Dygraph from 'dygraphs';
import smoothPlotter from 'dygraphs/src/extras/smooth-plotter.js';
import Chart from 'chart.js';
import 'chartjs-plugin-crosshair';
import * as simplify from 'simplify-js';

/*export interface ChartFormatter {
 format (value, ratio, id);
}*/

// Deprecate this
export interface Analytics {
  label:string;
  min?:number;
  max?:number;
  avg?:number;
  last?:number;
  total?:number;
}

// Deprecate this
interface TimeData {
  start: number;
  end: number;
  step: number;
  legend?: string;
}

// For Chart.js
interface DataSet {
  label: string;
  data: number[];
  backgroundColor: string[];
  borderColor: string[];
  borderWidth: number;
}

@Component({
  selector: 'linechart', 
  /*template: `<div id="{{controlUid}}" #wrapper style="height:180px; max-height:180px;">
   <canvas *ngIf="library == 'chart.js'"></canvas>
   <div class="legend" *ngIf="library == 'dygraph'"></div>
     </div>`,*/
     templateUrl:'./lineChart.component.html',
     styleUrls:['./lineChart.component.css']
})
export class LineChartComponent extends ViewComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('wrapper', {static: true}) el: ElementRef;
  @Input() data: ReportData;
  @Input() report: Report;
  @Input() title: string;

  @Input() legends?: string[]; 
  @Input() type: string = 'line';
  @Input() convertToCelsius?: true;
  @Input() dataStructure: 'columns'; // rows vs columns
  @Input() minY?: number = 0;
  @Input() maxY?: number = 100;
  @Input() labelY?: string = 'Label Y';
  @Input() interactive: boolean = false;

  public library: string = 'dygraph'; // dygraph or chart.js
    public ctx: any; // canvas context for chart.js

  public chart:any;
  public conf:any;
  public columns:any;
  public linechartData:any;

  public units: string = '';
  public showLegendValues: boolean = false;
  public legendEvents: BehaviorSubject<any>;
  public legendLabels: BehaviorSubject<any>;
  public legendAnalytics: BehaviorSubject<any>;

  public colorPattern = ["#2196f3", "#009688", "#ffc107", "#9c27b0", "#607d8b", "#00bcd4", "#8bc34a", "#ffeb3b", "#e91e63", "#3f51b5"];
  public theme: Theme;
  public timeFormat: string = "%H:%M";
  public culling:number = 6;
  public controlUid: string;

  constructor(private core:CoreService, public themeService:ThemeService) {
    super();
    this.controlUid = "chart_" + UUID.UUID();
    this.legendEvents = new BehaviorSubject(false);
    this.legendLabels = new BehaviorSubject([]);
    this.legendAnalytics = new BehaviorSubject([]);
  } 

  applyHandledData(columns, linechartData, legendLabels){
    this.columns = columns;
    this.linechartData = linechartData;
    this.legendLabels.next(legendLabels);

  }

  public render(){

    if(this.library == 'dygraph'){
      // Use dygraph for line graphs with large data sets
      this.renderGraph();
    } else if(this.library == 'chart.js'){
      // Use chart.js for everything else
      this.renderChart();
    } 
  }

  public renderGraph(){
    let data = this.makeTimeAxis(this.data);
    let labels = data.shift();

    let fg2RGB = this.themeService.hexToRGB(this.themeService.currentTheme().fg2);
    let gridLineColor = 'rgba(' + fg2RGB[0] + ', ' + fg2RGB[1]+ ', ' + fg2RGB[2]+ ', 0.5)'

      let options = {
        /*drawHighlightPointCallback: (g, seriesName, canvasContext, cx, cy, color, pointSize) => {
         },*/
         //plotter: smoothPlotter,
         drawPoints:false,// Must be disabled for smoothPlotter
         pointSize:1,
         highlightCircleSize:4,
         strokeWidth:1,
         colors: this.colorPattern,
         labels: labels,// time axis
         ylabel: this.labelY,
         gridLineColor: gridLineColor,
         showLabelsOnHighlight: false,
         labelsSeparateLines: true,
         legendFormatter: (data) => {
           //console.log(data);
           this.legendEvents.next(data);
           return "";
         },
         series: () => {
           let s = {};
           this.data.legend.forEach((item, index) => {
             s[item] = {plotter: smoothPlotter};
           });

           return s;
         },
         //labelsDiv: '#dygraph-legend',//this.el.nativeElement.querySelector('.legend')
         }
      this.chart = new Dygraph(this.el.nativeElement, data, options);
  }

  public renderChart(){
    if(!this.ctx){
      const el = this.el.nativeElement.querySelector('canvas');
      if(!el){ return; }

      const ds = this.makeDatasets(this.data);
      this.ctx = el.getContext('2d');

      let data = {
        labels: this.makeTimeAxis(this.data),//this.data.legend,
        //labels: this.makeTimeAxis(this.data, ds[0].data),//this.data.legend,
        datasets: ds ,
      }

      let options = {
        plugins: {
          crosshair: {
            line: {
              width: 1,
              color: '#666'
            },
            sync: {
              enabled: true
            },
            zoom : {
              enabled: true
            },
            callbacks: {
              afterZoom: (start, end) => {
                //console.log("START: " + start + ", END: " + end);
                console.log(this.title);
              }
            }
          }
        },
        tooltips:{
          enabled: true,
          callbacks: { 
            label: (evt, data) =>{
              //console.log(evt);
              }
          }
        },
        //showLines: false,
        responsive:true,
        maintainAspectRatio: false,
        legend: {
          display: false
        },
        responsiveAnimationDuration: 0,
        animation: {
          duration: 0
        },
        hover: {
          animationDuration: 0 
        },
        elements: {
          line: {
            tension: 0
          }
        },
        scales: {
          xAxes: [{
            type: 'time',
            display: true,
            scaleLabel: {
              display: false,
              labelString: 'Date'
            },
            /*time: {
             min: this.data.start,
             max: this.data.end
            },
            ticks: {
              source: 'auto'
            }*/
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }

      this.chart = new Chart(this.ctx, {
        type: this.type,
        data:data,
        options
      });

    } else {

      const ds = this.makeDatasets(this.data);
      let data = {
        labels: this.makeTimeAxis(this.data, ds[0].data),//this.data.legend,
        datasets: ds ,
      }
      this.chart.data = data;

      this.chart.update();

    }
  }

  makeColumn(data:ReportData, legendKey): number[]{
    let result = [];
    //let legend = Object.assign([],data.legend);

    //data.legend.forEach((item, index) => {
    for(let i = 0; i < data.data.length; i++){
      const value = data.data[i][legendKey];
      result.push(value);
    }
    //});

    return result;
  }

  protected makeDatasets(data:ReportData): DataSet[]{

    let datasets = [];
    let legend = Object.assign([],data.legend);

    // Create the data...
    legend.forEach((item, index) => {

      let ds:DataSet = {
        label: item,
        data:this.makeColumn(data, index),
        backgroundColor: [], 
        borderColor: [this.colorPattern[index]],
        borderWidth: 1
      }

      /*for(let i = 0; i < data.data.length; i++){
       const value = data.data[i][index];
       ds.data.push(value);
      }*/

      //ds.data = this.decimate(ds.data);

      datasets.push(ds);
    });

    return datasets
  }

  /*decimate(data){
   let points = data.map((item, index) => {
     return {x: index, y: item};
   });

   let result =  simplify(points, 0.05 , true).map((v) => v.y);
   return result;
  }*/

  protected makeTimeAxis(rd:ReportData, data?: number[]):any[]{
    if(!data){ data = rd.data; }

      const structure = this.library == 'chart.js' ? 'columns' : 'rows'
        if(structure == 'rows'){
          // Push dates to row based data...
          let rows = [];
          // Add legend with axis to beginning of array
          let legend = Object.assign([],rd.legend);
          legend.unshift('x');
          rows.push(legend);

          for(let i = 0; i < rd.data.length; i++){ 
            let item = Object.assign([], rd.data[i]);
            let date = new Date(rd.start * 1000 + i * rd.step * 1000);
            item.unshift(date);
            rows.push(item);
          }

          return rows;
        } else if(structure == 'columns'){

          let columns = [];

          for(let i = 0; i < rd.data.length; i++){ 
            let date = new Date(rd.start * 1000 + i * rd.step * 1000);
            columns.push(date);
          }

          return columns;
        }

  }

  private processThemeColors(theme):string[]{
    this.theme = theme;
    let colors: string[] = [];
    theme.accentColors.map((color) => {
      colors.push(theme[color]);
    }); 
    return colors;
  }

  private createColorObject(){
    let obj = {};
    this.legends.forEach((item, index)=>{
      obj[item] = this.colorPattern[index]
    })
    return obj;
  }

  public fetchData(rrdOptions, timeformat?: string, culling?:number){
    if(timeformat){
      this.timeFormat = timeformat;
    }
    if(culling){
      this.culling = culling;
    }

    // Convert from milliseconds to seconds for epoch time
    rrdOptions.start = Math.floor(rrdOptions.start / 1000);
    if(rrdOptions.end){
      rrdOptions.end = Math.floor(rrdOptions.end / 1000);
    }

  }

  // LifeCycle Hooks
  ngOnInit() {
    /*this.core.register({ observerClass:this, eventName:"LineChartData:" + this.title }).subscribe((evt:CoreEvent)=>{ 
     this.data = evt.data.dataObj;
     this.applyHandledData(evt.data.columns, evt.data.linechartData, evt.data.legendLabels);
     this.legendAnalytics.next(evt.data.legendAnalytics)
    });*/

    this.core.register({ observerClass:this, eventName:"ThemeData" }).subscribe((evt:CoreEvent)=>{ 
      this.colorPattern = this.processThemeColors(evt.data);

      if(this.data || this.linechartData){ 
        this.render();
      }
    });

    this.core.register({ observerClass:this, eventName:"ThemeChanged" }).subscribe((evt:CoreEvent)=>{ 
      this.colorPattern = this.processThemeColors(evt.data);
      if(this.data || this.linechartData){ 
        this.render();
      }
    });

    this.core.emit({name:"ThemeDataRequest"});
  }

  ngAfterViewInit() {
    this.render();
  }

  ngOnChanges(changes:SimpleChanges){
    if(changes.data){
      console.log(this.data);
      //if(changes.data.currentValue.name == 'cpu'){console.log(changes.data.currentValue);}
      if(this.chart){
        this.render();
      } else {
        this.render();// make an update method?
      }
    }
  }

  ngOnDestroy(){
    this.core.unregister({observerClass:this});
  }

}
