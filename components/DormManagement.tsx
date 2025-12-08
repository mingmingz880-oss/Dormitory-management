
import React, { useState, useMemo } from 'react';
import { BedStatus, Room, Tenant } from '../types';
import { Search, Filter, Plus, Building2, ChevronDown, ChevronRight, MapPin, Layers, X, Download, Upload, FileSpreadsheet, UserCheck, UserX, Briefcase, Settings, CheckCircle, AlertTriangle, ArrowLeftRight } from 'lucide-react';

// Configuration interface for the import process
export interface ImportConfig {
    selectedBuildings: string[];
    strictDept: boolean; // If true, do not mix different departments in the same room
}

interface DormManagementProps {
    rooms: Room[];
    tenants: Tenant[];
    onBatchImport: (config: ImportConfig) => void;
    onCheckout: (tenantId: string) => void;
    onTransfer: (tenantId: string) => void;
}

export const DormManagement: React.FC<DormManagementProps> = ({ rooms, tenants, onBatchImport, onCheckout, onTransfer }) => {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  
  // Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);
  const [importFile, setImportFile] = useState<File | null>(null);

  // Import Configuration State (Step 3)
  const [config, setConfig] = useState<ImportConfig>({
      selectedBuildings: [],
      strictDept: false
  });

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

          // 3. Search Filter (Room Number OR Tenant Name OR Tenant Phone)
          const tenantsInRoom = room.beds
              .map(bed => tenants.find(t => t.id === bed.tenantId))
              .filter(Boolean);

          if (searchQuery) {
              const q = searchQuery.toLowerCase();
              // Match Room Number
              const matchRoom = room.number.includes(q);
              // Match Tenants in Room
              const matchTenant = tenantsInRoom.some(t => 
                  t?.name.includes(q) || t?.phone.includes(q)
              );
              
              if (!matchRoom && !matchTenant) return false;
          }

          // 4. Rent Status Filter (Overdue)
          if (filterRentStatus === 'OVERDUE') {
              // Only show rooms that have at least one overdue tenant
              const hasOverdueTenant = tenantsInRoom.some(t => 
                  t?.rentStatus === 'OVERDUE_WARNING' || t?.rentStatus === 'OVERDUE_FROZEN'
              );
              if (!hasOverdueTenant) return false;
          }

          return true;
      });
  }, [rooms, tenants, selectedBuilding, selectedFloor, searchQuery, filterGender, filterRentStatus]);

  // Analysis for Step 3 (Mocking the file parsing result)
  const importAnalysis = useMemo(() => {
      if (!importFile) return null;
      // Mock data based on "file content"
      return {
          total: 50,
          males: 32,
          females: 18,
          departments: ['制造一部', '物流部', '质检部']
      };
  }, [importFile]);

  // Capacity Preview for Step 3
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


  const toggleBuilding = (building: string) => {
      if (expandedBuildings.includes(building)) {
          setExpandedBuildings(prev => prev.filter(b => b !== building));
      } else {
          setExpandedBuildings(prev => [...prev, building]);
      }
  };

  const handleSelectBuilding = (building: string) => {
      setSelectedBuilding(building === selectedBuilding ? null : building);
      setSelectedFloor(null); // Reset floor when switching building
  };

  const handleSelectFloor = (floor: number, building: string) => {
      setSelectedBuilding(building);
      setSelectedFloor(floor === selectedFloor ? null : floor);
  };

  // Import Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setImportFile(e.target.files[0]);
          setImportStep(3); // Auto move to step 3
          // Pre-select all buildings by default
          setConfig(prev => ({ ...prev, selectedBuildings: Object.keys(buildingStructure) }));
      }
  };

  const handleDownloadTemplate = () => {
      const headers = ['姓名', '手机号', '身份证号', '性别', '公司', '部门'];
      const dummyRow = ['张三', '13800000001', '440300199001011234', '男', '立讯精密', '制造一部'];
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
    // Generate Flattened Data for ALL rooms
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

  const handleStartImport = () => {
      if (config.selectedBuildings.length === 0) {
          alert('请至少选择一个楼栋');
          return;
      }
      onBatchImport(config);
      // Reset Modal
      setShowImportModal(false);
      setImportStep(1);
      setImportFile(null);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Left Sidebar: Structure Tree */}
      <div className="w-64 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Building2 size={18} /> 空间结构
            </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
            <button 
                onClick={() => { setSelectedBuilding(null); setSelectedFloor(null); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 flex items-center gap-2 ${!selectedBuilding ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                <MapPin size={16} /> 全部园区
            </button>
            
            {Object.keys(buildingStructure).map(building => (
                <div key={building} className="mb-1">
                    <button 
                        onClick={() => toggleBuilding(building)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Building2 size={16} /> {building}
                        </div>
                        {expandedBuildings.includes(building) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    
                    {expandedBuildings.includes(building) && (
                        <div className="ml-4 pl-2 border-l border-slate-200 mt-1 space-y-1">
                            <button
                                onClick={() => handleSelectBuilding(building)}
                                className={`w-full text-left px-3 py-1.5 rounded text-sm ${selectedBuilding === building && !selectedFloor ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                全部楼层
                            </button>
                            {buildingStructure[building].map(floor => (
                                <button
                                    key={floor}
                                    onClick={() => handleSelectFloor(floor, building)}
                                    className={`w-full text-left px-3 py-1.5 rounded text-sm flex items-center gap-2 ${selectedBuilding === building && selectedFloor === floor ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    <Layers size={14} /> {floor}楼
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          {/* Top Actions */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
             <div className="flex items-center gap-4 flex-1">
                 <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="搜索姓名、手机号、房间..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 
                 {/* Filters */}
                 <div className="flex gap-2">
                     <select 
                        value={filterGender}
                        onChange={(e) => setFilterGender(e.target.value as any)}
                        className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                     >
                         <option value="ALL">全部性别</option>
                         <option value="MALE">男寝</option>
                         <option value="FEMALE">女寝</option>
                     </select>

                     <select 
                        value={filterRentStatus}
                        onChange={(e) => setFilterRentStatus(e.target.value as any)}
                        className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                     >
                         <option value="ALL">全部缴费状态</option>
                         <option value="OVERDUE">仅看欠费</option>
                     </select>
                 </div>
             </div>

             <div className="flex gap-3">
                 <button 
                    onClick={handleExportData}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                 >
                    <Download size={18} />
                    导出房源明细
                 </button>
                 <button 
                    onClick={() => setShowImportModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all hover:translate-y-[-1px]"
                 >
                    <Plus size={18} />
                    批量入住
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
                 <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                     <Search size={48} className="mb-4 opacity-20" />
                     <p>未找到匹配的房间</p>
                 </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                    {filteredRooms.map(room => (
                        <div key={room.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-lg text-slate-800">{room.number}室</span>
                                    <span className="text-xs text-slate-400">{room.building} {room.floor}F</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">{room.beds.length}人间</span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${room.gender === 'MALE' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                        {room.gender === 'MALE' ? '男寝' : '女寝'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-3">
                                {room.beds.map(bed => {
                                    const tenant = tenants.find(t => t.id === bed.tenantId);
                                    const isOverdue = tenant && (tenant.rentStatus === 'OVERDUE_WARNING' || tenant.rentStatus === 'OVERDUE_FROZEN');
                                    
                                    return (
                                        <div 
                                            key={bed.id}
                                            onClick={() => tenant && setSelectedTenant(tenant)}
                                            className={`
                                                relative p-2.5 rounded-lg border text-left transition-all cursor-pointer
                                                ${bed.status === BedStatus.EMPTY 
                                                    ? 'border-dashed border-slate-200 bg-slate-50 hover:border-blue-300' 
                                                    : (isOverdue 
                                                        ? 'border-red-300 bg-red-50 hover:bg-red-100 shadow-sm ring-1 ring-red-200' 
                                                        : 'border-blue-100 bg-blue-50/30 hover:bg-blue-50 hover:border-blue-300')
                                                }
                                            `}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-xs ${bed.status === BedStatus.EMPTY ? 'text-slate-400' : 'text-blue-500 font-medium'}`}>
                                                    {bed.number}号
                                                </span>
                                                <div className={`w-2 h-2 rounded-full ${
                                                    bed.status === BedStatus.EMPTY ? 'bg-slate-200' : 
                                                    (isOverdue ? 'bg-red-500 animate-pulse' : 'bg-green-500')
                                                }`}></div>
                                            </div>
                                            <div className="truncate text-sm font-bold text-slate-800">
                                                {tenant ? tenant.name : <span className="text-slate-400 font-normal">空闲</span>}
                                            </div>
                                            {tenant && (
                                                <div className="truncate text-[10px] text-slate-500 mt-0.5">
                                                    {tenant.name.match(/\d+/) ? tenant.name : tenant.company.split('-')[0]}
                                                </div>
                                            )}
                                            {isOverdue && (
                                                <div className="absolute -top-1 -right-1 text-red-500 bg-white rounded-full">
                                                    <AlertTriangle size={14} fill="currentColor" className="text-red-500" />
                                                </div>
                                            )}
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
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <FileSpreadsheet className="text-blue-600" /> 批量办理入住
                    </h3>
                    <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto">
                    {/* Step Indicator */}
                    <div className="flex items-center justify-center mb-8">
                        <div className={`flex items-center gap-2 ${importStep >= 1 ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 ${importStep >= 1 ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>1</div>
                            下载模版
                        </div>
                        <div className={`w-16 h-0.5 mx-2 ${importStep >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                        <div className={`flex items-center gap-2 ${importStep >= 2 ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 ${importStep >= 2 ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>2</div>
                             上传名单
                        </div>
                         <div className={`w-16 h-0.5 mx-2 ${importStep >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                        <div className={`flex items-center gap-2 ${importStep >= 3 ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 ${importStep >= 3 ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>3</div>
                             配置与预览
                        </div>
                    </div>

                    {/* Step 1 Content */}
                    {importStep === 1 && (
                        <div className="text-center space-y-6 py-4">
                            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                                <Download size={40} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-800">下载员工信息模版</h4>
                                <p className="text-slate-500 mt-2 max-w-md mx-auto">请使用标准模版填写员工信息，包含姓名、手机号、身份证、性别、部门等必须字段。</p>
                            </div>
                            <button 
                                onClick={() => { handleDownloadTemplate(); setImportStep(2); }}
                                className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all"
                            >
                                <span className="flex items-center gap-2">
                                    <Download size={20} /> 点击下载 .csv 模版
                                </span>
                            </button>
                        </div>
                    )}

                    {/* Step 2 Content */}
                    {importStep === 2 && (
                        <div className="text-center space-y-6 py-4">
                             <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 hover:bg-slate-50 transition-colors cursor-pointer relative group">
                                <input 
                                    type="file" 
                                    accept=".xlsx,.xls,.csv" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileSelect}
                                />
                                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <Upload size={32} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-700 group-hover:text-blue-600">点击上传 或 拖拽文件至此</h4>
                                <p className="text-slate-400 text-sm mt-2">支持 .xlsx, .xls, .csv 格式</p>
                            </div>
                        </div>
                    )}

                    {/* Step 3 Content: Config & Preview */}
                    {importStep === 3 && importAnalysis && capacityPreview && (
                        <div className="space-y-6">
                            {/* File Analysis */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                                <FileSpreadsheet className="text-blue-600 mt-1 shrink-0" size={20} />
                                <div>
                                    <h4 className="font-bold text-slate-800">文件解析成功: {importFile?.name}</h4>
                                    <p className="text-sm text-slate-600 mt-1">
                                        识别到 <strong className="text-blue-700">{importAnalysis.total}</strong> 名员工。
                                        (男: {importAnalysis.males}, 女: {importAnalysis.females})
                                        <br/>涉及部门: {importAnalysis.departments.join(', ')}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Configuration */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-800 text-sm">分配规则设置</h4>
                                    
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-500">开放楼栋范围</label>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.keys(buildingStructure).map(b => (
                                                <label key={b} className={`px-3 py-1.5 rounded text-sm border cursor-pointer transition-all flex items-center gap-2 ${config.selectedBuildings.includes(b) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                                                    <input 
                                                        type="checkbox" 
                                                        className="hidden"
                                                        checked={config.selectedBuildings.includes(b)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setConfig(p => ({ ...p, selectedBuildings: [...p.selectedBuildings, b] }));
                                                            else setConfig(p => ({ ...p, selectedBuildings: p.selectedBuildings.filter(x => x !== b) }));
                                                        }}
                                                    />
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
                                            <input 
                                                type="checkbox" 
                                                className="hidden" 
                                                checked={config.strictDept}
                                                onChange={(e) => setConfig(p => ({ ...p, strictDept: e.target.checked }))}
                                            />
                                            <span className="text-sm text-slate-700">严禁不同部门混住</span>
                                        </label>
                                        <p className="text-[10px] text-slate-400">开启后，同一房间将只允许安排同一部门的员工，可能会降低床位利用率。</p>
                                    </div>
                                </div>

                                {/* Capacity Preview */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-800 text-sm">容量预演</h4>
                                    
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-600">男生床位需求</span>
                                            <span className="font-bold">{importAnalysis.males} 人</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${capacityPreview.maleDeficit > 0 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, (capacityPreview.availableMaleBeds / Math.max(1, importAnalysis.males)) * 100)}%` }}></div>
                                        </div>
                                        <div className="text-xs text-right">
                                            {capacityPreview.maleDeficit > 0 ? (
                                                <span className="text-red-600 font-bold">缺口 {capacityPreview.maleDeficit} 床 (建议排队)</span>
                                            ) : (
                                                <span className="text-green-600">充足 (余 {capacityPreview.availableMaleBeds - importAnalysis.males})</span>
                                            )}
                                        </div>

                                        <div className="mt-4 flex justify-between items-center text-sm">
                                            <span className="text-slate-600">女生床位需求</span>
                                            <span className="font-bold">{importAnalysis.females} 人</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                             <div className={`h-full ${capacityPreview.femaleDeficit > 0 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, (capacityPreview.availableFemaleBeds / Math.max(1, importAnalysis.females)) * 100)}%` }}></div>
                                        </div>
                                         <div className="text-xs text-right">
                                            {capacityPreview.femaleDeficit > 0 ? (
                                                <span className="text-red-600 font-bold">缺口 {capacityPreview.femaleDeficit} 床 (建议排队)</span>
                                            ) : (
                                                <span className="text-green-600">充足 (余 {capacityPreview.availableFemaleBeds - importAnalysis.females})</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Preview Text */}
                                    <div className="mt-4 bg-slate-50 p-3 rounded text-xs text-slate-500 border border-slate-200">
                                        <strong>方案预览:</strong><br/>
                                        系统将优先填满 {config.selectedBuildings[0] || 'A栋'} 低楼层空房...
                                        {config.strictDept && " 严格执行部门隔离策略..."}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                    <button 
                        onClick={() => setShowImportModal(false)}
                        className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50"
                    >
                        取消
                    </button>
                    {importStep < 3 ? (
                        <button 
                             onClick={() => setImportStep(2)} // For demo, skip real file handling logic transition
                             disabled={importStep === 1} // Step 2 auto-triggers on file drop
                             className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            下一步
                        </button>
                    ) : (
                         <button 
                             onClick={handleStartImport}
                             className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-200 hover:bg-blue-700 flex items-center gap-2"
                        >
                            <CheckCircle size={18} /> 确认分配并导入
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
