import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ChatbotService, ChatbotSettings } from '../../services/chatbot.service';
import { DepartmentService, Department } from '../../services/department.service';
import { ComplaintService, ComplaintType } from '../../services/complaint.service';
import { Router } from '@angular/router'; // Import Router
import { CommonModule } from '@angular/common'; // Import CommonModule
import { FormsModule } from '@angular/forms'; // Import FormsModule

interface BotOption {
    labelEn: string;
    labelMr?: string;
    labelHi?: string;
    nextId: string;
    value?: string;
}

interface BotNode {
    id: string;
    type: 'MENU' | 'INPUT' | 'SUBMIT_COMPLAINT';
    textEn: string;
    textMr?: string;
    textHi?: string;
    options?: BotOption[];
    nextId?: string;
    inputType?: string; // text, photo, location
    storageKey?: string;
}

@Component({
    selector: 'app-chatbot-settings',
    standalone: true,
    imports: [CommonModule, FormsModule], // Standalone imports
    templateUrl: './chatbot-settings.component.html',
    styleUrls: ['./chatbot-settings.component.css']
})
export class ChatbotSettingsComponent implements OnInit {
    settings: ChatbotSettings = {};
    isLoading = false;
    successMessage = '';
    errorMessage = '';

    // Flow Editor
    flowNodes: BotNode[] = [];
    activeTab: 'sim' | 'config' | 'flow' = 'sim';
    isConfigurable = false; // "Coming Soon" mode
    selectedNode: BotNode | null = null;
    newNodeId: string = '';

    // Simulator
    chatHistory: { sender: 'bot' | 'user', text: string }[] = [];
    simMessage: string = '';
    simLoading: boolean = false;

    // Metadata for Dropdowns
    departments: Department[] = [];
    complaintTypes: ComplaintType[] = [];

    constructor(
        private chatbotService: ChatbotService,
        private departmentService: DepartmentService,
        private complaintService: ComplaintService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadSettings();
        this.loadMetadata();

        // Safety timeout to prevent stuck loading state
        setTimeout(() => {
            if (this.isLoading) {
                console.warn('Force disabling loading state after timeout');
                this.isLoading = false;
                this.cdr.detectChanges(); // Force update
            }
        }, 5000);
    }

    loadMetadata() {
        this.departmentService.getAllDepartments().subscribe({
            next: (data) => this.departments = data,
            error: (err) => console.error('Failed to load departments', err)
        });

        this.complaintService.getComplaintTypes().subscribe({
            next: (data) => this.complaintTypes = data,
            error: (err) => console.error('Failed to load complaint types', err)
        });
    }

    loadSettings() {
        // this.isLoading = true; // DISABLED: Prevent stuck loading screen. Data will pop in.
        this.chatbotService.getSettings().subscribe({
            next: (data) => {
                console.log('DEBUG: Received Settings:', data); // Log full payload
                this.settings = data;
                if (this.settings.chatbotFlow) {
                    console.log('DEBUG: Raw Flow String:', this.settings.chatbotFlow);
                    try {
                        let parsed = JSON.parse(this.settings.chatbotFlow);
                        // Handle double encoding if it happened during injection
                        if (typeof parsed === 'string') {
                            console.log('DEBUG: Double Encoded detected');
                            parsed = JSON.parse(parsed);
                        }
                        console.log('DEBUG: Parsed Flow Nodes:', parsed);
                        this.flowNodes = Array.isArray(parsed) ? parsed : [];
                    } catch (e) {
                        console.error('Failed to parse flow JSON', e);
                        this.flowNodes = [];
                    }
                } else {
                    console.log('DEBUG: chatbotFlow is empty or null');
                }
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to load settings', err);
                this.errorMessage = 'Failed to load settings. Please try again.';
                this.isLoading = false;
            }
        });
    }

    save() {
        this.isLoading = true;
        this.successMessage = '';
        this.errorMessage = '';

        // Serialize Flow
        this.settings.chatbotFlow = JSON.stringify(this.flowNodes);

        this.chatbotService.saveSettings(this.settings).subscribe({
            next: (msg) => {
                this.successMessage = msg || 'Settings saved successfully!';
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to save settings', err);
                this.errorMessage = 'Failed to save settings. Please try again.';
                this.isLoading = false;
            }
        });
    }

