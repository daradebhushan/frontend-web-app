import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Department {
    id: number;
    name: string;
    name_mr?: string;
    adminId: number;
    active: boolean;
    chatbotEnabled?: boolean;
    subQuestions?: string; // JSON string from backend
    createdAt: string;
}

import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DepartmentService {
    private apiUrl = `${environment.apiUrl}/admin/departments`;

    constructor(private http: HttpClient) { }

    getAllDepartments(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}?size=1000`);
    }

    createDepartment(department: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, department);
    }

    deleteDepartment(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }

    updateDepartment(id: number, department: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, department);
    }

    seedDefaultDepartments(): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/seed-defaults`, {});
    }
}
