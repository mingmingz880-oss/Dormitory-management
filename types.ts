
export enum Role {
  ADMIN = 'ADMIN',
  TENANT = 'TENANT',
  MAINTENANCE = 'MAINTENANCE'
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: Role;
}

export enum RoomType {
  QUAD = '4人间',
  HEX = '6人间'
}

export enum BedStatus {
  EMPTY = 'EMPTY',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED'
}

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  EVICTED = 'EVICTED', // Checked out
  PENDING = 'PENDING' // Pre-checkin
}

export enum RentStatus {
  PAID = 'PAID',
  OVERDUE_WARNING = 'OVERDUE_WARNING', // Stage 1: Social pressure
  OVERDUE_FROZEN = 'OVERDUE_FROZEN'   // Stage 2: Access denied
}

export interface Bed {
  id: string;
  number: number;
  status: BedStatus;
  tenantId?: string;
}

export interface Room {
  id: string;
  number: string;
  building: string;
  floor: number;
  type: RoomType;
  gender: 'MALE' | 'FEMALE';
  beds: Bed[];
  utilityBalance: number; // Prepaid balance
  powerStatus: 'ON' | 'OFF';
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  company: string;
  faceRegistered: boolean;
  roomId?: string;
  bedId?: string;
  status: TenantStatus;
  rentStatus: RentStatus;
  rentDueDate: string;
  lastAccess: string; // ISO Date
}

export interface Alert {
  id: string;
  type: 'SECURITY' | 'SAFETY' | 'SYSTEM';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  timestamp: string;
  meta?: any; // Photos, etc.
}

export interface MaintenanceTicket {
  id: string;
  tenantId: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE';
  scheduledTime?: string;
  accessCode?: string; // Temporary access code
  room?: string; // Add room number for display convenience
  staff?: string; // Assigned staff
}

// Request Types for Approval Center
export interface TransferRequest {
    id: string;
    tenantId: string;
    tenantName: string;
    currentRoom: string;
    reason: string;
    requestDate: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface CheckoutRequest {
    id: string;
    tenantId: string;
    tenantName: string;
    currentRoom: string;
    reason: string; // e.g., 'Resignation', 'Contract End'
    requestDate: string;
    status: 'PENDING' | 'PROCESSED' | 'REJECTED';
}

// 排队序列人员
export interface WaitlistEntry {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  company: string;
  phone: string;
  queueDate: string; // ISO Date
}

// 操作日志
export interface OperationLog {
  id: string;
  timestamp: string;
  operator: string;
  action: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
}

// --- New Report Types ---

export interface CheckInRecord {
  id: string;
  tenantName: string;
  phone: string;
  company: string;
  roomNumber: string;
  bedNumber: string;
  checkInDate: string;
  operator: string;
}

export interface CheckOutRecord {
  id: string;
  tenantName: string;
  phone: string;
  company: string;
  roomNumber: string;
  checkOutDate: string;
  reason: string;
  operator: string;
}

export interface AccessRecord {
  id: string;
  personName: string;
  personType: '租户' | '访客' | '员工';
  location: string;
  direction: '进' | '出';
  timestamp: string;
  method: '人脸' | '密码' | '二维码';
  result: '放行' | '拒绝';
}

export interface DormReturnRecord {
  id: string;
  tenantName: string;
  roomNumber: string;
  date: string; // YYYY-MM-DD
  returnTime: string | null; // HH:mm or null
  curfewTime: string; // HH:mm
  status: 'NORMAL' | 'LATE' | 'NOT_RETURNED';
}

// --- Security Event Types ---

export enum SecurityEventType {
    STRANGER = 'STRANGER', // 疑似转租/非租客留宿
    ABSENCE = 'ABSENCE'    // 长期不动/失联
}

export interface SecurityEvent {
    id: string;
    type: SecurityEventType;
    roomId: string; // e.g., 'A栋-302'
    timestamp: string; // Notification sent time
    status: 'PENDING' | 'PROCESSED';
    processNote?: string;
    
    // Stranger Fields
    strangerId?: string;
    appearCount?: number;
    firstSeen?: string;
    lastSeen?: string;
    photos?: string[];

    // Absence Fields
    tenantId?: string;
    tenantName?: string;
    absenceDuration?: string; // e.g. "75h"
    powerUsageStatus?: 'HAS_USAGE' | 'NO_USAGE';
}
