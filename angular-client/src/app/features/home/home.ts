import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Footer } from "../../shared/components/footer/footer";
import { Header } from "../../shared/components/header/header";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, Header, Footer],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}
