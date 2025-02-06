import { Component } from '@angular/core';
import { MultiChartComponent } from "./multi-chart/multi-chart.component";
import { SideBarComponent } from "./side-bar/side-bar.component";
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, SideBarComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    providers: []
})
export class AppComponent{
  title = 'financial-plotter';
}
