
import { Alert, Room, RoomType, Tenant, TenantStatus, RentStatus, BedStatus, CheckInRecord, CheckOutRecord, AccessRecord, SecurityEvent, SecurityEventType, DormReturnRecord, TransferRequest, CheckoutRequest } from './types';

// Mock Rooms with Multi-Building/Floor structure
export const MOCK_ROOMS: Room[] = [];
const BUILDINGS = ['A栋', 'B栋'];
const FLOORS = [2, 3, 4, 5];

let roomIdCounter = 1;

BUILDINGS.forEach(building => {
  FLOORS.forEach(floor => {
    // Generate 4 rooms per floor
    for (let i = 1; i <= 4; i++) {
      const roomNumber = `${floor}0${i}`;
      const isQuad = i % 2 !== 0; // Alternating room types
      
      MOCK_ROOMS.push({
        id: `room-${roomIdCounter}`,
        number: roomNumber,
        building: building,
        floor: floor,
        type: isQuad ? RoomType.QUAD : RoomType.HEX,
        gender: building === 'A栋' ? 'MALE' : 'FEMALE', // A is Male dorm, B is Female dorm
        utilityBalance: Math.random() > 0.9 ? -5.00 : parseFloat((Math.random() * 100).toFixed(2)),
        powerStatus: Math.random() > 0.95 ? 'OFF' : 'ON',
        beds: Array.from({ length: isQuad ? 4 : 6 }).map((_, b) => ({
          id: `bed-${roomIdCounter}-${b}`,
          number: b + 1,
          status: Math.random() > 0.4 ? BedStatus.OCCUPIED : BedStatus.EMPTY,
          tenantId: undefined // Will be linked below
        }))
      });
      roomIdCounter++;
    }
  });
});

// Mock Tenants (Linked to occupied beds)
export const MOCK_TENANTS: Tenant[] = [];
const NAMES = ['王强', '李伟', '张敏', '刘洋', '陈静', '赵磊', '孙丽', '周杰', '吴刚', '郑强', '钱多多', '孙悟空', '猪八戒', '沙悟净'];
const COMPANIES = ['富士康', '比亚迪', '特斯拉超级工厂', '华为制造部', '顺丰速运'];

MOCK_ROOMS.forEach(room => {
  room.beds.forEach(bed => {
    if (bed.status === BedStatus.OCCUPIED) {
      // Assign a tenant
      const tenantId = `tenant-${bed.id}`;
      bed.tenantId = tenantId; // Link bed to tenant
      
      const isOverdue = Math.random() > 0.9;
      const isFrozen = Math.random() > 0.95;
      
      MOCK_TENANTS.push({
        id: tenantId,
        name: NAMES[Math.floor(Math.random() * NAMES.length)] + (Math.floor(Math.random()*100)), // Add number to make names unique-ish
        phone: '138' + Math.floor(10000000 + Math.random() * 90000000),
        company: COMPANIES[Math.floor(Math.random() * COMPANIES.length)],
        faceRegistered: true,
        roomId: room.id,
        bedId: bed.id,
        status: TenantStatus.ACTIVE,
        rentStatus: isFrozen ? RentStatus.OVERDUE_FROZEN : (isOverdue ? RentStatus.OVERDUE_WARNING : RentStatus.PAID),
        rentDueDate: '2023-10-25',
        lastAccess: new Date(Date.now() - Math.floor(Math.random() * 80 * 3600 * 1000)).toISOString()
      });
    }
  });
});

// Mock Alerts
export const MOCK_ALERTS: Alert[] = [
  {
    id: 'a1',
    type: 'SECURITY',
    severity: 'HIGH',
    message: 'A栋-302室检测到陌生人连续3天在深夜(22:00-06:00)出入。',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'a2',
    type: 'SAFETY',
    severity: 'MEDIUM',
    message: '租户 王强 (A栋-304室) 已连续72小时无门禁通行记录。',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'a3',
    type: 'SYSTEM',
    severity: 'LOW',
    message: 'B栋-201室智能电表离线。',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  }
];

// Mock Report Data
export const MOCK_CHECKIN_RECORDS: CheckInRecord[] = Array.from({ length: 20 }).map((_, i) => ({
    id: `cin-${i}`,
    tenantName: NAMES[i % NAMES.length] + i,
    phone: '138' + Math.floor(10000000 + Math.random() * 90000000),
    company: COMPANIES[i % COMPANIES.length],
    roomNumber: `A栋-${200 + (i % 20)}`,
    bedNumber: `${(i % 4) + 1}号床`,
    checkInDate: new Date(Date.now() - i * 86400000).toISOString(),
    operator: '系统自动分配'
}));

