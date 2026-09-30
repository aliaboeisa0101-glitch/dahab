"use client";

import React, { useState, useEffect } from 'react';

export default function Page() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentTab, setCurrentTab] = useState('dashboard');

  const [kioskCode, setKioskCode] = useState('');
  const [kioskStatus, setKioskStatus] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  const [workers, setWorkers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));

  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [newWorker, setNewWorker] = useState({
    code: '',
    name: '',
    department: 'خياطة',
    phone: '',
    wage_type: 'daily',
    base_rate: '150',
    overtime_rate: '25',
    shift_start: '08:00',
    shift_end: '17:00',
    grace_minutes: '15',
  });

  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [newTx, setNewTx] = useState({
    worker_id: '',
    worker_code: '',
    worker_name: '',
    type: 'advance',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [showManualAttModal, setShowManualAttModal] = useState(false);
  const [manualAtt, setManualAtt] = useState({
    worker_code: '',
    date: new Date().toISOString().split('T')[0],
    punch_in: '08:00',
    punch_out: '17:00',
    notes: 'تسجيل يدوي من الإدارة',
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('ar-EG', { hour12: true }));
      setCurrentDate(now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && kioskStatus) {
      setKioskStatus(null);
      setKioskCode('');
    }
  }, [countdown, kioskStatus]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/data?date=${selectedDate}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setWorkers(json.workers || []);
          setAttendance(json.attendance || []);
          setTransactions(json.transactions || []);
        }
      }
    } catch (e) {
      setWorkers([
        { id: 1, code: '1001', name: 'فاطمة محمود', department: 'خياطة', phone: '01011112222', wage_type: 'daily', base_rate: 150, overtime_rate: 25, shift_start: '08:00', shift_end: '17:00' },
        { id: 2, code: '1002', name: 'أحمد إبراهيم', department: 'قص', phone: '01022223333', wage_type: 'daily', base_rate: 180, overtime_rate: 30, shift_start: '08:00', shift_end: '17:00' },
        { id: 3, code: '1003', name: 'مريم عبد الله', department: 'تشطيب وجودة', phone: '01033334444', wage_type: 'hourly', base_rate: 20, overtime_rate: 25, shift_start: '08:00', shift_end: '17:00' },
      ]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const handleKeypadPress = (val) => {
    if (kioskCode.length < 8) setKioskCode((prev) => prev + val);
  };
  const handleKeypadClear = () => setKioskCode('');
  const handleKeypadBackspace = () => setKioskCode((prev) => prev.slice(0, -1));

  const handlePunch = async (type) => {
    if (!kioskCode.trim()) {
      setKioskStatus({ type: 'error', message: 'يرجى إدخال كود العامل أولاً', details: '' });
      setCountdown(4);
      return;
    }

    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'punch', code: kioskCode.trim(), type }),
      });
      const data = await res.json();

      if (data.success) {
        let details = `الوقت: ${data.time}`;
        if (type === 'in' && data.lateMinutes > 0) details += ` | تأخير: ${data.lateMinutes} دقيقة`;
        else if (type === 'out') details += ` | ساعات العمل: ${data.workHours} س`;

        setKioskStatus({
          type: type === 'in' && data.lateMinutes > 0 ? 'warning' : 'success',
          message: data.message,
          details,
        });
        fetchData();
      } else {
        setKioskStatus({
          type: 'error',
          message: data.message || 'حدث خطأ أثناء التسجيل',
          details: 'يرجى مراجعة إدارة المصنع',
        });
      }
    } catch (e) {
      setKioskStatus({
        type: 'error',
        message: 'تعذر الاتصال بالخادم، يرجى المحاولة ثانية',
        details: String(e),
      });
    }
    setCountdown(5);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (adminUser.trim() === 'admin' && adminPass === 'Admin@123456') {
      setIsAdminLoggedIn(true);
      setShowAdminModal(false);
      setLoginError('');
      setAdminPass('');
    } else {
      setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  const handleAddWorker = async (e) => {
    e.preventDefault();
    if (!newWorker.code || !newWorker.name) return;
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_worker', ...newWorker }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddWorkerModal(false);
        setNewWorker({
          code: '',
          name: '',
          department: 'خياطة',
          phone: '',
          wage_type: 'daily',
          base_rate: '150',
          overtime_rate: '25',
          shift_start: '08:00',
          shift_end: '17:00',
          grace_minutes: '15',
        });
        fetchData();
      }
    } catch (err) {
      alert('فشل إضافة العامل: ' + err.message);
    }
  };

  const handleDeleteWorker = async (id, name) => {
    if (confirm(`هل أنت متأكد من حذف العامل: ${name}؟`)) {
      try {
        await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete_worker', id }),
        });
        fetchData();
      } catch (err) {
        alert('فشل الحذف');
      }
    }
  };

  const handleAddTx = async (e) => {
    e.preventDefault();
    if (!newTx.worker_code || !newTx.amount) return;
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_transaction', ...newTx }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddTxModal(false);
        setNewTx({
          worker_id: '',
          worker_code: '',
          worker_name: '',
          type: 'advance',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          notes: '',
        });
        fetchData();
      }
    } catch (err) {
      alert('فشل تسجيل العملية');
    }
  };

  const handleAddManualAtt = async (e) => {
    e.preventDefault();
    if (!manualAtt.worker_code) return;
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'manual_attendance', ...manualAtt }),
      });
      const data = await res.json();
      if (data.success) {
        setShowManualAttModal(false);
        fetchData();
      } else {
        alert(data.message || 'فشل التسجيل');
      }
    } catch (err) {
      alert('خطأ في الاتصال');
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const res = await fetch('/api/data?action=backup');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DAHAB_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('فشل تصدير النسخة الاحتياطية');
    }
  };

  const handleExportPayrollExcel = () => {
    const headers = ['كود العامل', 'الاسم', 'القسم', 'نظام الأجر', 'أيام الحضور', 'ساعات العمل', 'ساعات الإضافي', 'الأجر الأساسي', 'قيمة الإضافي', 'المكافآت', 'الخصومات', 'السلف', 'صافي الراتب'];
    const rows = workers.map((w) => {
      const atts = attendance.filter((a) => a.worker_code === w.code);
      const daysWorked = atts.filter((a) => a.punch_in).length;
      const totalHours = atts.reduce((acc, curr) => acc + (parseFloat(curr.work_hours) || 0), 0);
      const overtimeHours = atts.reduce((acc, curr) => acc + (parseFloat(curr.overtime_hours) || 0), 0);

      const txs = transactions.filter((t) => t.worker_code === w.code);
      const advances = txs.filter((t) => t.type === 'advance').reduce((a, c) => a + (parseFloat(c.amount) || 0), 0);
      const deductions = txs.filter((t) => t.type === 'deduction').reduce((a, c) => a + (parseFloat(c.amount) || 0), 0);
      const bonuses = txs.filter((t) => t.type === 'bonus').reduce((a, c) => a + (parseFloat(c.amount) || 0), 0);

      let basePay = 0;
      if (w.wage_type === 'daily') basePay = daysWorked * parseFloat(w.base_rate || 0);
      else if (w.wage_type === 'hourly') basePay = totalHours * parseFloat(w.base_rate || 0);
      else basePay = parseFloat(w.base_rate || 0);

      const overtimePay = overtimeHours * parseFloat(w.overtime_rate || 0);
      const netPay = basePay + overtimePay + bonuses - deductions - advances;

      return [
        w.code,
        `"${w.name}"`,
        `"${w.department}"`,
        w.wage_type === 'daily' ? 'يومي' : 'بالساعة',
        daysWorked,
        totalHours.toFixed(1),
        overtimeHours.toFixed(1),
        basePay.toFixed(2),
        overtimePay.toFixed(2),
        bonuses.toFixed(2),
        deductions.toFixed(2),
        advances.toFixed(2),
        netPay.toFixed(2),
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DAHAB_Payroll_${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const presentCount = attendance.filter((a) => a.punch_in).length;
  const lateCount = attendance.filter((a) => a.late_minutes > 0).length;
  const totalAdvances = transactions.filter((t) => t.type === 'advance').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      <header className="bg-slate-900 border-b border-amber-500/20 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-black text-slate-950 text-2xl shadow-lg shadow-amber-500/20">
            D
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wider text-amber-400">DAHAB</h1>
            <p className="text-xs text-slate-400">نظام إدارة مصنع الملابس المتكامل</p>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-center">
          <span className="text-xl font-bold font-mono text-amber-300">{currentTime}</span>
          <span className="text-xs text-slate-400">{currentDate}</span>
        </div>

        <div>
          {isAdminLoggedIn ? (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full font-bold">
                الإدارة (admin)
              </span>
              <button
                onClick={() => setIsAdminLoggedIn(false)}
                className="text-xs bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg transition"
              >
                تسجيل الخروج
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAdminModal(true)}
              className="text-sm bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 px-4 py-2 rounded-xl transition flex items-center gap-2 shadow"
            >
              <span>🔒</span>
              <span>لوحة الإدارة</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 md:p-6 max-w-7xl mx-auto w-full">
        {!isAdminLoggedIn ? (
          <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full py-4">
            <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600"></div>

              <div className="text-center mb-6">
                <span className="text-xs font-semibold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  شاشة تسجيل الحضور والانصراف الذاتية
                </span>
                <div className="text-3xl font-black font-mono text-slate-100 mt-2">{currentTime || '..:..:..'}</div>
                <div className="text-xs text-slate-400 mt-1">{currentDate}</div>
              </div>

              {kioskStatus && (
                <div
                  className={`mb-6 p-4 rounded-2xl border transition-all ${
                    kioskStatus.type === 'success'
                      ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                      : kioskStatus.type === 'warning'
                      ? 'bg-amber-950/80 border-amber-500/40 text-amber-200'
                      : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{kioskStatus.type === 'success' ? '✅' : kioskStatus.type === 'warning' ? '⚠️' : '❌'}</span>
                      <div>
                        <h4 className="font-bold text-base">{kioskStatus.message}</h4>
                        {kioskStatus.details && <p className="text-xs opacity-90 mt-0.5">{kioskStatus.details}</p>}
                      </div>
                    </div>
                    <span className="text-xs font-mono bg-black/30 px-2 py-1 rounded-lg border border-white/10">
                      {countdown} ث
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center mb-6 shadow-inner">
                <span className="text-xs text-slate-500 block mb-1">أدخل كود العامل المكون من 4 أرقام</span>
                <div className="h-12 flex items-center justify-center">
                  {kioskCode ? (
                    <span className="text-4xl font-black tracking-widest font-mono text-amber-400">{kioskCode}</span>
                  ) : (
                    <span className="text-2xl text-slate-600 font-mono tracking-widest animate-pulse">_ _ _ _</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => handlePunch('in')}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 px-4 rounded-2xl shadow-lg shadow-emerald-900/30 text-lg flex items-center justify-center gap-2 active:scale-95 transition"
                >
                  <span className="text-2xl">🟢</span>
                  <span>تسجيل حضور</span>
                </button>
                <button
                  onClick={() => handlePunch('out')}
                  className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-4 px-4 rounded-2xl shadow-lg shadow-rose-900/30 text-lg flex items-center justify-center gap-2 active:scale-95 transition"
                >
                  <span className="text-2xl">🔴</span>
                  <span>تسجيل انصراف</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleKeypadPress(String(num))}
                    className="bg-slate-800 hover:bg-slate-700 active:bg-amber-600 text-slate-100 font-bold text-2xl py-4 rounded-2xl border border-slate-700/60 shadow active:scale-95 transition"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={handleKeypadClear}
                  className="bg-slate-800 hover:bg-rose-950/40 text-rose-400 font-bold text-lg py-4 rounded-2xl border border-slate-700/60 shadow active:scale-95 transition"
                >
                  مسح C
                </button>
                <button
                  onClick={() => handleKeypadPress('0')}
                  className="bg-slate-800 hover:bg-slate-700 active:bg-amber-600 text-slate-100 font-bold text-2xl py-4 rounded-2xl border border-slate-700/60 shadow active:scale-95 transition"
                >
                  0
                </button>
                <button
                  onClick={handleKeypadBackspace}
                  className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xl py-4 rounded-2xl border border-slate-700/60 shadow active:scale-95 transition flex items-center justify-center"
                >
                  ⌫
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
              {[
                { id: 'dashboard', label: '📊 لوحة المؤشرات' },
                { id: 'workers', label: '👥 العمال والأجور' },
                { id: 'attendance', label: '⏱️ سجل الحضور اليومي' },
                { id: 'finance', label: '💰 السلف والخصومات' },
                { id: 'payroll', label: '📑 مسير الرواتب' },
                { id: 'backup', label: '⚙️ النسخ الاحتياطي' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition ${
                    currentTab === tab.id
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {currentTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow">
                    <span className="text-xs text-slate-400">إجمالي العمال بالمنظومة</span>
                    <div className="text-3xl font-black text-amber-400 mt-2">{workers.length}</div>
                    <span className="text-xs text-emerald-400 mt-1 block">نشط بالمعمل</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow">
                    <span className="text-xs text-slate-400">الحضور اليوم</span>
                    <div className="text-3xl font-black text-emerald-400 mt-2">{presentCount}</div>
                    <span className="text-xs text-slate-500 mt-1 block">من إجمالي {workers.length}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow">
                    <span className="text-xs text-slate-400">المتأخرون اليوم</span>
                    <div className="text-3xl font-black text-rose-400 mt-2">{lateCount}</div>
                    <span className="text-xs text-rose-400/80 mt-1 block">تجاوزوا فترة السماح</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow">
                    <span className="text-xs text-slate-400">إجمالي السلف المسجلة</span>
                    <div className="text-3xl font-black text-yellow-400 mt-2">{totalAdvances.toLocaleString('ar-EG')} ج.م</div>
                    <span className="text-xs text-slate-500 mt-1 block">سلف معلقة للخصم</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-slate-200">سجل البصمات المسجلة اليوم ({selectedDate})</h3>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300"
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                      <thead className="text-xs text-slate-400 bg-slate-950/60 border-b border-slate-800">
                        <tr>
                          <th className="p-3">الكود</th>
                          <th className="p-3">اسم العامل</th>
                          <th className="p-3">وقت الحضور</th>
                          <th className="p-3">وقت الانصراف</th>
                          <th className="p-3">التأخير</th>
                          <th className="p-3">ساعات العمل</th>
                          <th className="p-3">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {attendance.length > 0 ? (
                          attendance.map((att) => (
                            <tr key={att.id} className="hover:bg-slate-800/30">
                              <td className="p-3 font-mono text-amber-400">{att.worker_code}</td>
                              <td className="p-3 font-bold">{att.worker_name}</td>
                              <td className="p-3 text-slate-300">
                                {att.punch_in ? new Date(att.punch_in).toLocaleTimeString('ar-EG') : '-'}
                              </td>
                              <td className="p-3 text-slate-300">
                                {att.punch_out ? new Date(att.punch_out).toLocaleTimeString('ar-EG') : '-'}
                              </td>
                              <td className="p-3">
                                {att.late_minutes > 0 ? (
                                  <span className="text-rose-400 font-bold">{att.late_minutes} دقيقة</span>
                                ) : (
                                  <span className="text-emerald-400">في الموعد</span>
                                )}
                              </td>
                              <td className="p-3 font-mono">{att.work_hours || '0'} س</td>
                              <td className="p-3">
                                <span className={`text-xs px-2.5 py-1 rounded-full border ${
                                  att.punch_out
                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                }`}>
                                  {att.punch_out ? 'انصرف' : 'حاضر الآن'}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-500">
                              لا توجد تسجيلات حضور لهذا التاريخ حتى الآن
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'workers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-200">قائمة العمال المسجلين بالمعمل</h3>
                  <button
                    onClick={() => setShowAddWorkerModal(true)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm transition flex items-center gap-2"
                  >
                    <span>➕</span>
                    <span>إضافة عامل جديد</span>
                  </button>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                      <thead className="text-xs text-slate-400 bg-slate-950 border-b border-slate-800">
                        <tr>
                          <th className="p-3.5">الكود</th>
                          <th className="p-3.5">اسم العامل</th>
                          <th className="p-3.5">القسم</th>
                          <th className="p-3.5">الهاتف</th>
                          <th className="p-3.5">نظام الأجر</th>
                          <th className="p-3.5">الأجر الأساسي</th>
                          <th className="p-3.5">أجر الإضافي / س</th>
                          <th className="p-3.5">الوردية</th>
                          <th className="p-3.5">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {workers.map((w) => (
                          <tr key={w.id} className="hover:bg-slate-800/40">
                            <td className="p-3.5 font-mono text-amber-400 font-bold">{w.code}</td>
                            <td className="p-3.5 font-bold">{w.name}</td>
                            <td className="p-3.5 text-slate-300">{w.department}</td>
                            <td className="p-3.5 font-mono text-slate-400">{w.phone || '-'}</td>
                            <td className="p-3.5">
                              <span className="text-xs bg-slate-800 px-2.5 py-1 rounded-md text-amber-300 border border-amber-500/20">
                                {w.wage_type === 'daily' ? 'يومي' : 'بالساعة'}
                              </span>
                            </td>
                            <td className="p-3.5 font-mono text-emerald-400">{w.base_rate} ج.م</td>
                            <td className="p-3.5 font-mono text-cyan-400">{w.overtime_rate} ج.م</td>
                            <td className="p-3.5 text-xs text-slate-400 font-mono">
                              {w.shift_start} - {w.shift_end}
                            </td>
                            <td className="p-3.5">
                              <button
                                onClick={() => handleDeleteWorker(w.id, w.name)}
                                className="text-xs bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 px-3 py-1 rounded-lg transition"
                              >
                                حذف
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'attendance' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-slate-200">سجل الحضور والانصراف</h3>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200"
                    />
                  </div>
                  <button
                    onClick={() => setShowManualAttModal(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 px-4 py-2 rounded-xl text-sm transition"
                  >
                    ✏️ تسجيل حضور/انصراف يدوي
                  </button>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                      <thead className="text-xs text-slate-400 bg-slate-950 border-b border-slate-800">
                        <tr>
                          <th className="p-3.5">الكود</th>
                          <th className="p-3.5">العامل</th>
                          <th className="p-3.5">الحضور</th>
                          <th className="p-3.5">الانصراف</th>
                          <th className="p-3.5">التأخير</th>
                          <th className="p-3.5">ساعات العمل</th>
                          <th className="p-3.5">الساعات الإضافية</th>
                          <th className="p-3.5">الحالة / ملاحظات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {attendance.length > 0 ? (
                          attendance.map((att) => (
                            <tr key={att.id} className="hover:bg-slate-800/40">
                              <td className="p-3.5 font-mono text-amber-400 font-bold">{att.worker_code}</td>
                              <td className="p-3.5 font-bold">{att.worker_name}</td>
                              <td className="p-3.5 font-mono">
                                {att.punch_in ? new Date(att.punch_in).toLocaleTimeString('ar-EG') : 'لم يسجل'}
                              </td>
                              <td className="p-3.5 font-mono">
                                {att.punch_out ? new Date(att.punch_out).toLocaleTimeString('ar-EG') : 'لم يسجل'}
                              </td>
                              <td className="p-3.5">
                                {att.late_minutes > 0 ? (
                                  <span className="text-rose-400 font-bold font-mono">{att.late_minutes} د</span>
                                ) : (
                                  <span className="text-emerald-400 text-xs">0</span>
                                )}
                              </td>
                              <td className="p-3.5 font-mono">{att.work_hours || '0'} س</td>
                              <td className="p-3.5 font-mono text-amber-300">{att.overtime_hours || '0'} س</td>
                              <td className="p-3.5 text-xs text-slate-400">{att.notes || att.status}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-slate-500">
                              لا توجد سجلات لهذا التاريخ
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'finance' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-200">سجل السلف والخصومات والمكافآت</h3>
                  <button
                    onClick={() => setShowAddTxModal(true)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm transition flex items-center gap-2"
                  >
                    <span>➕</span>
                    <span>تسجيل معاملة مالية (سلفة / خصم / مكافأة)</span>
                  </button>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                      <thead className="text-xs text-slate-400 bg-slate-950 border-b border-slate-800">
                        <tr>
                          <th className="p-3.5">التاريخ</th>
                          <th className="p-3.5">كود العامل</th>
                          <th className="p-3.5">اسم العامل</th>
                          <th className="p-3.5">نوع العملية</th>
                          <th className="p-3.5">المبلغ</th>
                          <th className="p-3.5">البيان / السبب</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {transactions.length > 0 ? (
                          transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-800/40">
                              <td className="p-3.5 font-mono text-slate-400">{tx.date}</td>
                              <td className="p-3.5 font-mono text-amber-400 font-bold">{tx.worker_code}</td>
                              <td className="p-3.5 font-bold">{tx.worker_name}</td>
                              <td className="p-3.5">
                                <span
                                  className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                                    tx.type === 'advance'
                                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                      : tx.type === 'deduction'
                                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  }`}
                                >
                                  {tx.type === 'advance' ? 'سلفة نقدية' : tx.type === 'deduction' ? 'خصم / جزاء' : 'مكافأة إنتاج'}
                                </span>
                              </td>
                              <td className="p-3.5 font-mono font-bold text-base">
                                {parseFloat(tx.amount).toLocaleString('ar-EG')} ج.م
                              </td>
                              <td className="p-3.5 text-xs text-slate-300">{tx.notes || '-'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-500">
                              لا توجد عمليات مالية مسجلة
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'payroll' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-slate-200">مسير الرواتب والمستحقات</h3>
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportPayrollExcel}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition flex items-center gap-2 shadow"
                    >
                      <span>📊</span>
                      <span>تصدير Excel (معتمد)</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm transition flex items-center gap-2 border border-slate-700"
                    >
                      <span>🖨️</span>
                      <span>طباعة</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                      <thead className="text-xs text-slate-400 bg-slate-950 border-b border-slate-800">
                        <tr>
                          <th className="p-3.5">الكود</th>
                          <th className="p-3.5">اسم العامل</th>
                          <th className="p-3.5">القسم</th>
                          <th className="p-3.5">نظام الأجر</th>
                          <th className="p-3.5">أيام الحضور</th>
                          <th className="p-3.5">ساعات العمل</th>
                          <th className="p-3.5">الإضافي</th>
                          <th className="p-3.5">الأساسي</th>
                          <th className="p-3.5">أجر الإضافي</th>
                          <th className="p-3.5">مكافآت</th>
                          <th className="p-3.5">خصومات</th>
                          <th className="p-3.5">سلف</th>
                          <th className="p-3.5 text-amber-400">صافي المستحق</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {workers.map((w) => {
                          const atts = attendance.filter((a) => a.worker_code === w.code);
                          const daysWorked = atts.filter((a) => a.punch_in).length;
                          const totalHours = atts.reduce((acc, curr) => acc + (parseFloat(curr.work_hours) || 0), 0);
                          const overtimeHours = atts.reduce((acc, curr) => acc + (parseFloat(curr.overtime_hours) || 0), 0);

                          const txs = transactions.filter((t) => t.worker_code === w.code);
                          const advances = txs.filter((t) => t.type === 'advance').reduce((a, c) => a + (parseFloat(c.amount) || 0), 0);
                          const deductions = txs.filter((t) => t.type === 'deduction').reduce((a, c) => a + (parseFloat(c.amount) || 0), 0);
                          const bonuses = txs.filter((t) => t.type === 'bonus').reduce((a, c) => a + (parseFloat(c.amount) || 0), 0);

                          let basePay = 0;
                          if (w.wage_type === 'daily') basePay = daysWorked * parseFloat(w.base_rate || 0);
                          else if (w.wage_type === 'hourly') basePay = totalHours * parseFloat(w.base_rate || 0);
                          else basePay = parseFloat(w.base_rate || 0);

                          const overtimePay = overtimeHours * parseFloat(w.overtime_rate || 0);
                          const netPay = basePay + overtimePay + bonuses - deductions - advances;

                          return (
                            <tr key={w.id} className="hover:bg-slate-800/40">
                              <td className="p-3.5 text-amber-400 font-bold">{w.code}</td>
                              <td className="p-3.5 font-sans font-bold text-slate-100">{w.name}</td>
                              <td className="p-3.5 font-sans text-xs text-slate-300">{w.department}</td>
                              <td className="p-3.5 font-sans text-xs">{w.wage_type === 'daily' ? 'يومي' : 'بالساعة'}</td>
                              <td className="p-3.5">{daysWorked}</td>
                              <td className="p-3.5">{totalHours.toFixed(1)}</td>
                              <td className="p-3.5 text-amber-300">{overtimeHours.toFixed(1)}</td>
                              <td className="p-3.5">{basePay.toFixed(2)}</td>
                              <td className="p-3.5 text-cyan-300">{overtimePay.toFixed(2)}</td>
                              <td className="p-3.5 text-emerald-400">+{bonuses.toFixed(2)}</td>
                              <td className="p-3.5 text-rose-400">-{deductions.toFixed(2)}</td>
                              <td className="p-3.5 text-yellow-400">-{advances.toFixed(2)}</td>
                              <td className="p-3.5 font-bold text-base text-amber-400 bg-amber-500/5">
                                {netPay.toFixed(2)} ج.م
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'backup' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow space-y-4">
                  <h3 className="font-bold text-lg text-amber-400 flex items-center gap-2">
                    <span>💾</span>
                    <span>النسخ الاحتياطي الكامل لقاعدة البيانات</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    يمكنك تحميل نسخة احتياطية كاملة من بيانات المنظومة بتنسيق JSON آمن للحفظ على فلاشة أو كمبيوتر.
                  </p>
                  <button
                    onClick={handleDownloadBackup}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                  >
                    <span>⬇️</span>
                    <span>تحميل نسخة احتياطية فورية (JSON)</span>
                  </button>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow space-y-4">
                  <h3 className="font-bold text-lg text-slate-200 flex items-center gap-2">
                    <span>ℹ️</span>
                    <span>معلومات النظام والاتصال</span>
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">اسم النظام:</span>
                      <span className="font-bold text-amber-400">DAHAB Factory System</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">قاعدة البيانات:</span>
                      <span className="font-mono text-emerald-400">Neon Cloud PostgreSQL</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">الاستضافة السحابية:</span>
                      <span className="text-slate-200">Vercel Edge Network</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-400">حالة الربط:</span>
                      <span className="text-emerald-400 font-bold">🟢 متصل ومفعل</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {showAdminModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => setShowAdminModal(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-white text-lg"
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <span className="text-3xl">🔒</span>
              <h3 className="font-black text-xl text-slate-100 mt-2">تسجيل دخول الإدارة</h3>
              <p className="text-xs text-slate-400 mt-1">الوصول للتقارير والعمال والرواتب</p>
            </div>

            {loginError && (
              <div className="mb-4 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs p-3 rounded-xl text-center">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">اسم المستخدم</label>
                <input
                  type="text"
                  required
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-amber-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">كلمة المرور</label>
                <input
                  type="password"
                  required
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-amber-500 font-mono text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl transition text-sm shadow-lg shadow-amber-500/20"
              >
                دخول
              </button>
            </form>
          </div>
        </div>
      )}

      {showAddWorkerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddWorkerModal(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-white text-lg"
            >
              ✕
            </button>
            <h3 className="font-bold text-lg text-amber-400 mb-4">إضافة عامل جديد لمنظومة DAHAB</h3>
            <form onSubmit={handleAddWorker} className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-slate-400 block mb-1">كود العامل (4 أرقام)*</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 1004"
                  value={newWorker.code}
                  onChange={(e) => setNewWorker({ ...newWorker, code: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">اسم العامل الرباعي*</label>
                <input
                  type="text"
                  required
                  placeholder="اسم العامل"
                  value={newWorker.name}
                  onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">القسم</label>
                  <select
                    value={newWorker.department}
                    onChange={(e) => setNewWorker({ ...newWorker, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="خياطة">خياطة</option>
                    <option value="قص">قص</option>
                    <option value="تشطيب وجودة">تشطيب وجودة</option>
                    <option value="مكواة وتعبئة">مكواة وتعبئة</option>
                    <option value="صيانة">صيانة</option>
                    <option value="إدارة">إدارة</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={newWorker.phone}
                    onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">نظام الأجر</label>
                  <select
                    value={newWorker.wage_type}
                    onChange={(e) => setNewWorker({ ...newWorker, wage_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="daily">أجر يومي</option>
                    <option value="hourly">أجر بالساعة</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">الأجر الأساسي (ج.م)</label>
                  <input
                    type="number"
                    required
                    value={newWorker.base_rate}
                    onChange={(e) => setNewWorker({ ...newWorker, base_rate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">أجر الإضافي/س</label>
                  <input
                    type="number"
                    value={newWorker.overtime_rate}
                    onChange={(e) => setNewWorker({ ...newWorker, overtime_rate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-slate-100 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">حضور الوردية</label>
                  <input
                    type="time"
                    value={newWorker.shift_start}
                    onChange={(e) => setNewWorker({ ...newWorker, shift_start: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">انصراف الوردية</label>
                  <input
                    type="time"
                    value={newWorker.shift_end}
                    onChange={(e) => setNewWorker({ ...newWorker, shift_end: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-slate-100 text-xs"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl transition mt-4"
              >
                حفظ العامل بالمنظومة
              </button>
            </form>
          </div>
        </div>
      )}

      {showAddTxModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => setShowAddTxModal(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-white text-lg"
            >
              ✕
            </button>
            <h3 className="font-bold text-lg text-amber-400 mb-4">تسجيل معاملة مالية</h3>
            <form onSubmit={handleAddTx} className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-slate-400 block mb-1">اختر العامل*</label>
                <select
                  required
                  value={newTx.worker_code}
                  onChange={(e) => {
                    const sel = workers.find((w) => w.code === e.target.value);
                    if (sel) {
                      setNewTx({
                        ...newTx,
                        worker_code: sel.code,
                        worker_id: sel.id,
                        worker_name: sel.name,
                      });
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="">-- اختر العامل --</option>
                  {workers.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.code} - {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">نوع المعاملة</label>
                <select
                  value={newTx.type}
                  onChange={(e) => setNewTx({ ...newTx, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="advance">سلفة نقدية</option>
                  <option value="deduction">خصم / جزاء</option>
                  <option value="bonus">مكافأة إنتاج</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">المبلغ (ج.م)*</label>
                <input
                  type="number"
                  required
                  value={newTx.amount}
                  onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">ملاحظات / السبب</label>
                <input
                  type="text"
                  placeholder="سبب السلفة أو الخصم"
                  value={newTx.notes}
                  onChange={(e) => setNewTx({ ...newTx, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl transition mt-4"
              >
                تأكيد وتسجيل
              </button>
            </form>
          </div>
        </div>
      )}

      {showManualAttModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => setShowManualAttModal(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-white text-lg"
            >
              ✕
            </button>
            <h3 className="font-bold text-lg text-amber-400 mb-4">تسجيل بصمة يدوية</h3>
            <form onSubmit={handleAddManualAtt} className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-slate-400 block mb-1">العامل*</label>
                <select
                  required
                  value={manualAtt.worker_code}
                  onChange={(e) => setManualAtt({ ...manualAtt, worker_code: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="">-- اختر العامل --</option>
                  {workers.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.code} - {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">التاريخ</label>
                <input
                  type="date"
                  value={manualAtt.date}
                  onChange={(e) => setManualAtt({ ...manualAtt, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">وقت الحضور</label>
                  <input
                    type="time"
                    value={manualAtt.punch_in}
                    onChange={(e) => setManualAtt({ ...manualAtt, punch_in: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">وقت الانصراف</label>
                  <input
                    type="time"
                    value={manualAtt.punch_out}
                    onChange={(e) => setManualAtt({ ...manualAtt, punch_out: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl transition mt-4"
              >
                حفظ التسجيل اليدوي
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
