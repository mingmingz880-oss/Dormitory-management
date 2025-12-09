
import React, { useState, useMemo } from 'react';
import { BedStatus, Room, Tenant, TenantStatus, WaitlistEntry, RentStatus } from '../types';
import { Search, Plus, Building2, ChevronDown, ChevronRight, MapPin, Layers, X, Download, Upload, FileSpreadsheet, UserCheck, UserX, Briefcase, ArrowLeftRight, Settings, CheckCircle, AlertTriangle, List, UserMinus, AlertCircle } from 'lucide-react';

// Configuration interface for the import process
export interface ImportConfig {
    selectedBuildings: string[];
    strictDept: boolean; // If true, do not mix different departments in the same room
}

export interface AllocationResult {
    success: Tenant[];
    waitlist: WaitlistEntry[];
    errors: { name: string; phone: string; reason: string }[];
}

interface DormManagementProps {
    rooms: Room[];
    tenants: Tenant[];
    onBatchImport: (result: { newTenants: Tenant[], newWaitlist: WaitlistEntry[] }) => void;
    onCheckout: (tenantId: string) => void;
    onTransfer: (tenantId: string) => void;
}

export const DormManagement: React.FC<DormManagementProps> = ({ rooms, tenants, onBatchImport, onCheckout, onTransfer }) => {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  
  // Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1); // Reduced to 3 steps
  const [importFile, setImportFile] = useState<File | null>(null);

  // Import Configuration State (Step 2)
  const [config, setConfig] = useState<ImportConfig>({
      selectedBuildings: [],
      strictDept: false
  });

  // Allocation Preview State (Step 3)
  const [allocationResult, setAllocationResult] = useState<AllocationResult | null>(null);
  const [resultTab, setResultTab] = useState<'SUCCESS' | 'WAITLIST' | 'ERROR'>('SUCCESS');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [expandedBuildings, setExpandedBuildings] = useState<string[]>(['A栋', 'B栋']);

  // New Filters
  const [filterGender, setFilterGender] = useState<'ALL' | 'MALE' | 'FEMALE'>('ALL');
  const [filterRentStatus, setFilterRentStatus] = useState<'ALL' | 'OVERDUE'>('ALL');

  const rentStatusMap: Record<string, string> = {
      'PAID': '正常缴费',
      'OVERDUE_WARNING': '逾期警告',
      'OVERDUE_FROZEN': '逾期冻结'
  };

  // Build Tree Structure from Rooms Data
  const buildingStructure = useMemo(() => {
    const structure: Record<string, Set<number>> = {};
    rooms.forEach(room => {
        if (!structure[room.building]) {
            structure[room.building] = new Set();
        }
        structure[room.building].add(room.floor);
    });
    // Convert Sets to sorted Arrays
    const result: Record<string, number[]> = {};
    Object.keys(structure).sort().forEach(b => {
        result[b] = Array.from(structure[b]).sort((a, b) => a - b);
    });
    return result;
  }, [rooms]);

  // Filter Logic
  const filteredRooms = useMemo(() => {
      return rooms.filter(room => {
          // 1. Tree Filter
          if (selectedBuilding && room.building !== selectedBuilding) return false;
          if (selectedFloor && room.floor !== selectedFloor) return false;

          // 2. Gender Filter
          if (filterGender !== 'ALL' && room.gender !== filterGender) return false;

          // 3. Search Filter
          const tenantsInRoom = room.beds
              .map(bed => tenants.find(t => t.id === bed.tenantId))
              .filter(Boolean);

          if (searchQuery) {
              const q = searchQuery.toLowerCase();
              const matchRoom = room.number.includes(q);
              const matchTenant = tenantsInRoom.some(t => 
                  t?.name.includes(q) || t?.phone.includes(q)
              );
              if (!matchRoom && !matchTenant) return false;
          }

          // 4. Rent Status Filter
          if (filterRentStatus === 'OVERDUE') {
              const hasOverdueTenant = tenantsInRoom.some(t => 
                  t?.rentStatus === 'OVERDUE_WARNING' || t?.rentStatus === 'OVERDUE_FROZEN'
              );
              if (!hasOverdueTenant) return false;
          }

          return true;
      });
  }, [rooms, tenants, selectedBuilding, selectedFloor, searchQuery, filterGender, filterRentStatus]);

  // Analysis for Step 2 (Mocking the file parsing result)
  const importAnalysis = useMemo(() => {
      if (!importFile) return null;
      return {
          total: 50,
          males: 32,
          females: 18,
          departments: ['制造一部', '物流部', '质检部']
      };
  }, [importFile]);

  // Capacity Preview for Step 2
  const capacityPreview = useMemo(() => {
      if (!importAnalysis) return null;
      let availableMaleBeds = 0;
      let availableFemaleBeds = 0;
      
      const targetRooms = rooms.filter(r => 
          config.selectedBuildings.length === 0 || config.selectedBuildings.includes(r.building)
      );

      targetRooms.forEach(room => {
          const emptyBeds = room.beds.filter(b => b.status === BedStatus.EMPTY).length;
          if (room.gender === 'MALE') availableMaleBeds += emptyBeds;
          else availableFemaleBeds += emptyBeds;
      });

      const maleDeficit = Math.max(0, importAnalysis.males - availableMaleBeds);
      const femaleDeficit = Math.max(0, importAnalysis.females - availableFemaleBeds);
      
      return {
          availableMaleBeds,
          availableFemaleBeds,
          maleDeficit,
          femaleDeficit,
          totalDeficit: maleDeficit + femaleDeficit
      };
  }, [rooms, config, importAnalysis]);

  // --- Handlers ---

  const toggleBuilding = (building: string) => {
      if (expandedBuildings.includes(building)) {
          setExpandedBuildings(prev => prev.filter(b => b !== building));
      } else {
          setExpandedBuildings(prev => [...prev, building]);
      }
  };

  const handleSelectBuilding = (building: string) => {
      setSelectedBuilding(building === selectedBuilding ? null : building);
      setSelectedFloor(null);
  };

  const handleSelectFloor = (floor: number, building: string) => {
      setSelectedBuilding(building);
      setSelectedFloor(floor === selectedFloor ? null : floor);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setImportFile(e.target.files[0]);
          setImportStep(2); 
          setConfig(prev => ({ ...prev, selectedBuildings: Object.keys(buildingStructure) }));
      }
  };

  const handleDownloadTemplate = () => {
      // Simplified headers as requested
      const headers = ['姓名', '手机号', '性别'];
      const dummyRow = ['张三', '13800000001', '男'];
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, dummyRow].map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "员工入住信息模板.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleExportData = () => {
     // ... (existing implementation)
      const headers = ['楼栋', '房间号', '类型', '性别限制', '床位号', '床位状态', '租户姓名', '手机号', '所属公司', '缴费状态'];
      const rows: string[][] = [];
      rooms.forEach(room => {
          room.beds.forEach(bed => {
              const tenant = tenants.find(t => t.id === bed.tenantId);
              rows.push([
                  room.building,
                  room.number,
                  room.type,
                  room.gender === 'MALE' ? '男寝' : '女寝',
                  bed.number.toString(),
                  bed.status === 'OCCUPIED' ? '占用' : (bed.status === 'RESERVED' ? '预留' : '空闲'),
                  tenant ? tenant.name : '-',
                  tenant ? tenant.phone : '-',
                  tenant ? tenant.company : '-',
                  tenant ? rentStatusMap[tenant.rentStatus] : '-'
              ]);
          });
      });
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "宿舍房源全量明细.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleExportPreview = () => {
      if (!allocationResult) return;
      
      const headers = [
          '租户姓名', '手机号', '部门', '性别', '楼栋', '房间号', '类型', '性别限制', '床位号', '分配状态', '原因描述'
      ];
      
      const rows: string[][] = [];
      
      // 1. Success
      allocationResult.success.forEach(t => {
          const room = rooms.find(r => r.id === t.roomId);
          rows.push([
              t.name,
              t.phone,
              t.company.split('-')[1] || t.company,
              room?.gender === 'MALE' ? '男' : '女',
              room?.building || '-',
              room?.number || '-',
              room?.type || '-',
              room?.gender === 'MALE' ? '男寝' : '女寝',
              t.bedId?.split('-')[2] || '-',
              '成功',
              '-'
          ]);
      });

      // 2. Waitlist
      allocationResult.waitlist.forEach(w => {
          rows.push([
              w.name,
              w.phone,
              w.company.split('-')[1] || w.company,
              w.gender === 'MALE' ? '男' : '女',
              '-', '-', '-', '-', '-',
              '排队',
              '床位不足'
          ]);
      });

      // 3. Errors
      allocationResult.errors.forEach(e => {
          rows.push([
              e.name,
              e.phone,
              '-', '-', '-', '-', '-', '-', '-',
              '失败',
              e.reason
          ]);
      });

      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `批量入住预分配详情_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // --- Core Allocation Logic (Frontend Simulation) ---
  const simulateAllocation = () => {
      const importCount = 50;
      const departments = ['制造一部', '物流部', '质检部'];
      
      // 1. Generate Candidates
      const candidates = Array.from({ length: importCount }).map((_, i) => {
          const dept = departments[i % departments.length]; 
          const gender = dept === '质检部' 
              ? (Math.random() > 0.3 ? 'FEMALE' : 'MALE') 
              : (Math.random() > 0.8 ? 'FEMALE' : 'MALE'); 
              
          // Simulate some bad data (Error Cases)
          const isError = Math.random() > 0.95; 

          return {
              tempId: `import-${i}`,
              name: `员工${i + 1}`,
              phone: `138${Math.floor(10000000 + Math.random() * 90000000)}`,
              gender: gender as 'MALE' | 'FEMALE',
              company: '立讯精密',
              department: dept,
              isError
          };
      });

      // 2. Separate Errors
      const validCandidates = candidates.filter(c => !c.isError);
      const errors = candidates.filter(c => c.isError).map(c => ({
          name: c.name,
          phone: c.phone,
          reason: Math.random() > 0.5 ? '姓名与通讯录不匹配' : '手机号格式错误'
      }));

      // 3. Sort for Clustering
      validCandidates.sort((a, b) => a.department.localeCompare(b.department));

      // 4. Get Rooms
      const targetRooms = [...rooms]
          .filter(r => config.selectedBuildings.includes(r.building))
          .sort((a, b) => {
              if (a.building !== b.building) return a.building.localeCompare(b.building);
              return a.number.localeCompare(b.number);
          });

      // 5. Allocation Loop
      const successList: Tenant[] = [];
      const waitlistList: WaitlistEntry[] = [];
      const occupiedInThisBatch = new Set<string>();

      // Strict Mode Helper
      const isRoomValidForDept = (room: Room, dept: string): boolean => {
          if (!config.strictDept) return true;
          // Check existing tenants
          const tenantsInRoom = tenants.filter(t => t.roomId === room.id);
          if (tenantsInRoom.some(t => !t.company.includes(dept))) return false;
          // Check new tenants from this batch
          const newTenantsInRoom = successList.filter(t => t.roomId === room.id);
          if (newTenantsInRoom.some(t => !t.company.includes(dept))) return false;
          return true;
      };

      validCandidates.forEach(candidate => {
          let assignedBed = null;
          let assignedRoomId = null;

          for (const room of targetRooms) {
              if (room.gender !== candidate.gender) continue;
              if (!isRoomValidForDept(room, candidate.department)) continue;

              const bed = room.beds.find(b => 
                  b.status === BedStatus.EMPTY && !occupiedInThisBatch.has(b.id)
              );

              if (bed) {
                  assignedBed = bed;
                  assignedRoomId = room.id;
                  break;
              }
          }

          if (assignedBed && assignedRoomId) {
              occupiedInThisBatch.add(assignedBed.id);
              successList.push({
                  id: `new-tenant-${candidate.tempId}`,
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
              waitlistList.push({
                  id: `wait-${candidate.tempId}`,
                  name: candidate.name,
                  gender: candidate.gender,
                  company: `${candidate.company}-${candidate.department}`,
                  phone: candidate.phone,
                  queueDate: new Date().toISOString()
              });
          }
      });

      setAllocationResult({
          success: successList,
          waitlist: waitlistList,
          errors: errors
      });
      setImportStep(3);
  };

  const handleFinalSubmit = () => {
      if (!allocationResult) return;
      onBatchImport({
          newTenants: allocationResult.success,
          newWaitlist: allocationResult.waitlist
      });
      setShowImportModal(false);
      setImportStep(1);
      setImportFile(null);
      setAllocationResult(null);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Left Sidebar and Main Content remains same... skipping for brevity... */}
      {/* Re-rendering core layout structure slightly abbreviated to focus on Modal logic */}
      
      <div className="w-64 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col shrink-0">
         {/* ... (Existing Sidebar Code) ... */}
         <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Building2 size={18} /> 空间结构</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
            <button onClick={() => { setSelectedBuilding(null); setSelectedFloor(null); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 flex items-center gap-2 ${!selectedBuilding ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
                <MapPin size={16} /> 全部园区
            </button>
            {Object.keys(buildingStructure).map(building => (
                <div key={building} className="mb-1">
                    <button onClick={() => toggleBuilding(building)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-2"><Building2 size={16} /> {building}</div>
                        {expandedBuildings.includes(building) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    {expandedBuildings.includes(building) && (
                        <div className="ml-4 pl-2 border-l border-slate-200 mt-1 space-y-1">
                            <button onClick={() => handleSelectBuilding(building)} className={`w-full text-left px-3 py-1.5 rounded text-sm ${selectedBuilding === building && !selectedFloor ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-500 hover:text-slate-800'}`}>全部楼层</button>
                            {buildingStructure[building].map(floor => (
                                <button key={floor} onClick={() => handleSelectFloor(floor, building)} className={`w-full text-left px-3 py-1.5 rounded text-sm flex items-center gap-2 ${selectedBuilding === building && selectedFloor === floor ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-500 hover:text-slate-800'}`}>
                                    <Layers size={14} /> {floor}楼
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          {/* Top Actions */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
             <div className="flex items-center gap-4 flex-1">
                 <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="搜索姓名、手机号、房间..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                 </div>
                 <div className="flex gap-2">
                     <select value={filterGender} onChange={(e) => setFilterGender(e.target.value as any)} className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5">
                         <option value="ALL">全部性别</option>
                         <option value="MALE">男寝</option>
                         <option value="FEMALE">女寝</option>
                     </select>
                     <select value={filterRentStatus} onChange={(e) => setFilterRentStatus(e.target.value as any)} className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5">
                         <option value="ALL">全部缴费状态</option>
                         <option value="OVERDUE">仅看欠费</option>
                     </select>
                 </div>
             </div>
             <div className="flex gap-3">
                 <button onClick={handleExportData} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                    <Download size={18} /> 导出房源明细
                 </button>
                 <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all hover:translate-y-[-1px]">
                    <Plus size={18} /> 批量入住
                 </button>
             </div>
          </div>

          {/* Room Grid */}
          <div className="flex-1 overflow-y-auto">
             <div className="mb-4 flex items-center gap-2 text-slate-500 text-sm">
                <span className="font-bold text-slate-900">全部房源</span>
                <span>共 {filteredRooms.length} 间</span>
             </div>
             {filteredRooms.length === 0 ? (
                 <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl"><Search size={48} className="mb-4 opacity-20" /><p>未找到匹配的房间</p></div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                    {filteredRooms.map(room => (
                        <div key={room.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div className="flex items-center gap-2"><span className="font-bold text-lg text-slate-800">{room.number}室</span><span className="text-xs text-slate-400">{room.building} {room.floor}F</span></div>
                                <div className="flex items-center gap-2"><span className="text-xs text-slate-500">{room.beds.length}人间</span><span className={`text-xs px-1.5 py-0.5 rounded font-medium ${room.gender === 'MALE' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>{room.gender === 'MALE' ? '男寝' : '女寝'}</span></div>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-3">
                                {room.beds.map(bed => {
                                    const tenant = tenants.find(t => t.id === bed.tenantId);
                                    const isOverdue = tenant && (tenant.rentStatus === 'OVERDUE_WARNING' || tenant.rentStatus === 'OVERDUE_FROZEN');
                                    return (
                                        <div key={bed.id} onClick={() => tenant && setSelectedTenant(tenant)} className={`relative p-2.5 rounded-lg border text-left transition-all cursor-pointer ${bed.status === BedStatus.EMPTY ? 'border-dashed border-slate-200 bg-slate-50 hover:border-blue-300' : (isOverdue ? 'border-red-300 bg-red-50 hover:bg-red-100 shadow-sm ring-1 ring-red-200' : 'border-blue-100 bg-blue-50/30 hover:bg-blue-50 hover:border-blue-300')}`}>
                                            <div className="flex justify-between items-start mb-1"><span className={`text-xs ${bed.status === BedStatus.EMPTY ? 'text-slate-400' : 'text-blue-500 font-medium'}`}>{bed.number}号</span><div className={`w-2 h-2 rounded-full ${bed.status === BedStatus.EMPTY ? 'bg-slate-200' : (isOverdue ? 'bg-red-500 animate-pulse' : 'bg-green-500')}`}></div></div>
                                            <div className="truncate text-sm font-bold text-slate-800">{tenant ? tenant.name : <span className="text-slate-400 font-normal">空闲</span>}</div>
                                            {tenant && <div className="truncate text-[10px] text-slate-500 mt-0.5">{tenant.name.match(/\d+/) ? tenant.name : tenant.company.split('-')[0]}</div>}
                                            {isOverdue && <div className="absolute -top-1 -right-1 text-red-500 bg-white rounded-full"><AlertTriangle size={14} fill="currentColor" className="text-red-500" /></div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
             )}
          </div>
      </div>

      {/* Tenant Detail Drawer */}
      {selectedTenant && (
        <>
            <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40" onClick={() => setSelectedTenant(null)}></div>
            <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 border-l border-slate-100 animate-in slide-in-from-right duration-300">
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-lg text-slate-800">床位详情</h3>
                        <button onClick={() => setSelectedTenant(null)} className="text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Profile Header */}
                        <div className="text-center">
                            <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl shadow-inner border border-slate-200">
                                👤
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">{selectedTenant.name}</h2>
                            <p className="text-slate-500">{selectedTenant.company}</p>
                            
                            <div className="flex justify-center gap-2 mt-4">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">在住</span>
                                {selectedTenant.rentStatus !== 'PAID' ? (
                                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                        {rentStatusMap[selectedTenant.rentStatus]}
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                                        正常缴费
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Info List */}
                        <div className="space-y-4">
                             <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><MapPin size={16}/> 位置信息</span>
                                    <span className="font-medium text-slate-900">
                                        {rooms.find(r => r.id === selectedTenant.roomId)?.building} - {rooms.find(r => r.id === selectedTenant.roomId)?.number}室 <span className="text-slate-400">({selectedTenant.bedId?.split('-')[2]}号床)</span>
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><Briefcase size={16}/> 所属部门</span>
                                    <span className="font-medium text-slate-900">未录入</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><UserCheck size={16}/> 联系电话</span>
                                    <span className="font-medium text-slate-900">{selectedTenant.phone}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><CheckCircle size={16}/> 门禁权限</span>
                                    <span className="font-medium text-green-600">已下发 (刷脸/密码)</span>
                                </div>
                                 <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><Layers size={16}/> 最后通行</span>
                                    <span className="font-medium text-slate-900">{new Date(selectedTenant.lastAccess).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-3">快捷操作</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => onTransfer(selectedTenant.id)}
                                    className="p-3 border border-slate-200 rounded-xl flex flex-col items-center gap-2 hover:bg-slate-50 hover:border-blue-300 transition-all group"
                                >
                                    <ArrowLeftRight className="text-blue-500 group-hover:scale-110 transition-transform" size={24} />
                                    <span className="text-xs font-medium text-slate-700">调换宿舍</span>
                                </button>
                                <button className="p-3 border border-slate-200 rounded-xl flex flex-col items-center gap-2 hover:bg-slate-50 hover:border-orange-300 transition-all group">
                                    <Settings className="text-orange-500 group-hover:rotate-45 transition-transform" size={24} />
                                    <span className="text-xs font-medium text-slate-700">重置密码</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-slate-50">
                        <button 
                            onClick={() => {
                                onCheckout(selectedTenant.id);
                                setSelectedTenant(null); // Close drawer after triggering modal
                            }}
                            className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <UserX size={20} />
                            办理退宿 (一键清退)
                        </button>
                    </div>
                </div>
            </div>
        </>
      )}

      {/* Batch Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <FileSpreadsheet className="text-blue-600" /> 批量办理入住
                    </h3>
                    <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto flex-1">
                    {/* Step Indicator */}
                    <div className="flex items-center justify-center mb-8">
                        <div className={`flex items-center gap-2 ${importStep >= 1 ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 ${importStep >= 1 ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>1</div>
                            上传名单
                        </div>
                        <div className={`w-16 h-0.5 mx-2 ${importStep >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                        <div className={`flex items-center gap-2 ${importStep >= 2 ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 ${importStep >= 2 ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>2</div>
                             配置
                        </div>
                         <div className={`w-16 h-0.5 mx-2 ${importStep >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                        <div className={`flex items-center gap-2 ${importStep >= 3 ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 ${importStep >= 3 ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>3</div>
                             预览确认
                        </div>
                    </div>

                    {/* Step 1 Content: Upload & Template */}
                    {importStep === 1 && (
                        <div className="text-center space-y-6 py-4">
                             <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 hover:bg-slate-50 transition-colors cursor-pointer relative group">
                                <input type="file" accept=".xlsx,.xls,.csv" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileSelect} />
                                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <Upload size={32} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-700 group-hover:text-blue-600">点击上传 或 拖拽文件至此</h4>
                                <p className="text-slate-400 text-sm mt-2">支持 .xlsx, .xls, .csv 格式</p>
                            </div>
                            
                            <div className="pt-4">
                                <button onClick={handleDownloadTemplate} className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center justify-center gap-1 mx-auto">
                                    <Download size={14} /> 下载员工信息模版 (仅包含基本字段)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2 Content: Config & Capacity */}
                    {importStep === 2 && importAnalysis && capacityPreview && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                                <FileSpreadsheet className="text-blue-600 mt-1 shrink-0" size={20} />
                                <div>
                                    <h4 className="font-bold text-slate-800">文件解析成功: {importFile?.name}</h4>
                                    <p className="text-sm text-slate-600 mt-1">识别到 <strong className="text-blue-700">{importAnalysis.total}</strong> 名员工 (男: {importAnalysis.males}, 女: {importAnalysis.females})。<br/>涉及部门: {importAnalysis.departments.join(', ')}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-800 text-sm">分配规则设置</h4>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-500">开放楼栋范围</label>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.keys(buildingStructure).map(b => (
                                                <label key={b} className={`px-3 py-1.5 rounded text-sm border cursor-pointer transition-all flex items-center gap-2 ${config.selectedBuildings.includes(b) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                                                    <input type="checkbox" className="hidden" checked={config.selectedBuildings.includes(b)} onChange={(e) => {
                                                        if (e.target.checked) setConfig(p => ({ ...p, selectedBuildings: [...p.selectedBuildings, b] }));
                                                        else setConfig(p => ({ ...p, selectedBuildings: p.selectedBuildings.filter(x => x !== b) }));
                                                    }} />
                                                    {b}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-500">部门混住限制</label>
                                        <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                                            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${config.strictDept ? 'bg-blue-600' : 'bg-slate-300'}`}>
                                                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${config.strictDept ? 'translate-x-4' : ''}`}></div>
                                            </div>
                                            <input type="checkbox" className="hidden" checked={config.strictDept} onChange={(e) => setConfig(p => ({ ...p, strictDept: e.target.checked }))} />
                                            <span className="text-sm text-slate-700">严禁不同部门混住</span>
                                        </label>
                                        <p className="text-[10px] text-slate-400">开启后，同一房间将只允许安排同一部门的员工。</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-800 text-sm">容量预演</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm"><span className="text-slate-600">男生需求</span><span className="font-bold">{importAnalysis.males} 人</span></div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${capacityPreview.maleDeficit > 0 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, (capacityPreview.availableMaleBeds / Math.max(1, importAnalysis.males)) * 100)}%` }}></div></div>
                                        <div className="text-xs text-right">{capacityPreview.maleDeficit > 0 ? <span className="text-red-600 font-bold">缺口 {capacityPreview.maleDeficit} 床</span> : <span className="text-green-600">充足</span>}</div>
                                        <div className="mt-4 flex justify-between items-center text-sm"><span className="text-slate-600">女生需求</span><span className="font-bold">{importAnalysis.females} 人</span></div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${capacityPreview.femaleDeficit > 0 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, (capacityPreview.availableFemaleBeds / Math.max(1, importAnalysis.females)) * 100)}%` }}></div></div>
                                        <div className="text-xs text-right">{capacityPreview.femaleDeficit > 0 ? <span className="text-red-600 font-bold">缺口 {capacityPreview.femaleDeficit} 床</span> : <span className="text-green-600">充足</span>}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Preview Result */}
                    {importStep === 3 && allocationResult && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-green-600">{allocationResult.success.length}</div>
                                    <div className="text-xs text-green-800 font-medium">成功分配</div>
                                </div>
                                <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{allocationResult.waitlist.length}</div>
                                    <div className="text-xs text-yellow-800 font-medium">进入排队</div>
                                </div>
                                <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-red-600">{allocationResult.errors.length}</div>
                                    <div className="text-xs text-red-800 font-medium">数据异常</div>
                                </div>
                            </div>

                            {/* Result Tabs */}
                            <div className="flex border-b border-slate-200">
                                <button onClick={() => setResultTab('SUCCESS')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${resultTab === 'SUCCESS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                                    成功名单 ({allocationResult.success.length})
                                </button>
                                <button onClick={() => setResultTab('WAITLIST')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${resultTab === 'WAITLIST' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                                    排队名单 ({allocationResult.waitlist.length})
                                </button>
                                <button onClick={() => setResultTab('ERROR')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${resultTab === 'ERROR' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                                    异常数据 ({allocationResult.errors.length})
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="h-64 overflow-y-auto border border-t-0 border-slate-200 rounded-b-xl bg-slate-50 p-2">
                                {resultTab === 'SUCCESS' && (
                                    <table className="w-full text-left text-xs">
                                        <thead className="text-slate-500 border-b border-slate-200"><tr><th className="p-2">姓名</th><th className="p-2">部门</th><th className="p-2">分配房间</th></tr></thead>
                                        <tbody>
                                            {allocationResult.success.map((t, i) => {
                                                const room = rooms.find(r => r.id === t.roomId);
                                                return (
                                                    <tr key={i} className="border-b border-slate-100 last:border-0"><td className="p-2 font-medium">{t.name}</td><td className="p-2 text-slate-500">{t.company.split('-')[1]}</td><td className="p-2 text-blue-600">{room?.building} {room?.number} - {t.bedId?.split('-')[2]}号床</td></tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                                {resultTab === 'WAITLIST' && (
                                    <table className="w-full text-left text-xs">
                                        <thead className="text-slate-500 border-b border-slate-200"><tr><th className="p-2">姓名</th><th className="p-2">部门</th><th className="p-2">原因</th></tr></thead>
                                        <tbody>
                                            {allocationResult.waitlist.map((w, i) => (
                                                <tr key={i} className="border-b border-slate-100 last:border-0"><td className="p-2 font-medium">{w.name}</td><td className="p-2 text-slate-500">{w.company.split('-')[1]}</td><td className="p-2 text-yellow-600">床位不足</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                                {resultTab === 'ERROR' && (
                                    <table className="w-full text-left text-xs">
                                        <thead className="text-slate-500 border-b border-slate-200"><tr><th className="p-2">姓名</th><th className="p-2">手机号</th><th className="p-2">失败原因</th></tr></thead>
                                        <tbody>
                                            {allocationResult.errors.map((e, i) => (
                                                <tr key={i} className="border-b border-slate-100 last:border-0"><td className="p-2 font-medium">{e.name}</td><td className="p-2 text-slate-500">{e.phone}</td><td className="p-2 text-red-600 flex items-center gap-1"><AlertCircle size={12}/> {e.reason}</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 shrink-0">
                    <button onClick={() => setShowImportModal(false)} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50">取消</button>
                    {importStep === 2 && (
                        <button onClick={simulateAllocation} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-200 hover:bg-blue-700 flex items-center gap-2">生成分配方案 <ChevronRight size={18} /></button>
                    )}
                    {importStep === 3 && (
                        <>
                            <button onClick={handleExportPreview} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 flex items-center gap-2">
                                <Download size={18} /> 导出分配明细
                            </button>
                            <button onClick={handleFinalSubmit} className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg shadow-lg shadow-green-200 hover:bg-green-700 flex items-center gap-2"><CheckCircle size={18} /> 确认执行导入</button>
                        </>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
