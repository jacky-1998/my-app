const { useState, useEffect } = React;

// IndexedDB 数据库操作
const DB_NAME = 'medicalRecordDB';
const DB_VERSION = 1;

// 初始化数据库
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject('数据库连接失败');
    
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // 创建患者表
      if (!db.objectStoreNames.contains('patients')) {
        const patientStore = db.createObjectStore('patients', { keyPath: 'id', autoIncrement: true });
        patientStore.createIndex('name', 'name', { unique: false });
        patientStore.createIndex('phone', 'phone', { unique: false });
      }
      
      // 创建病历表
      if (!db.objectStoreNames.contains('records')) {
        const recordStore = db.createObjectStore('records', { keyPath: 'id', autoIncrement: true });
        recordStore.createIndex('patientId', 'patientId', { unique: false });
        recordStore.createIndex('date', 'date', { unique: false });
      }
    };
  });
};

// 患者数据操作
const patientDB = {
  async getAll() {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('patients', 'readonly');
      const store = transaction.objectStore('patients');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('获取患者数据失败');
    });
  },
  
  async add(patient) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('patients', 'readwrite');
      const store = transaction.objectStore('patients');
      const request = store.add(patient);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('添加患者失败');
    });
  },
  
  async get(id) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('patients', 'readonly');
      const store = transaction.objectStore('patients');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('获取患者失败');
    });
  }
};

// 病历数据操作
const recordDB = {
  async getAll() {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('records', 'readonly');
      const store = transaction.objectStore('records');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('获取病历数据失败');
    });
  },
  
  async add(record) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('records', 'readwrite');
      const store = transaction.objectStore('records');
      const request = store.add(record);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('添加病历失败');
    });
  },
  
  async getByPatientId(patientId) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('records', 'readonly');
      const store = transaction.objectStore('records');
      const index = store.index('patientId');
      const request = index.getAll(patientId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('获取患者病历失败');
    });
  },
  
  async get(id) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('records', 'readonly');
      const store = transaction.objectStore('records');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('获取病历失败');
    });
  }
};

// 图标组件
const Icons = {
  FileText: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
    </svg>
  ),
  Users: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
    </svg>
  ),
  Settings: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
    </svg>
  ),
  Home: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
    </svg>
  ),
  ChevronLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
    </svg>
  ),
  Phone: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
    </svg>
  ),
  Alert: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
    </svg>
  ),
  Heart: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
    </svg>
  ),
  Edit: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
    </svg>
  ),
  Share: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
    </svg>
  ),
  Print: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
    </svg>
  ),
  Check: () => (
    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
  ),
  More: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
    </svg>
  ),
  Wechat: () => (
    <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.969-.982z"/>
    </svg>
  )
};

// 状态栏组件
const StatusBar = () => (
  <div className="h-11 bg-white flex items-center justify-between px-6 text-sm font-semibold fixed top-0 w-full max-w-md z-50">
    <span>9:41</span>
    <div className="flex gap-1">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/>
      </svg>
    </div>
  </div>
);

