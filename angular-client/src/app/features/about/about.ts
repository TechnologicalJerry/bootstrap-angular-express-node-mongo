import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, Header, Footer],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {

}
