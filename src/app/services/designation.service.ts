import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Designation {
    id: number;
    name: string;
    active: boolean;
}

import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DesignationService {
    private apiUrl = `${environment.apiUrl}/admin/designations`;

    constructor(private http: HttpClient) { }

    getAllDesignations(): Observable<any> {
        return this.http.get<any>(this.apiUrl);
    }

    createDesignation(name: string): Observable<any> {
        return this.http.post<any>(this.apiUrl, { name });
    }

    deleteDesignation(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }
}