export const MOCK_CHECKOUT_RECORDS: CheckOutRecord[] = Array.from({ length: 15 }).map((_, i) => ({
    id: `cout-${i}`,
    tenantName: NAMES[(i + 5) % NAMES.length] + i,
    phone: '139' + Math.floor(10000000 + Math.random() * 90000000),
    company: COMPANIES[(i + 1) % COMPANIES.length],
    roomNumber: `B栋-${300 + (i % 10)}`,
    checkOutDate: new Date(Date.now() - (i * 2) * 86400000).toISOString(),
    reason: i % 3 === 0 ? '离职' : '调宿',
    operator: '管理员'
}));

export const MOCK_ACCESS_RECORDS: AccessRecord[] = Array.from({ length: 50 }).map((_, i) => ({
    id: `acc-${i}`,
    personName: Math.random() > 0.2 ? (NAMES[i % NAMES.length] + i) : '未知访客',
    personType: Math.random() > 0.2 ? '租户' : '访客',
    location: Math.random() > 0.5 ? 'A栋大门' : 'B栋大门',
    direction: Math.random() > 0.5 ? '进' : '出',
    timestamp: new Date(Date.now() - i * 300000).toISOString(),
    method: Math.random() > 0.8 ? '密码' : '人脸',
    result: Math.random() > 0.95 ? '拒绝' : '放行'
}));

export const MOCK_DORM_RETURN_RECORDS: DormReturnRecord[] = Array.from({ length: 30 }).map((_, i) => {
    const statusRand = Math.random();
    let status: 'NORMAL' | 'LATE' | 'NOT_RETURNED' = 'NORMAL';
    let returnTime: string | null = '21:30';

    if (statusRand > 0.8) {
        status = 'LATE';
        returnTime = '23:45';
    } else if (statusRand > 0.95) {
        status = 'NOT_RETURNED';
        returnTime = null;
    } else {
        returnTime = `${17 + Math.floor(Math.random() * 5)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
    }

    return {
        id: `dr-${i}`,
        tenantName: NAMES[i % NAMES.length] + i,
        roomNumber: `A栋-${200 + (i % 20)}`,
        date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
        returnTime: returnTime,
        curfewTime: '23:00',
        status: status
    };
});

// Mock Security Events
export const MOCK_SECURITY_EVENTS: SecurityEvent[] = [
    {
        id: 'sec-1',
        type: SecurityEventType.STRANGER,
        roomId: 'A栋-302室',
        timestamp: new Date().toISOString(),
        status: 'PENDING',
        strangerId: 'STR-2023001',
        appearCount: 3,
        firstSeen: new Date(Date.now() - 3 * 86400000).toISOString(),
        lastSeen: new Date(Date.now() - 3600000).toISOString(),
        photos: ['p1.jpg', 'p2.jpg', 'p3.jpg']
    },
    {
        id: 'sec-2',
        type: SecurityEventType.ABSENCE,
        roomId: 'A栋-304室',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: 'PENDING',
        tenantId: 't-101',
        tenantName: '王强92',
        absenceDuration: '76小时',
        powerUsageStatus: 'NO_USAGE'
    },
    {
        id: 'sec-3',
        type: SecurityEventType.STRANGER,
        roomId: 'B栋-205室',
        timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
        status: 'PROCESSED',
        processNote: '经核实为租户亲友暂住，已补办访客登记',
        strangerId: 'STR-2023005',
        appearCount: 5,
        firstSeen: new Date(Date.now() - 8 * 86400000).toISOString(),
        lastSeen: new Date(Date.now() - 5 * 86400000).toISOString(),
    }
];

// Mock Requests
export const MOCK_TRANSFER_REQUESTS: TransferRequest[] = [
    {
        id: 'req-t-1',
        tenantId: 'tenant-bed-1-0',
        tenantName: '王强22',
        currentRoom: 'A栋-201',
        reason: '室友打呼噜，申请调到安静点的房间',
        requestDate: new Date(Date.now() - 86400000).toISOString(),
        status: 'PENDING'
    },
    {
        id: 'req-t-2',
        tenantId: 'tenant-bed-2-1',
        tenantName: '李伟55',
        currentRoom: 'A栋-202',
        reason: '部门调动，希望能和新同事住一起',
        requestDate: new Date(Date.now() - 2 * 86400000).toISOString(),
        status: 'APPROVED'
    }
];

export const MOCK_CHECKOUT_REQUESTS: CheckoutRequest[] = [
     {
        id: 'req-c-1',
        tenantId: 'tenant-bed-3-0',
        tenantName: '张敏88',
        currentRoom: 'A栋-203',
        reason: '离职回老家',
        requestDate: new Date(Date.now() - 3600000).toISOString(),
        status: 'PENDING'
    }
];
