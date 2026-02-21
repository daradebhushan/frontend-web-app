import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
    selector: 'app-language-toggle',
    standalone: true,
    imports: [CommonModule],
    template: `
    <button (click)="languageService.toggleLanguage()" 
            class="flex items-center space-x-1 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-1.5 shadow-sm hover:shadow-md transition text-sm font-bold text-gray-700">
        <span [class.text-saffron-600]="languageService.currentLang() === 'EN'">ENG</span>
        <span class="text-gray-300">|</span>
        <span [class.text-saffron-600]="languageService.currentLang() === 'MR'">मरा</span>
    </button>
  `
})
export class LanguageToggleComponent {
    constructor(public languageService: LanguageService) { }
}
