import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Member } from '../../../services/member.service';

@Component({
  selector: 'app-member-select-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    FormsModule
  ],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg w-full max-w-2xl max-h-96 overflow-hidden flex flex-col">
        <div class="bg-[#4f46e4] px-6 py-3 text-white">  
          <h3 class="text-lg font-semibold">Select Member</h3>
        </div>

        <div class="p-6">
        
        <!-- Search -->
        <div class="mb-4">
          <input type="text" placeholder="Search members..." [(ngModel)]="memberSearchTerm"
            (input)="filterMembers()" class="w-full p-2 border rounded">
        </div>

        <!-- Table -->
        <div class="overflow-y-auto flex-grow">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="p-2 text-left text-xs font-medium text-gray-500">MemNo</th>
                <th class="p-2 text-left text-xs font-medium text-gray-500">Name</th>
                <th class="p-2 text-left text-xs font-medium text-gray-500">Share</th>
                <th class="p-2 text-xs font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr *ngFor="let m of filteredMembers" class="hover:bg-gray-50">
                <td class="p-2 text-sm">{{ m.memNo || m.memberNo }}</td>
                <td class="p-2 text-sm">{{ m.name }}</td>
                <td class="p-2 text-sm">{{ m.bankingDetails?.share }}</td>
                <td class="p-2 text-center">
                  <button (click)="selectMember(m)" class="px-3 py-1 bg-[#4f46e4] text-white rounded text-xs">
                    Select
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div class="mt-4 flex justify-end">
          <button (click)="onCancel()" class="px-4 py-2 bg-gray-300 rounded mr-2">Cancel</button>
        </div>
      </div>
      </div>
    </div>
  `
})
export class MemberSelectDialogComponent implements OnInit {
  filteredMembers: Member[] = [];
  memberSearchTerm: string = '';

  constructor(
    public dialogRef: MatDialogRef<MemberSelectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { members: Member[] }
  ) {}

  ngOnInit(): void {
    // Load all members by default
    this.filteredMembers = [...this.data.members];
  }

  filterMembers(): void {
    const searchValue = this.memberSearchTerm.toLowerCase();
    this.filteredMembers = this.data.members.filter(member =>
      (member.name || '').toLowerCase().includes(searchValue) ||
      (member.memNo || member.memberNo || '').toString().toLowerCase().includes(searchValue) ||
      (member.mobile || '').includes(searchValue)
    );
  }

  selectMember(member: Member): void {
    this.dialogRef.close(member);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
