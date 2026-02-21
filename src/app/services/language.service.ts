import { Injectable, signal } from '@angular/core';
import { TRANSLATIONS } from '../shared/translations';

export type Language = 'EN' | 'MR';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    // Use Signals for reactivity
    currentLang = signal<Language>('EN');

    constructor() {
        console.log('LanguageService init. Available Langs:', Object.keys(TRANSLATIONS));
        // @ts-ignore
        console.log('MR Keys sample:', Object.keys(TRANSLATIONS.MR).slice(0, 10));
        // Check local storage
        const saved = localStorage.getItem('app_language') as Language;
        if (saved && (saved === 'EN' || saved === 'MR')) {
            this.currentLang.set(saved);
        }
    }

    setLanguage(lang: Language) {
        this.currentLang.set(lang);
        localStorage.setItem('app_language', lang);
    }

    toggleLanguage() {
        const newLang = this.currentLang() === 'EN' ? 'MR' : 'EN';
        this.setLanguage(newLang);
    }

    translate(key: string): string {
        const lang = this.currentLang();
        // Debug specific keys
        if (key === 'STATUS_CHANGED' || key === 'NOTIF_TASK_ASSIGNED') {
            console.log(`LanguageService: translating ${key} to ${lang}. Found:`, (TRANSLATIONS as any)[lang][key]);
        }
        // @ts-ignore
        return TRANSLATIONS[lang][key] || key;
    }
}
