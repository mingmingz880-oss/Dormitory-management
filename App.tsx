
import React, { useState } from 'react';
import { Role, BedStatus, OperationLog, RentStatus, Room, Tenant, TenantStatus, WaitlistEntry, MaintenanceTicket, TransferRequest, CheckoutRequest } from './types';
import { MOCK_ROOMS, MOCK_TENANTS, MOCK_TRANSFER_REQUESTS, MOCK_CHECKOUT_REQUESTS } from './constants';
import Layout from './components/Layout';
import AdminDashboard from './components/AdminDashboard';
import { DormManagement } from './components/DormManagement';
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
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [tenantToTransfer, setTenantToTransfer] = useState<Tenant | null>(null);

  // --- Handlers ---

  const handleCheckoutClick = (tenantId: string) => {
      const tenant = tenants.find(t => t.id === tenantId);
      if (tenant) {
          setTenantToCheckout(tenant);
          setActiveRequestId(null);
          setCheckoutModalOpen(true);
      }
  };

  const handleTransferClick = (tenantId: string) => {
      const tenant = tenants.find(t => t.id === tenantId);
      if (tenant) {
          setTenantToTransfer(tenant);
          setActiveRequestId(null);
          setTransferModalOpen(true);
      }
  };

  const handleApproveTransfer = (requestId: string, tenantId: string) => {
      const tenant = tenants.find(t => t.id === tenantId);
      if (tenant) {
          setTenantToTransfer(tenant);
          setActiveRequestId(requestId);
          setTransferModalOpen(true);
      }
  };

  const handleApproveCheckout = (requestId: string, tenantId: string) => {
       const tenant = tenants.find(t => t.id === tenantId);
      if (tenant) {
          setTenantToCheckout(tenant);
          setActiveRequestId(requestId);
          setCheckoutModalOpen(true);
      }
  };

  const handleProcessCheckout = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;

    setTenants(prev => prev.filter(t => t.id !== tenantId));
    
    setRooms(prev => prev.map(room => ({
        ...room,
        beds: room.beds.map(bed => 
            bed.id === tenant.bedId 
            ? { ...bed, status: BedStatus.EMPTY, tenantId: undefined }
            : bed
        )
    })));
    
    if (activeRequestId) {
        setCheckoutRequests(prev => prev.map(r => r.id === activeRequestId ? { ...r, status: 'PROCESSED' } : r));
        setActiveRequestId(null);
    }

    const newLog: OperationLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        operator: '管理员',
        action: '办理退宿',
        details: `租户 ${tenant.name} (企业:${tenant.company}) 已退宿，权限已撤销，床位 ${tenant.bedId} 已释放。`,
        status: 'SUCCESS'
    };
    setLogs(prev => [newLog, ...prev]);

    setCheckoutModalOpen(false);
    setTenantToCheckout(null);
  };

  const handleProcessTransfer = (tenantId: string, newRoomId: string, newBedId: string) => {
      const tenant = tenants.find(t => t.id === tenantId);
      if (!tenant) return;

      const oldRoomId = tenant.roomId;
      const oldBedId = tenant.bedId;

      setTenants(prev => prev.map(t => 
          t.id === tenantId 
          ? { ...t, roomId: newRoomId, bedId: newBedId }
          : t
      ));

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

      if (activeRequestId) {
          setTransferRequests(prev => prev.map(r => r.id === activeRequestId ? { ...r, status: 'APPROVED' } : r));
          setActiveRequestId(null);
      }

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

  const handleBatchImport = (result: { newTenants: Tenant[], newWaitlist: WaitlistEntry[] }) => {
    // 1. Update Tenants State
    if (result.newTenants.length > 0) {
        setTenants(prev => [...prev, ...result.newTenants]);
        
        // Update Room Bed Statuses
        const newOccupiedBedIds = new Set(result.newTenants.map(t => t.bedId));
        setRooms(prev => prev.map(room => ({
            ...room,
            beds: room.beds.map(bed => 
                newOccupiedBedIds.has(bed.id)
                ? { ...bed, status: BedStatus.OCCUPIED, tenantId: result.newTenants.find(t => t.bedId === bed.id)?.id }
                : bed
            )
        })));
    }

    // 2. Update Waitlist
    if (result.newWaitlist.length > 0) {
        setWaitlist(prev => [...prev, ...result.newWaitlist]);
    }

    // 3. Log
    const logDetails = `导入 ${result.newTenants.length + result.newWaitlist.length} 人。成功安置 ${result.newTenants.length} 人，进入排队 ${result.newWaitlist.length} 人。`;
    const logEntry: OperationLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        operator: '管理员',
        action: '批量入住导入',
        details: logDetails,
        status: result.newWaitlist.length > 0 ? 'WARNING' : 'SUCCESS'
    };
    setLogs(prev => [logEntry, ...prev]);

    alert(`批量导入完成！\n\n成功安置: ${result.newTenants.length} 人\n进入排队: ${result.newWaitlist.length} 人`);
    
    if (result.newWaitlist.length > 0) {
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
          <button onClick={() => setCurrentRole(Role.ADMIN)} className="bg-black/80 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-black transition-colors backdrop-blur-sm">
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
         <div className="fixed bottom-4 right-4 z-50">
            <button onClick={() => setCurrentRole(Role.TENANT)} className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <span>📱</span> 模拟租户端小程序
            </button>
          </div>

        {renderContent()}

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
