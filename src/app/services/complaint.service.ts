import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Department {
    id: number;
    name: string;
}

export interface ComplaintType {
    id: number;
    name: string; // nameEn
}

export interface Complaint {
    id: number;
    complaintNo: string;
    citizenName: string;
    citizenMobile: string;
    department?: Department;
    departmentId?: number;
    departmentName?: string;
    complaintType?: ComplaintType;
    complaintTypeName?: string;
    description: string;
    photoUrl: string;
    location: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CONVERTED_TO_TASK';
    rejectionReason?: string;
    createdDate: string;
    relatedTaskId?: number;
    relatedTaskTitle?: string;
    comments?: ComplaintComment[];
    attachments?: ComplaintAttachment[];
}

export interface ComplaintComment {
    id: number;
    text: string;
    userName: string;
    timestamp: string;
}

export interface ComplaintAttachment {
    id: number;
    fileName: string;
    filePath: string;
    fileType: string;
}

@Injectable({
    providedIn: 'root'
})
export class ComplaintService {
    private apiUrl = `${environment.apiUrl}/admin/complaints`;

    constructor(private http: HttpClient) { }

    getAllComplaints(): Observable<Complaint[]> {
        return this.http.get<Complaint[]>(this.apiUrl);
    }

    getComplaintById(id: number): Observable<Complaint> {
        return this.http.get<Complaint>(`${this.apiUrl}/${id}`);
    }

    updateStatus(id: number, status: string, reason?: string): Observable<Complaint> {
        return this.http.put<Complaint>(`${this.apiUrl}/${id}/status`, { status, reason });
    }

    createTaskFromComplaint(id: number, taskData: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/${id}/create-task`, taskData);
    }

    getComplaintTypes(): Observable<ComplaintType[]> {
        return this.http.get<ComplaintType[]>(`${environment.apiUrl}/admin/complaint-types`);
    }
    addComment(id: number, text: string): Observable<Complaint> {
        return this.http.post<Complaint>(`${this.apiUrl}/${id}/comments`, { text });
    }

    addAttachment(id: number, file: File): Observable<Complaint> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<Complaint>(`${this.apiUrl}/${id}/attachments`, formData);
    }

    downloadAttachment(attachmentId: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/attachments/${attachmentId}/download`, { responseType: 'blob' });
    }
}