    // Flow Editor Methods

    sampleFlow: BotNode[] = [
        { id: "start", type: "MENU", textEn: "Welcome! Select Language / कृपया आपली भाषा निवडा:", options: [{ labelEn: "English", nextId: "node_dept_en", value: "en" }, { labelEn: "Marathi", nextId: "node_dept_mr", value: "mr" }] },
        { id: "node_dept_en", type: "MENU", textEn: "Select Department:", options: [{ labelEn: "Water Dept", nextId: "node_water", value: "1" }, { labelEn: "Road Dept", nextId: "node_road", value: "2" }, { labelEn: "Health Dept", nextId: "node_health", value: "3" }] },
        { id: "node_water", type: "MENU", textEn: "Select Water Issue:", options: [{ labelEn: "No Supply", nextId: "node_area", value: "no_supply" }, { labelEn: "Leakage", nextId: "node_area", value: "leakage" }, { labelEn: "Contaminated", nextId: "node_area", value: "dirty" }] },
        { id: "node_road", type: "MENU", textEn: "Select Road Issue:", options: [{ labelEn: "Pothole", nextId: "node_area", value: "pothole" }, { labelEn: "Resurfacing", nextId: "node_area", value: "resurface" }] },
        { id: "node_health", type: "MENU", textEn: "Select Health Issue:", options: [{ labelEn: "Garbage", nextId: "node_area", value: "garbage" }, { labelEn: "Dead Animal", nextId: "node_area", value: "dead_animal" }] },
        { id: "node_area", type: "INPUT", inputType: "text", textEn: "Please enter your Area / Colony Name:", storageKey: "area", nextId: "node_landmark" },
        { id: "node_landmark", type: "INPUT", inputType: "text", textEn: "Enter nearby Landmark:", storageKey: "landmark", nextId: "node_photo" },
        { id: "node_photo", type: "INPUT", inputType: "photo", textEn: "Please upload a photo of the issue (or type 'skip'):", storageKey: "photo", nextId: "node_desc" },
        { id: "node_desc", type: "INPUT", inputType: "text", textEn: "Any additional description?", storageKey: "description", nextId: "node_confirm" },
        { id: "node_confirm", type: "MENU", textEn: "Submit Complaint Details?", options: [{ labelEn: "Yes, Submit", nextId: "node_submit", value: "yes" }, { labelEn: "Cancel", nextId: "start", value: "cancel" }] },
        { id: "node_submit", type: "SUBMIT_COMPLAINT", textEn: "Thank you! Your complaint has been submitted.", options: [] }
    ];

    loadSampleFlow() {
        console.log('DEBUG: loadSampleFlow clicked');
        // if (confirm('This will overwrite your current flow with the detailed 10-step sample. Continue?')) {
        console.log('DEBUG: Auto-confirmed for debug.');
        this.flowNodes = JSON.parse(JSON.stringify(this.sampleFlow)); // Deep copy
        this.selectedNode = null;
        this.successMessage = "Sample flow loaded! Don't forget to Save.";
        this.cdr.detectChanges(); // Force UI update
        console.log('DEBUG: Flow updated. Node count:', this.flowNodes.length);
        // } else {
        //    console.log('DEBUG: Cancelled sample load.');
        // }
    }

    addNode() {
        if (!this.newNodeId) return;
        if (this.flowNodes.find(n => n.id === this.newNodeId)) {
            alert('Node with this ID already exists!');
            return;
        }

        const newNode: BotNode = {
            id: this.newNodeId,
            type: 'MENU', // Default
            textEn: 'New Node Message'
        };

        this.flowNodes.push(newNode);
        this.selectedNode = newNode;
        this.newNodeId = '';
    }

    selectNode(node: BotNode) {
        this.selectedNode = node;
    }

    deleteNode(node: BotNode) {
        if (confirm('Are you sure you want to delete this node?')) {
            this.flowNodes = this.flowNodes.filter(n => n.id !== node.id);
            if (this.selectedNode === node) {
                this.selectedNode = null;
            }
        }
    }