// 底部导航栏
const TabBar = ({ currentPage, onNavigate }) => {
  if (currentPage === 'login' || currentPage === 'patient-detail' || currentPage === 'record-detail') return null;
  
  return (
    <div className="tab-bar fixed bottom-0 w-full max-w-md px-6 py-3 flex justify-around items-center z-50">
      <button 
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center gap-1 ${currentPage === 'home' ? 'text-medical-blue' : 'text-gray-400'}`}
      >
        <Icons.Home />
        <span className="text-xs font-medium">首页</span>
      </button>
      <button 
        onClick={() => onNavigate('patients')}
        className={`flex flex-col items-center gap-1 ${currentPage === 'patients' ? 'text-medical-blue' : 'text-gray-400'}`}
      >
        <Icons.Users />
        <span className="text-xs font-medium">患者</span>
      </button>
      <button 
          onClick={() => onNavigate('settings')}
          className={`flex flex-col items-center gap-1 ${currentPage === 'settings' ? 'text-medical-blue' : 'text-gray-400'}`}
        >
          <Icons.Settings />
          <span className="text-xs font-medium">我</span>
        </button>
    </div>
  );
};

// 登录页面
const LoginPage = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  return (
    <div className="page-enter pt-12">
      <div className="px-6 pt-12 pb-8">
        <div className="w-20 h-20 bg-medical-blue rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <Icons.FileText />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">医记</h1>
        <p className="text-gray-500">诊所病历数字化助手</p>
      </div>

      <div className="px-6 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center border-b border-gray-100 pb-3">
            <span className="text-gray-500 w-16 text-sm">手机号</span>
            <input 
              type="tel" 
              placeholder="请输入手机号" 
              className="flex-1 ios-input text-gray-900" 
              maxLength={11}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="flex items-center pt-3">
            <span className="text-gray-500 w-16 text-sm">验证码</span>
            <input 
              type="number" 
              placeholder="请输入验证码" 
              className="flex-1 ios-input text-gray-900"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button className="text-medical-blue text-sm font-medium whitespace-nowrap">获取验证码</button>
          </div>
        </div>

        <button 
          onClick={onLogin}
          className="w-full bg-medical-blue text-white font-semibold py-4 rounded-2xl touch-active shadow-lg shadow-blue-500/30"
        >
          登录
        </button>

        <div className="flex items-center justify-center gap-4 pt-4">
          <div className="h-px bg-gray-300 flex-1"></div>
          <span className="text-gray-400 text-sm">或</span>
          <div className="h-px bg-gray-300 flex-1"></div>
        </div>

        <button className="w-full bg-white border border-gray-200 text-gray-700 font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 touch-active">
          <Icons.Wechat />
          微信一键登录
        </button>
      </div>
    </div>
  );
};

// 首页/工作台
const HomePage = ({ onNavigate }) => {
  const [todayPatients, setTodayPatients] = useState([]);
  
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const patients = await patientDB.getAll();
        // 模拟今日就诊数据
        const today = patients.map(patient => ({
          ...patient,
          type: Math.random() > 0.5 ? '复诊' : '初诊',
          time: `${Math.floor(Math.random() * 12 + 8)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
          diagnosis: ['上呼吸道感染', '急性肠胃炎', '高血压随访', '糖尿病随访', '过敏性鼻炎'][Math.floor(Math.random() * 5)],
          hasAllergy: !!patient.allergy
        }));
        setTodayPatients(today.slice(0, 3));
      } catch (error) {
        console.error('加载患者数据失败:', error);
        // 使用默认数据作为备份
        setTodayPatients([
          { id: 1, name: '张三', gender: '男', age: 32, type: '复诊', time: '12:30', diagnosis: '上呼吸道感染', hasAllergy: true },
          { id: 2, name: '李四', gender: '女', age: 28, type: '初诊', time: '11:15', diagnosis: '急性肠胃炎', hasAllergy: false },
          { id: 3, name: '王五', gender: '男', age: 45, type: '复诊', time: '10:00', diagnosis: '高血压随访', hasAllergy: false },
        ]);
      }
    };
    
    loadPatients();
  }, []);

  return (
    <div className="page-enter pt-12 pb-24">
      {/* 搜索栏 */}
      <div className="px-4 py-3 bg-white sticky top-11 z-40 shadow-sm">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icons.Search />
          </div>
          <input 
            type="text" 
            placeholder="搜索患者姓名或手机号" 
            className="w-full bg-gray-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="px-4 py-6 grid grid-cols-2 gap-4">
        <div 
          onClick={() => onNavigate('create-record')}
          className="bg-medical-blue text-white p-5 rounded-2xl shadow-lg shadow-blue-500/30 touch-active"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
            <Icons.FileText />
          </div>
          <div className="font-bold text-lg">新建病历</div>
          <div className="text-blue-100 text-sm mt-1">快速记录患者信息</div>
        </div>
        
        <div 
          onClick={() => onNavigate('patients')}
          className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 touch-active"
        >
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-3 text-gray-600">
            <Icons.Users />
          </div>
          <div className="font-bold text-gray-900 text-lg">患者列表</div>
          <div className="text-gray-500 text-sm mt-1">查看全部患者</div>
        </div>
      </div>

      {/* 今日就诊 */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">今日就诊</h2>
          <span className="text-medical-blue text-sm font-medium">查看全部</span>
        </div>
        
        <div className="space-y-3">
          {todayPatients.map(patient => (
            <div 
              key={patient.id}
              onClick={() => onNavigate('patient-detail', patient.id)}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 touch-active"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-medical-blue font-bold text-lg">
                    {patient.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{patient.name}</span>
                      {patient.hasAllergy && (
                        <span className="text-xs bg-red-100 text-medical-red px-2 py-0.5 rounded-full font-medium">过敏</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {patient.gender} · {patient.age}岁 · {patient.type}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">{patient.time}</div>
                  <div className="text-xs text-gray-400 mt-1">{patient.diagnosis}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="px-4 mt-6">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
          <div className="text-gray-400 text-sm mb-1">本周就诊统计</div>
          <div className="flex items-end justify-between">
            <div>
              <span className="text-3xl font-bold">48</span>
              <span className="text-gray-400 text-sm ml-1">人次</span>
            </div>
            <div className="flex gap-1 items-end h-12">
              <div className="w-2 bg-white/20 rounded-t" style={{height: '40%'}}></div>
              <div className="w-2 bg-white/20 rounded-t" style={{height: '60%'}}></div>
              <div className="w-2 bg-white/20 rounded-t" style={{height: '30%'}}></div>
              <div className="w-2 bg-white/20 rounded-t" style={{height: '80%'}}></div>
              <div className="w-2 bg-white/40 rounded-t" style={{height: '50%'}}></div>
              <div className="w-2 bg-white/80 rounded-t" style={{height: '70%'}}></div>
              <div className="w-2 bg-medical-blue rounded-t" style={{height: '60%'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 患者列表页面
const PatientListPage = ({ onNavigate, onBack }) => {
  const [patients, setPatients] = useState([]);
  
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const patientData = await patientDB.getAll();
        setPatients(patientData);
      } catch (error) {
        console.error('加载患者数据失败:', error);
        // 使用默认数据作为备份
        setPatients([
          { id: 1, name: '张三', phone: '138****1234', gender: '男', age: 32, allergy: '青霉素过敏' },
          { id: 2, name: '李四', phone: '139****5678', gender: '女', age: 28, allergy: null },
          { id: 3, name: '王五', phone: '137****9012', gender: '男', age: 45, allergy: null },
        ]);
      }
    };
    
    loadPatients();
  }, []);

  return (
    <div className="page-enter pt-12 pb-24">
      <div className="bg-white px-4 py-3 sticky top-11 z-40 shadow-sm flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
          <Icons.ChevronLeft />
        </button>
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icons.Search />
          </div>
          <input 
            type="text" 
            placeholder="搜索患者姓名或手机号" 
            className="w-full bg-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button 
          onClick={() => onNavigate('create-patient')}
          className="bg-medical-blue text-white p-2.5 rounded-xl touch-active"
        >
          <Icons.Plus />
        </button>
      </div>

      {/* 筛选标签 */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto hide-scrollbar bg-white border-b border-gray-100">
        <button className="px-4 py-1.5 bg-gray-900 text-white text-sm rounded-full whitespace-nowrap">全部</button>
        <button className="px-4 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-full whitespace-nowrap">最近7天</button>
        <button className="px-4 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-full whitespace-nowrap">最近30天</button>
        <button className="px-4 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-full whitespace-nowrap">慢性病</button>
        <button className="px-4 py-1.5 bg-red-50 text-medical-red text-sm rounded-full whitespace-nowrap">过敏史</button>
      </div>

      {/* 患者列表 */}
      <div className="px-4 py-4 space-y-3">
        <div className="text-sm text-gray-500 font-medium mb-2">共 128 位患者</div>
        
        {patients.map(patient => (
          <div 
            key={patient.id}
            onClick={() => onNavigate('patient-detail', patient.id)}
            className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between touch-active"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-medical-blue font-bold">
                {patient.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{patient.name}</span>
                  {patient.allergy && (
                    <span className="text-xs bg-red-100 text-medical-red px-2 py-0.5 rounded-full">{patient.allergy}</span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">
                  {patient.phone} · {patient.gender} · {patient.age}岁
                </div>
              </div>
            </div>
            <Icons.ChevronRight />
          </div>
        ))}
      </div>
    </div>
  );
};

// 新建患者页面
const CreatePatientPage = ({ onNavigate, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: '',
    idCard: '',
    birthDate: '',
    age: '',
    allergy: '',
    familyHistory: ''
  });
  const [selectedAllergy, setSelectedAllergy] = useState(null);

  const parseIdCard = (idCard) => {
    if (idCard.length === 18) {
      const birthStr = idCard.substring(6, 14);
      const year = birthStr.substring(0, 4);
      const month = birthStr.substring(4, 6);
      const day = birthStr.substring(6, 8);
      const birthDate = `${year}-${month}-${day}`;
      
      const birth = new Date(year, month - 1, day);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      const genderCode = parseInt(idCard.substring(16, 17));
      const gender = genderCode % 2 === 0 ? '女' : '男';
      
      setFormData(prev => ({
        ...prev,
        idCard,
        birthDate,
        age: age.toString(),
        gender
      }));
    } else {
      setFormData(prev => ({ ...prev, idCard }));
    }
  };

  const handleSave = async () => {
    try {
      const patientData = {
        ...formData,
        allergy: selectedAllergy === '无' ? null : selectedAllergy,
        createdAt: new Date().toISOString()
      };
      
      await patientDB.add(patientData);
      onNavigate('patients');
    } catch (error) {
      console.error('保存患者数据失败:', error);
      alert('保存失败，请重试');
    }
  };

  return (
    <div className="page-enter pt-12 pb-24">
      <div className="bg-white px-4 py-3 sticky top-11 z-40 shadow-sm flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
          <Icons.ChevronLeft />
        </button>
        <h1 className="text-lg font-bold">新建患者档案</h1>
        <button className="text-medical-blue font-medium">保存</button>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* 基本信息 */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-medium text-gray-500">基本信息</span>
          </div>
          
          <div className="divide-y divide-gray-100">
            <div className="px-4 py-4 flex items-center justify-between">
              <span className="text-gray-900 font-medium">姓名 <span className="text-red-500">*</span></span>
              <input 
                type="text" 
                placeholder="请输入患者姓名" 
                className="ios-input text-right text-gray-900 w-1/2"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="px-4 py-4 flex items-center justify-between">
              <span className="text-gray-900 font-medium">手机号 <span className="text-red-500">*</span></span>
              <input 
                type="tel" 
                placeholder="请输入手机号" 
                className="ios-input text-right text-gray-900 w-1/2"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            
            <div className="px-4 py-4 flex items-center justify-between">
              <span className="text-gray-900 font-medium">性别 <span className="text-red-500">*</span></span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="gender" 
                    className="w-4 h-4 text-blue-600"
                    checked={formData.gender === '男'}
                    onChange={() => setFormData({...formData, gender: '男'})}
                  />
                  <span className="text-gray-700">男</span>
                </label>
                <label className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="gender" 
                    className="w-4 h-4 text-blue-600"
                    checked={formData.gender === '女'}
                    onChange={() => setFormData({...formData, gender: '女'})}
                  />
                  <span className="text-gray-700">女</span>
                </label>
              </div>
            </div>
            
            <div className="px-4 py-4 flex items-center justify-between">
              <span className="text-gray-900 font-medium">身份证号</span>
              <input 
                type="text" 
                placeholder="选填，可自动计算年龄" 
                className="ios-input text-right text-gray-900 w-2/3"
                maxLength={18}
                value={formData.idCard}
                onChange={(e) => parseIdCard(e.target.value)}
              />
            </div>
            
            <div className="px-4 py-4 flex items-center justify-between">
              <span className="text-gray-900 font-medium">出生日期</span>
              <input 
                type="date" 
                className="ios-input text-right text-gray-900"
                value={formData.birthDate}
                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
              />
            </div>
            
            <div className="px-4 py-4 flex items-center justify-between">
              <span className="text-gray-900 font-medium">年龄</span>
              <span className="text-gray-500">{formData.age ? formData.age + ' 岁' : '-- 岁'}</span>
            </div>
          </div>
        </div>

        {/* 健康信息 */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-medium text-gray-500">健康档案</span>
          </div>
          
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-gray-900 font-medium mb-2">过敏史 <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-2 mb-3">
                {['青霉素', '头孢', '磺胺', '海鲜', '无'].map(item => (
                  <button 
                    key={item}
                    className={`px-3 py-1.5 text-sm rounded-lg border ${selectedAllergy === item ? 'bg-red-50 text-medical-red border-red-100' : 'bg-gray-100 text-gray-600'}`}
                    onClick={() => setSelectedAllergy(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <textarea 
                placeholder="详细描述过敏情况..." 
                className="w-full bg-gray-50 rounded-xl p-3 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-gray-900 font-medium mb-2">遗传疾病史</label>
              <textarea 
                placeholder="记录家族遗传病史..." 
                className="w-full bg-gray-50 rounded-xl p-3 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>
        </div>

        {/* 保存按钮 */}
        <button 
          onClick={handleSave}
          className="w-full bg-medical-blue text-white font-semibold py-4 rounded-2xl touch-active shadow-lg shadow-blue-500/30"
        >
          保存并创建档案
        </button>
      </div>
    </div>
  );
};

// 患者详情页面
const PatientDetailPage = ({ onNavigate, onBack }) => {
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // 模拟获取患者ID，实际应该从路由参数中获取
        const patientId = 1;
        const patientData = await patientDB.get(patientId);
        setPatient(patientData);
        
        const patientRecords = await recordDB.getByPatientId(patientId);
        setRecords(patientRecords);
      } catch (error) {
        console.error('加载患者详情失败:', error);
        // 使用默认数据作为备份
        setPatient({
          id: 1,
          name: '张三',
          gender: '男',
          age: 32,
          phone: '138****1234',
          allergy: '青霉素过敏'
        });
        setRecords([
          { id: 1, date: '2026-04-06', department: '全科', type: '复诊', diagnosis: '上呼吸道感染', content: '患者主诉头痛发热3天，伴有咳嗽。查体：T 38.2℃，咽部充血...', medicines: ['阿莫西林', '布洛芬'] },
          { id: 2, date: '2026-03-15', department: '全科', type: '初诊', diagnosis: '急性肠胃炎', content: '腹痛腹泻2天，每日排便3-4次，无发热。给予蒙脱石散、益生菌治疗...', medicines: [] },
          { id: 3, date: '2026-01-20', department: '全科', type: '复诊', diagnosis: '高血压随访', content: '血压控制良好，130/85mmHg，继续当前用药方案...', medicines: [] },
        ]);
      }
    };
    
    loadData();
  }, []);

  return (
    <div className="page-enter pt-12 pb-24">
      <div className="bg-white px-4 py-3 sticky top-11 z-40 shadow-sm flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
          <Icons.ChevronLeft />
        </button>
        <h1 className="text-lg font-bold">患者详情</h1>
        <div className="w-8"></div>
      </div>

      {/* 患者头部信息 */}
      <div className="bg-white px-6 py-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-medical-blue font-bold text-2xl">张</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">张三</h2>
              <div className="flex items-center gap-2 mt-1 text-gray-500">
                <span>男</span>
                <span>·</span>
                <span>32岁</span>
                <span>·</span>
                <span>138****1234</span>
              </div>
            </div>
          </div>
          <a href="tel:13800121234" className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 touch-active">
            <Icons.Phone />
          </a>
        </div>
        
        {/* 警示标签 */}
        <div className="mt-4 flex gap-2">
          <span className="px-3 py-1.5 bg-red-50 text-medical-red text-sm rounded-lg flex items-center gap-1">
            <Icons.Alert />
            青霉素过敏
          </span>
          <span className="px-3 py-1.5 bg-orange-50 text-orange-600 text-sm rounded-lg flex items-center gap-1">
            <Icons.Heart />
            高血压
          </span>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="px-4 py-4 grid grid-cols-2 gap-3">
        <button 
          onClick={() => onNavigate('create-record')}
          className="bg-medical-blue text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 touch-active shadow-lg shadow-blue-500/30"
        >
          <Icons.FileText />
          新建病历
        </button>
        <button className="bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2 touch-active">
          <Icons.Edit />
          编辑档案
        </button>
      </div>

      {/* 历史病历时间轴 */}
      <div className="px-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">就诊记录</h3>
        
        <div className="relative pl-4 space-y-6 before:absolute before:left-1.5 before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-200">
          {records.map((record, index) => (
            <div 
              key={record.id}
              className="relative"
              onClick={() => onNavigate('record-detail', record.id)}
            >
              <div className={`absolute -left-4 top-1.5 w-3 h-3 rounded-full border-2 border-white shadow ${index === 0 ? 'bg-medical-blue' : 'bg-gray-300'}`}></div>
              <div className={`bg-white p-4 rounded-2xl shadow-sm touch-active ${index > 0 ? 'opacity-80' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-gray-900">{record.date}</div>
                    <div className="text-sm text-gray-500">{record.department} · {record.type}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${index === 0 ? 'bg-blue-50 text-medical-blue' : 'bg-gray-100 text-gray-600'}`}>
                    {record.diagnosis}
                  </span>
                </div>
                <div className="text-sm text-gray-600 line-clamp-2">
                  {record.content}
                </div>
                {record.medicines && record.medicines.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {record.medicines.map((med, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{med}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 新建病历页面
const CreateRecordPage = ({ onNavigate, onBack }) => {
  const [treatment, setTreatment] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({
    chiefComplaint: '',
    presentIllness: '',
    pastHistory: '',
    diagnosis: '',
    treatment: '',
    notes: ''
  });

  const insertTag = (text) => {
    setTreatment(prev => prev + (prev ? ' ' : '') + `[${text}]`);
  };

  const handleSave = async () => {
    try {
      const recordData = {
        ...formData,
        patientId: 1, // 模拟患者ID
        date: new Date().toISOString().split('T')[0],
        department: '全科',
        type: '初诊',
        createdAt: new Date().toISOString()
      };
      
      await recordDB.add(recordData);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        onNavigate('home');
      }, 1500);
    } catch (error) {
      console.error('保存病历失败:', error);
      alert('保存失败，请重试');
    }
  };

  return (
    <div className="page-enter pt-12 pb-24">
      <div className="bg-white px-4 py-3 sticky top-11 z-40 shadow-sm flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
          <Icons.ChevronLeft />
        </button>
        <h1 className="text-lg font-bold">新建病历</h1>
        <button onClick={() => onNavigate('home')} className="text-medical-blue font-medium">保存</button>
      </div>

      {/* 患者信息卡片（自动带入） */}
      <div className="mx-4 mt-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-2xl p-4 border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-medical-blue text-white rounded-full flex items-center justify-center font-bold">张</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">张三</span>
                <span className="text-xs bg-white text-medical-blue px-2 py-0.5 rounded-full">男 · 32岁</span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">就诊时间：2026-04-06 14:30</div>
            </div>
          </div>
          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">全科</span>
        </div>
        
        {/* 过敏警示 */}
        <div className="mt-3 flex items-center gap-2 text-medical-red text-sm bg-white/60 p-2 rounded-lg">
          <Icons.Alert />
          <span className="font-medium">过敏史：青霉素过敏</span>
        </div>
      </div>

      {/* 病历表单 */}
      <div className="px-4 py-6 space-y-6">
        {/* 主诉 */}
        <div>
          <label className="block text-gray-900 font-bold mb-2">主诉 <span className="text-red-500">*</span></label>
          <textarea 
            placeholder="请描述患者主要症状及持续时间，如：头痛发热3天" 
            className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-gray-900 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={formData.chiefComplaint}
            onChange={(e) => setFormData({...formData, chiefComplaint: e.target.value})}
          ></textarea>
        </div>

        {/* 现病史 */}
        <div>
          <label className="block text-gray-900 font-bold mb-2">现病史</label>
          <textarea 
            placeholder="详细描述疾病发生、发展及诊疗经过..." 
            className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-gray-900 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={formData.presentIllness}
            onChange={(e) => setFormData({...formData, presentIllness: e.target.value})}
          ></textarea>
        </div>

        {/* 既往史（自动带入可编辑） */}
        <div>
          <label className="block text-gray-900 font-bold mb-2">既往史</label>
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1.5 bg-white text-gray-700 text-sm rounded-lg border border-gray-200 flex items-center gap-1">
                高血压
                <button className="text-gray-400 hover:text-red-500">×</button>
              </span>
              <button className="px-3 py-1.5 bg-gray-200 text-gray-600 text-sm rounded-lg">+ 添加</button>
            </div>
            <textarea 
              placeholder="补充既往病史..." 
              className="w-full bg-transparent text-gray-900 min-h-[60px] resize-none focus:outline-none text-sm"
              value={formData.pastHistory}
              onChange={(e) => setFormData({...formData, pastHistory: e.target.value})}
            ></textarea>
          </div>
        </div>

        {/* 诊断 */}
        <div>
          <label className="block text-gray-900 font-bold mb-2">诊断 <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            placeholder="请输入诊断结果" 
            className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={formData.diagnosis}
            onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
          />
          <div className="flex flex-wrap gap-2 mt-3">
            <button className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200">上呼吸道感染</button>
            <button className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200">急性肠胃炎</button>
            <button className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200">高血压</button>
            <button className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200">糖尿病</button>
          </div>
        </div>

        {/* 治疗方案（带用药频率） */}
        <div>
          <label className="block text-gray-900 font-bold mb-2">治疗方案</label>
          <textarea 
            value={treatment}
            onChange={(e) => {
              setTreatment(e.target.value);
              setFormData({...formData, treatment: e.target.value});
            }}
            placeholder="请输入用药及治疗方案..." 
            className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-gray-900 min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          ></textarea>
          
          {/* 用药频率快捷标签 */}
          <div className="mt-3">
            <div className="text-xs text-gray-500 mb-2">快捷插入用药频率：</div>
            <div className="flex flex-wrap gap-2">
              {['每日1次', '每日2次', '每日3次', '睡前服用', '饭后服用', '必要时'].map(tag => (
                <button 
                  key={tag}
                  onClick={() => insertTag(tag)}
                  className="px-3 py-1.5 bg-blue-50 text-medical-blue text-sm rounded-lg border border-blue-100"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 注意事项 */}
        <div>
          <label className="block text-gray-900 font-bold mb-2">注意事项 / 医嘱</label>
          <textarea 
            placeholder="生活建议、复诊提醒、禁忌事项..." 
            className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-gray-900 min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          ></textarea>
        </div>

        {/* 发送给患者选项 */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <Icons.Wechat />
            </div>
            <div>
              <div className="font-medium text-gray-900">发送给患者</div>
              <div className="text-xs text-gray-500">微信推送用药提醒</div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-medical-blue"></div>
          </label>
        </div>

        {/* 保存按钮 */}
        <button 
          onClick={handleSave}
          className="w-full bg-medical-blue text-white font-semibold py-4 rounded-2xl touch-active shadow-lg shadow-blue-500/30 mb-6"
        >
          保存病历
        </button>
      </div>

      {/* Toast提示 */}
      {showToast && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-4 rounded-2xl flex items-center gap-3 z-50">
          <Icons.Check />
          <span className="font-medium">保存成功</span>
        </div>
      )}
    </div>
  );
};

// 病历详情页面
const RecordDetailPage = ({ onNavigate, onBack }) => {
  const [record, setRecord] = useState(null);
  
  useEffect(() => {
    const loadRecord = async () => {
      try {
        // 模拟获取病历ID，实际应该从路由参数中获取
        const recordId = 1;
        const recordData = await recordDB.get(recordId);
        setRecord(recordData);
      } catch (error) {
        console.error('加载病历详情失败:', error);
        // 使用默认数据作为备份
        setRecord({
          id: 1,
          patientId: 1,
          date: '2026-04-06',
          department: '全科',
          type: '复诊',
          diagnosis: '上呼吸道感染',
          chiefComplaint: '头痛发热3天，伴有咳嗽',
          presentIllness: '患者3天前无明显诱因出现头痛，体温最高38.5℃，伴有咳嗽，无咳痰。自服布洛芬后体温可暂时下降，但仍反复。',
          pastHistory: '高血压病史5年，规律服用降压药',
          treatment: '阿莫西林胶囊 0.5g [每日3次] 饭后服用，连服3天；布洛芬缓释胶囊 0.3g [必要时] 发热时服用',
          notes: '多饮水，注意休息，避免劳累；如体温持续超过38.5℃超过3天，请及时复诊；3天后复诊，如有不适随时就诊',
          medicines: [
            { name: '阿莫西林胶囊 0.5g', usage: '每日3次，饭后服用，连服3天' },
            { name: '布洛芬缓释胶囊 0.3g', usage: '发热时服用，必要时' },
            { name: '复方甘草片', usage: '每日3次，每次2片' }
          ]
        });
      }
    };
    
    loadRecord();
  }, []);

  return (
    <div className="page-enter pt-12 pb-24">
      <div className="bg-white px-4 py-3 sticky top-11 z-40 shadow-sm flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
          <Icons.ChevronLeft />
        </button>
        <h1 className="text-lg font-bold">病历详情</h1>
        <div className="w-8"></div>
      </div>

      {/* 病历头部 */}
      <div className="bg-white px-6 py-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-gray-900">张三</div>
            <div className="text-gray-500 mt-1">男 · 32岁 · 全科</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-medium text-gray-900">2026-04-06</div>
            <div className="text-sm text-gray-500">14:30 就诊</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-medical-red bg-red-50 p-3 rounded-xl">
          <Icons.Alert />
          <span className="font-medium">警示：青霉素过敏</span>
        </div>
      </div>

      {/* 病历内容 */}
      <div className="px-4 py-6 space-y-6">
        {/* 主诉 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-medical-blue rounded-full"></span>
            主诉
          </h3>
          <p className="text-gray-700 leading-relaxed">头痛、发热3天，最高体温38.5℃，伴有咳嗽、咽痛，无寒战。</p>
        </div>

        {/* 现病史 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-medical-blue rounded-full"></span>
            现病史
          </h3>
          <p className="text-gray-700 leading-relaxed">患者3天前受凉后出现头痛、发热，自测体温最高38.5℃，伴畏寒、乏力，咳嗽，咳少量白痰，无胸痛、气促。自行服用感冒药（具体不详）效果不佳，遂来就诊。</p>
        </div>

        {/* 既往史 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-medical-blue rounded-full"></span>
            既往史
          </h3>
          <p className="text-gray-700 leading-relaxed">高血压病史2年，规律服用降压药，血压控制可。否认糖尿病、心脏病史。青霉素过敏（皮疹）。</p>
        </div>

        {/* 诊断 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-medical-blue">
          <h3 className="font-bold text-gray-900 mb-2">诊断</h3>
          <p className="text-lg text-medical-blue font-medium">急性上呼吸道感染</p>
        </div>

        {/* 治疗方案 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-medical-blue rounded-full"></span>
            治疗方案
          </h3>
          <div className="space-y-3 text-gray-700">
            {[
              { name: '阿莫西林胶囊 0.5g', usage: '每日3次，饭后服用，连服3天' },
              { name: '布洛芬缓释胶囊 0.3g', usage: '发热时服用，必要时' },
              { name: '复方甘草片', usage: '每日3次，每次2片' }
            ].map((med, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-50 text-medical-blue rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">{i + 1}</span>
                <div>
                  <div className="font-medium">{med.name}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{med.usage}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 注意事项 */}
        <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-100">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            医嘱 / 注意事项
          </h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">•</span>
              <span>多饮水，注意休息，避免劳累</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">•</span>
              <span>如体温持续超过38.5℃超过3天，请及时复诊</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">•</span>
              <span>3天后复诊，如有不适随时就诊</span>
            </li>
          </ul>
        </div>

        {/* 医生签名 */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <div className="text-right">
            <div className="text-sm text-gray-500">接诊医生</div>
            <div className="font-bold text-gray-900">张医生</div>
          </div>
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">医</div>
        </div>

        {/* 底部操作 */}
        <div className="flex gap-3 pt-4">
          <button className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2 touch-active">
            <Icons.Share />
            分享患者
          </button>
          <button className="flex-1 bg-medical-blue text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 touch-active shadow-lg shadow-blue-500/30">
            <Icons.Print />
            打印病历
          </button>
        </div>
      </div>
    </div>
  );
};

// 设置页面
const SettingsPage = ({ onBack }) => {
  return (
    <div className="page-enter pt-12 pb-24">
      <div className="px-4 py-6 space-y-6">
        {/* 医生信息卡片 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-medical-blue font-bold text-2xl">
            <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20doctor%20portrait%20male%20asian&image_size=square" alt="医生头像" className="w-full h-full rounded-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">陈晓峰</h2>
              <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                已认证
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-1">主任医师 · 心内科</div>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.17 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10c0-5.523-4.477-10-10-10z"></path>
              </svg>
              临床数字记 (ClinicalDigitalis)
            </div>
          </div>
        </div>
        
        {/* 诊所管理 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 px-2">诊所管理</h3>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-gray-100">
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-medical-blue">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                  </div>
                  <span className="text-gray-900 font-medium">诊所信息</span>
                </div>
                <Icons.ChevronRight />
              </div>
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-medical-blue">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <span className="text-gray-900 font-medium">成员管理</span>
                </div>
                <Icons.ChevronRight />
              </div>
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-medical-blue">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <span className="text-gray-900 font-medium">排班设置</span>
                </div>
                <Icons.ChevronRight />
              </div>
            </div>
          </div>
        </div>
        
        {/* 系统设置 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 px-2">系统设置</h3>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-gray-100">
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-medical-blue">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                    </svg>
                  </div>
                  <span className="text-gray-900 font-medium">消息通知</span>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input type="checkbox" name="toggle" id="toggle" className="sr-only" checked />
                  <label htmlFor="toggle" className="block overflow-hidden h-6 rounded-full bg-medical-blue cursor-pointer"></label>
                </div>
              </div>
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-medical-blue">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <span className="text-gray-900 font-medium">打印设置</span>
                </div>
                <Icons.ChevronRight />
              </div>
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-medical-blue">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                  </div>
                  <span className="text-gray-900 font-medium">数据安全与备份</span>
                </div>
                <Icons.ChevronRight />
              </div>
            </div>
          </div>
        </div>
        
        {/* 关于 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 px-2">关于</h3>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-gray-100">
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-medical-blue">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <span className="text-gray-900 font-medium">版本更新</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">v1.2.0</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-medical-blue">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <span className="text-gray-900 font-medium">帮助中心</span>
                </div>
                <Icons.ChevronRight />
              </div>
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-medical-blue">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <span className="text-gray-900 font-medium">联系我们</span>
                </div>
                <Icons.ChevronRight />
              </div>
            </div>
          </div>
        </div>
        
        {/* 退出登录 */}
        <button className="w-full bg-white border border-medical-red text-medical-red font-medium py-4 rounded-2xl shadow-sm flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          退出登录
        </button>
        
        {/* 版权信息 */}
        <div className="text-center text-xs text-gray-400 mt-6">
          DIGITALIS HEALTH SYSTEMS © 2024
        </div>
      </div>
    </div>
  );
};

// 主应用组件
const App = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [pageHistory, setPageHistory] = useState(['login']);

  const navigateTo = (page, params = null) => {
    setPageHistory(prev => [...prev, page]);
    setCurrentPage(page);
  };

  const navigateBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = [...pageHistory];
      newHistory.pop();
      setPageHistory(newHistory);
      setCurrentPage(newHistory[newHistory.length - 1]);
    }
  };

  const handleLogin = () => {
    navigateTo('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      case 'home':
        return <HomePage onNavigate={navigateTo} />;
      case 'patients':
        return <PatientListPage onNavigate={navigateTo} onBack={navigateBack} />;
      case 'create-patient':
        return <CreatePatientPage onNavigate={navigateTo} onBack={navigateBack} />;
      case 'patient-detail':
        return <PatientDetailPage onNavigate={navigateTo} onBack={navigateBack} />;
      case 'create-record':
        return <CreateRecordPage onNavigate={navigateTo} onBack={navigateBack} />;
      case 'record-detail':
        return <RecordDetailPage onNavigate={navigateTo} onBack={navigateBack} />;
      case 'settings':
        return <SettingsPage onBack={navigateBack} />;
      default:
        return <HomePage onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative shadow-2xl overflow-hidden">
      <StatusBar />
      {renderPage()}
      <TabBar currentPage={currentPage} onNavigate={navigateTo} />
    </div>
  );
};

// 渲染应用
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
