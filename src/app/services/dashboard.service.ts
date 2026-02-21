import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
    totalDepartments?: number;
    totalUsers?: number;
    totalTasks: number;
    toDoTasks: number;
    inProgressTasks: number;
    onHoldTasks: number;
    completedTasks: number;
    criticalTasks?: number;
    directToDoTasks?: number;
    myAssignedTasks?: number;
    tasksFromCo?: number;
    departmentStats?: { id: number; name: string; count: number }[];
    employeeStats?: { id: number; name: string; designation: string; totalTasks: number; completedTasks: number }[];
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = `${environment.apiUrl}/stats`;

    constructor(private http: HttpClient) { }

    getAdminStats(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/dashboard`);
    }

    getDeptHeadStats(deptId: number): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`);
    }

    getEmployeeReport(empId: number): Observable<any> {
        return this.http.get(`${environment.apiUrl}/admin/users/${empId}/report`);
    }

    emailAdminReport(): Observable<any> {
        return this.http.post(`${environment.apiUrl}/admin/report/email`, {});
    }

    getStaffStats(staffId: number): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`);
    }

    getOwnerStats(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/dashboard`); // Assuming same endpoint for now or update if different
    }
}