    addOption() {
        if (this.selectedNode && this.selectedNode.type === 'MENU') {
            if (!this.selectedNode.options) this.selectedNode.options = [];
            this.selectedNode.options.push({
                labelEn: 'Option',
                nextId: ''
            });
        }
    }

    removeOption(index: number) {
        if (this.selectedNode && this.selectedNode.options) {
            this.selectedNode.options.splice(index, 1);
        }
    }

    // Simulator Methods
    // Simulator Methods
    selectedFile: File | null = null;

    onFileSelected(event: any) {
        if (event.target.files && event.target.files.length > 0) {
            this.selectedFile = event.target.files[0];
        }
    }

    sendSimMessage() {
        if (!this.simMessage.trim() && !this.selectedFile) return;

        const msg = this.simMessage;

        // Optimistic UI Update
        if (this.selectedFile) {
            this.chatHistory.push({ sender: 'user', text: '[PHOTO] ' + this.selectedFile.name + (msg ? ' - ' + msg : '') });
        } else {
            this.chatHistory.push({ sender: 'user', text: msg });
        }

        this.simMessage = '';
        this.simLoading = true;
        const fileToSend = this.selectedFile;
        this.selectedFile = null; // Clear immediately from UI state

        if (fileToSend) {
            this.chatbotService.uploadFile(fileToSend).subscribe({
                next: (uploadRes) => {
                    const mediaUrl = uploadRes.url;
                    this.chatbotService.simulateChat(msg || '', 1, mediaUrl).subscribe({
                        next: (res) => this.handleSimResponse(res),
                        error: (err) => this.handleSimError(err)
                    });
                },
                error: (err) => {
                    console.error('Upload failed', err);
                    this.chatHistory.push({ sender: 'bot', text: 'Error: Photo upload failed.' });
                    this.simLoading = false;
                }
            });
        } else {
            const isUrl = msg.toLowerCase().startsWith('http');
            this.chatbotService.simulateChat(isUrl ? '' : msg, 1, isUrl ? msg : undefined).subscribe({
                next: (res) => this.handleSimResponse(res),
                error: (err) => this.handleSimError(err)
            });
        }
    }


    createdComplaintData: any = null; // Store metadata for task creation

    handleSimResponse(res: any) {
        this.simLoading = false;
        if (res.response) {
            let cleanResponse = res.response;
            // Parse [META] block
            const metaMatch = res.response.match(/\[META\] (\{.*\})/);
            if (metaMatch && metaMatch[1]) {
                try {
                    this.createdComplaintData = JSON.parse(metaMatch[1]);
                    console.log('DEBUG: Parsed Complaint Meta:', this.createdComplaintData);
                    // Remove META from display
                    cleanResponse = cleanResponse.replace(metaMatch[0], '').trim();
                } catch (e) {
                    console.error('Failed to parse META', e);
                }
            }

            this.chatHistory.push({ sender: 'bot', text: cleanResponse });

            // Auto-trigger if regex matches "create a task" from user? 
            // The user asked "task creation from chatbot... should pre populate".
            // If the user *asked* for a task previously, we could auto-navigate.
            // But let's show a Button first as it's safer and "refer android app" usually means UI action.
            // The Android app likely shows a "Convert to Task" button.
            // However, sticking to the requirement: "verify the task is there in task list".
            // If I just show a button, the user needs to click it.
        }
        this.cdr.detectChanges();
    }

    createTaskFromComplaint() {
        if (!this.createdComplaintData) return;
        this.router.navigate(['/tasks/create'], {
            queryParams: {
                fromComplaintId: this.createdComplaintData.complaintId,
                title: this.createdComplaintData.title,
                description: this.createdComplaintData.description
            }
        });
    }

    handleSimError(err: any) {
        this.simLoading = false;
        this.chatHistory.push({ sender: 'bot', text: 'Error: Could not reach bot.' });
        this.cdr.detectChanges();
    }

    clearChat() {
        this.chatHistory = [];
        this.sendSimMessage();
    }
}
