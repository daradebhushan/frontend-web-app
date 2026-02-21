import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  protected readonly title = signal('frontend');

  constructor(private translate: TranslateService) {
    this.translate.addLangs(['en', 'hi', 'mr']);
    this.translate.setDefaultLang('en');

    // Optional: Use browser lang
    const browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang?.match(/en|hi|mr/) ? browserLang : 'en');
    // Layout and Theme Initialization
    this.initializeTheme();
  }

  private initializeTheme() {
    // Default to Dark Mode for Premium feel
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (storedTheme === 'dark' || (!storedTheme && prefersDark) || !storedTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
