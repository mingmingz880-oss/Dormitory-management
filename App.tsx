
import React, { useState } from 'react';
import { Role, BedStatus, OperationLog, RentStatus, Room, Tenant, TenantStatus, WaitlistEntry, MaintenanceTicket, TransferRequest, CheckoutRequest } from './types';
import { MOCK_ROOMS, MOCK_TENANTS, MOCK_TRANSFER_REQUESTS, MOCK_CHECKOUT_REQUESTS } from './constants';
import Layout from './components/Layout';
import AdminDashboard from './components/AdminDashboard';
import { DormManagement, ImportConfig } from './components/DormManagement';
import UtilityControl from './components/UtilityControl';
import ApprovalCenter from './components/ApprovalCenter';
import MobileTenantApp from './components/MobileTenantApp';
import OperationLogs from './components/OperationLogs';
import Waitlist from './components/Waitlist';
import CheckoutModal from './components/CheckoutModal';
import TransferModal from './components/TransferModal';
import ReportQuery from './components/ReportQuery';
import SecurityAlerts from './components/SecurityAlerts';

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<Role>(Role.ADMIN);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Shared State
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [tenants, setTenants] = useState<Tenant[]>(MOCK_TENANTS);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [logs, setLogs] = useState<OperationLog[]>([
      {
          id: 'log-0',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          operator: '管理员',
          action: '系统初始化',
          details: '加载初始房源数据',
          status: 'SUCCESS'
      }
  ]);
  
  // Requests State
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([
    { id: 't1', tenantId: 'tenant-bed-1-0', room: '201', description: '浴室水龙头漏水', status: 'OPEN' },
    { id: 't2', tenantId: 'tenant-bed-1-1', room: '204', description: '空调不制冷', status: 'IN_PROGRESS' },
  ]);
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>(MOCK_TRANSFER_REQUESTS);
  const [checkoutRequests, setCheckoutRequests] = useState<CheckoutRequest[]>(MOCK_CHECKOUT_REQUESTS);

  // Modal States
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [tenantToCheckout, setTenantToCheckout] = useState<Tenant | null>(null);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null); // Track which request triggered the modal

  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [tenantToTransfer, setTenantToTransfer] = useState<Tenant | null>(null);

  // --- Handlers ---

  const handleCheckoutClick = (tenantId: string) => {
      const tenant = tenants.find(t => t.id === tenantId);
      if (tenant) {
          setTenantToCheckout(tenant);
          setActiveRequestId(null); // Manual checkout
          setCheckoutModalOpen(true);
      }
  };

  const handleTransferClick = (tenantId: string) => {
      const tenant = tenants.find(t => t.id === tenantId);
      if (tenant) {
          setTenantToTransfer(tenant);
          setActiveRequestId(null); // Manual transfer
          setTransferModalOpen(true);
      }
  };

  // Approval Handlers
  const handleApproveTransfer = (requestId: string, tenantId: string) => {
      const tenant = tenants.find(t => t.id === tenantId);
      if (tenant) {
          setTenantToTransfer(tenant);
          setActiveRequestId(requestId); // Link to request
          setTransferModalOpen(true);
      }
  };

  const handleApproveCheckout = (requestId: string, tenantId: string) => {
       const tenant = tenants.find(t => t.id === tenantId);
      if (tenant) {
          setTenantToCheckout(tenant);
          setActiveRequestId(requestId); // Link to request
          setCheckoutModalOpen(true);
      }
  };

  const handleProcessCheckout = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;

    // Remove tenant
    setTenants(prev => prev.filter(t => t.id !== tenantId));
    
    // Free up bed
    setRooms(prev => prev.map(room => ({
        ...room,
        beds: room.beds.map(bed => 
            bed.id === tenant.bedId 
            ? { ...bed, status: BedStatus.EMPTY, tenantId: undefined }
            : bed
        )
    })));
    
    // Update Request Status if linked
    if (activeRequestId) {
        setCheckoutRequests(prev => prev.map(r => r.id === activeRequestId ? { ...r, status: 'PROCESSED' } : r));
        setActiveRequestId(null);
    }

    // Add Log
    const newLog: OperationLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        operator: '管理员',
        action: '办理退宿',
        details: `租户 ${tenant.name} (企业:${tenant.company}) 已退宿，权限已撤销，床位 ${tenant.bedId} 已释放。`,
        status: 'SUCCESS'
    };
    setLogs(prev => [newLog, ...prev]);

    // Close Modal
    setCheckoutModalOpen(false);
    setTenantToCheckout(null);
  };

  const handleProcessTransfer = (tenantId: string, newRoomId: string, newBedId: string) => {
      const tenant = tenants.find(t => t.id === tenantId);
      if (!tenant) return;

      const oldRoomId = tenant.roomId;
      const oldBedId = tenant.bedId;

      // Update Tenant Location
      setTenants(prev => prev.map(t => 
          t.id === tenantId 
          ? { ...t, roomId: newRoomId, bedId: newBedId }
          : t
      ));

      // Update Rooms (Free old bed, occupy new bed)
      setRooms(prev => prev.map(room => {
          if (room.id === oldRoomId) {
              return {
                  ...room,
                  beds: room.beds.map(bed => 
                      bed.id === oldBedId ? { ...bed, status: BedStatus.EMPTY, tenantId: undefined } : bed
                  )
              };
          }
          if (room.id === newRoomId) {
              return {
                  ...room,
                  beds: room.beds.map(bed => 
                      bed.id === newBedId ? { ...bed, status: BedStatus.OCCUPIED, tenantId: tenantId } : bed
                  )
              };
          }
          return room;
      }));

       // Update Request Status if linked
      if (activeRequestId) {
          setTransferRequests(prev => prev.map(r => r.id === activeRequestId ? { ...r, status: 'APPROVED' } : r));
          setActiveRequestId(null);
      }

      // Log
      const newLog: OperationLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        operator: '管理员',
        action: '调换宿舍',
        details: `租户 ${tenant.name} 从床位 ${oldBedId} 迁移至 ${newBedId}。`,
        status: 'SUCCESS'
    };
    setLogs(prev => [newLog, ...prev]);

    setTransferModalOpen(false);
    setTenantToTransfer(null);
  };

  const handleBatchImport = (config: ImportConfig) => {
    // --- Step 1: Simulate Excel Import Parsing ---
    // In real scenario, file is parsed here. We mock 50 records.
    const importCount = 50;
    const departments = ['制造一部', '物流部', '质检部'];
    
    // Generate mock candidates
    const importedCandidates = Array.from({ length: importCount }).map((_, i) => {
        const dept = departments[i % departments.length]; 
        // Mock gender distribution
        const gender = dept === '质检部' 
            ? (Math.random() > 0.3 ? 'FEMALE' : 'MALE') 
            : (Math.random() > 0.8 ? 'FEMALE' : 'MALE'); 
            
        return {
            tempId: `import-${i}`,
            name: `员工${i + 1}`,
            phone: `138${Math.floor(10000000 + Math.random() * 90000000)}`,
            idCard: `4403001990${Math.floor(1000 + Math.random() * 9000)}`,
            gender: gender as 'MALE' | 'FEMALE',
            company: '立讯精密',
            department: dept
        };
    });

    // --- Step 2: Apply Allocation Rules based on Config ---
    
    // Rule: Sort by Department (Clustering)
    importedCandidates.sort((a, b) => a.department.localeCompare(b.department));

    // Filter available rooms based on selected buildings from Config
    // Sort naturally (A-201 before A-202)
    const sortedRooms = [...rooms]
        .filter(r => config.selectedBuildings.includes(r.building))
        .sort((a, b) => {
            if (a.building !== b.building) return a.building.localeCompare(b.building);
            return a.number.localeCompare(b.number);
        });

    // Strategy: We iterate through candidates and try to find the "best next bed"
    const successAllocations: Tenant[] = [];
    const queueList: WaitlistEntry[] = [];
    const newlyOccupiedBedIds = new Set<string>();

    // Helper to check if a room is valid for a specific department (Strict Mode)
    const isRoomValidForDept = (room: Room, dept: string): boolean => {
        if (!config.strictDept) return true;
        
        // Check existing tenants in this room
        const tenantsInRoom = tenants.filter(t => t.roomId === room.id);
        if (tenantsInRoom.some(t => !t.company.includes(dept))) return false; // Mixed dept detected

        // Check newly assigned tenants in this batch
        const newTenantsInRoom = successAllocations.filter(t => t.roomId === room.id);
        if (newTenantsInRoom.some(t => !t.company.includes(dept))) return false;

        return true;
    };

    importedCandidates.forEach(candidate => {
        let assignedBed = null;
        let assignedRoomId = null;

        // Find first valid bed
        for (const room of sortedRooms) {
            // 1. Gender Check
            if (room.gender !== candidate.gender) continue;
            
            // 2. Strict Dept Check
            if (!isRoomValidForDept(room, candidate.department)) continue;

            // 3. Find empty bed
            const bed = room.beds.find(b => 
                b.status === BedStatus.EMPTY && 
                !newlyOccupiedBedIds.has(b.id) // Ensure we haven't just filled it in this loop
            );

            if (bed) {
                assignedBed = bed;
                assignedRoomId = room.id;
                break; // Found a spot, stop searching
            }
        }

        if (assignedBed && assignedRoomId) {
            // Success
            newlyOccupiedBedIds.add(assignedBed.id);
            successAllocations.push({
                id: `tenant-${candidate.tempId}`,
                name: candidate.name,
                phone: candidate.phone,
                company: `${candidate.company}-${candidate.department}`,
                faceRegistered: false,
                roomId: assignedRoomId,
                bedId: assignedBed.id,
                status: TenantStatus.PENDING,
                rentStatus: RentStatus.PAID,
                rentDueDate: '2023-11-25',
                lastAccess: new Date().toISOString()
            });
        } else {
            // Waitlist
            queueList.push({
                id: `wait-${candidate.tempId}`,
                name: candidate.name,
                gender: candidate.gender,
                company: `${candidate.company}-${candidate.department}`,
                phone: candidate.phone,
                queueDate: new Date().toISOString()
            });
        }
    });

    // --- Step 3: Update State ---
    
    if (successAllocations.length > 0) {
        setTenants(prev => [...prev, ...successAllocations]);
        setRooms(prev => prev.map(room => ({
            ...room,
            beds: room.beds.map(bed => 
                newlyOccupiedBedIds.has(bed.id)
                ? { ...bed, status: BedStatus.OCCUPIED, tenantId: successAllocations.find(t => t.bedId === bed.id)?.id }
                : bed
            )
        })));
    }

    if (queueList.length > 0) {
        setWaitlist(prev => [...prev, ...queueList]);
    }

    // --- Step 4: Logs & Notification ---
    
    // Generate Summary
    const deptSummary: Record<string, number> = {};
    successAllocations.forEach(t => {
        const dept = t.company.split('-')[1];
        deptSummary[dept] = (deptSummary[dept] || 0) + 1;
    });

    const summaryText = Object.entries(deptSummary)
        .map(([dept, count]) => `${dept}: ${count}人`)
        .join('; ');

    const logDetails = `
        总数: ${importCount}。成功: ${successAllocations.length}。排队: ${queueList.length}。
        规则: [${config.selectedBuildings.join(',')}] ${config.strictDept ? '严禁混住' : '允许混住'}。
        分配: ${summaryText}。
    `.trim();

    const logEntry: OperationLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        operator: '管理员',
        action: '批量入住导入',
        details: logDetails,
        status: queueList.length > 0 ? 'WARNING' : 'SUCCESS'
    };
    setLogs(prev => [logEntry, ...prev]);

    alert(`批量导入完成！\n\n成功安置: ${successAllocations.length} 人\n进入排队: ${queueList.length} 人\n\n分配详情:\n${summaryText}`);
    
    if (queueList.length > 0) {
        setActiveTab('dorms-waitlist');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard waitlistCount={waitlist.length} onNavigate={setActiveTab} />;
      case 'dorms-rooms':
        return <DormManagement 
            rooms={rooms} 
            tenants={tenants} 
            onBatchImport={handleBatchImport} 
            onCheckout={handleCheckoutClick}
            onTransfer={handleTransferClick}
        />;
      case 'dorms-waitlist':
        return <Waitlist waitlist={waitlist} />;
      case 'utilities':
        return <UtilityControl />;
      case 'approvals':
        return <ApprovalCenter 
            tickets={tickets} 
            setTickets={setTickets}
            transferRequests={transferRequests}
            checkoutRequests={checkoutRequests}
            onApproveTransfer={handleApproveTransfer}
            onApproveCheckout={handleApproveCheckout}
        />;
      case 'reports':
        return <ReportQuery />;
      case 'logs':
        return <OperationLogs logs={logs} />;
      case 'security':
        return <SecurityAlerts />;
      default:
        return <AdminDashboard waitlistCount={waitlist.length} onNavigate={setActiveTab} />;
    }
  };

  if (currentRole === Role.TENANT) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50">
          <button 
            onClick={() => setCurrentRole(Role.ADMIN)}
            className="bg-black/80 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-black transition-colors backdrop-blur-sm"
          >
            切换回管理端
          </button>
        </div>
        <MobileTenantApp />
      </>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="relative">
         {/* Role Switcher for Demo */}
         <div className="fixed bottom-4 right-4 z-50">
            <button 
              onClick={() => setCurrentRole(Role.TENANT)}
              className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span>📱</span> 模拟租户端小程序
            </button>
          </div>

        {renderContent()}

        {/* Global Modals */}
        {checkoutModalOpen && tenantToCheckout && (
            <CheckoutModal 
                isOpen={checkoutModalOpen}
                onClose={() => {setCheckoutModalOpen(false); setTenantToCheckout(null); setActiveRequestId(null);}}
                tenant={tenantToCheckout}
                room={rooms.find(r => r.id === tenantToCheckout.roomId)}
                tickets={tickets}
                onConfirm={handleProcessCheckout}
            />
        )}

        {transferModalOpen && tenantToTransfer && (
            <TransferModal
                isOpen={transferModalOpen}
                onClose={() => {setTransferModalOpen(false); setTenantToTransfer(null); setActiveRequestId(null);}}
                tenant={tenantToTransfer}
                rooms={rooms}
                tickets={tickets}
                onConfirm={handleProcessTransfer}
            />
        )}
      </div>
    </Layout>
  );
};

export default App;
