import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import { HeaderComponent } from "./pageParts/header/header.component";
import { FooterComponent } from "./pageParts/footer/footer.component";

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [RouterOutlet, MatCardModule, HeaderComponent, FooterComponent]
})
export class AppComponent {
  title = 'app-template';
}
