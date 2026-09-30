"use client";

import React, { useState, useEffect } from 'react';

export default function Page() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [tab, setTab] = useState('dashboard');

  const [code, setCode] = useState('');
  const [alert, setAlert] = useState(null);
  const [timer, setTimer] = useState(0);
  const [clock, setClock] = useState('..:..:..');
  const [dateStr, setDateStr] = useState('');

  const [workers, setWorkers] = useState([
    { code: '1001', name: 'فاطمة محمود', dept: 'خياطة', rate: 150 },
    { code: '1002', name: 'أحمد إبراهيم', dept: 'قص', rate: 180 },
    { code: '1003', name: 'مريم عبد الله', dept: 'تشطيب', rate: 160 }
  ]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('ar-EG'));
      setDateStr(now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    } else if (timer === 0 && alert) {
      setAlert(null);
      setCode('');
    }
  }, [timer, alert]);

  const handlePunch = (type) => {
    if (!code) {
      setAlert({ ok: false, msg: 'اكتب كود العامل أولاً' });
      setTimer(3);
      return;
    }
    const w = workers.find(x => x.code === code);
    const timeNow = new Date().toLocaleTimeString('ar-EG');
    if (w) {
      if (type === 'in') {
        setAttendance(prev => [{ code: w.code, name: w.name, inTime: timeNow, outTime: '-' }, ...prev]);
        setAlert({ ok: true, msg: `تم تسجيل حضور: ${w.name}`, sub: `الوقت: ${timeNow}` });
      } else {
        setAttendance(prev => prev.map(a => a.code === w.code ? { ...a, outTime: timeNow } : a));
        setAlert({ ok: true, msg: `تم تسجيل انصراف: ${w.name}`, sub: `الوقت: ${timeNow}` });
      }
    } else {
      setAlert({ ok: false, msg: 'كود العامل غير مسجل بالمنظومة' });
    }
    setTimer(4);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (user.trim() === 'admin' && pass === 'Admin@123456') {
      setIsAdmin(true);
      setShowLogin(false);
      setErr('');
    } else {
      setErr('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'sans-serif', padding: '16px', direction: 'rtl' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', padding: '12px 20px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: '#f59e0b', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: '900', fontSize: '24px' }}>D</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#fbbf24', letterSpacing: '1px' }}>DAHAB</h1>
            <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>نظام إدارة مصنع الملابس المتكامل</p>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fef08a', fontFamily: 'monospace' }}>{clock}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{dateStr}</div>
        </div>
        <div>
          {isAdmin ? (
            <button onClick={() => setIsAdmin(false)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>تسجيل الخروج</button>
          ) : (
            <button onClick={() => setShowLogin(true)} style={{ backgroundColor: '#334155', color: '#fbbf24', border: '1px solid #f59e0b', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>🔒 دخول الإدارة</button>
          )}
        </div>
      </div>

      {/* Body */}
      {!isAdmin ? (
        <div style={{ maxWidth: '450px', margin: '0 auto', backgroundColor: '#1e293b', borderRadius: '24px', padding: '24px', border: '1px solid #334155', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)', padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>شاشة تسجيل الحضور والانصراف</span>
          </div>

          {alert && (
            <div style={{ padding: '12px', borderRadius: '12px', marginBottom: '16px', textAlign: 'center', backgroundColor: alert.ok ? '#064e3b' : '#881337', color: '#fff', border: alert.ok ? '1px solid #059669' : '1px solid #e11d48' }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{alert.msg}</div>
              {alert.sub && <div style={{ fontSize: '12px', marginTop: '4px' }}>{alert.sub}</div>}
            </div>
          )}

          {/* Screen Display */}
          <div style={{ backgroundColor: '#020617', padding: '16px', borderRadius: '16px', textAlign: 'center', marginBottom: '20px', border: '1px solid #1e293b' }}>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>أدخل كود العامل (مثال: 1001)</span>
            <span style={{ fontSize: '36px', fontWeight: '900', color: '#fbbf24', letterSpacing: '4px', fontFamily: 'monospace' }}>{code || '_ _ _ _'}</span>
          </div>

          {/* Punch Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <button onClick={() => handlePunch('in')} style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '16px', borderRadius: '16px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>🟢 تسجيل حضور</button>
            <button onClick={() => handlePunch('out')} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '16px', borderRadius: '16px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>🔴 تسجيل انصراف</button>
          </div>

          {/* Keypad */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button key={n} onClick={() => code.length < 8 && setCode(prev => prev + n)} style={{ backgroundColor: '#334155', color: '#fff', border: '1px solid #475569', padding: '16px', borderRadius: '14px', fontSize: '24px', fontWeight: 'bold', cursor: 'pointer' }}>{n}</button>
            ))}
            <button onClick={() => setCode('')} style={{ backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #7f1d1d', padding: '16px', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>مسح C</button>
            <button onClick={() => code.length < 8 && setCode(prev => prev + '0')} style={{ backgroundColor: '#334155', color: '#fff', border: '1px solid #475569', padding: '16px', borderRadius: '14px', fontSize: '24px', fontWeight: 'bold', cursor: 'pointer' }}>0</button>
            <button onClick={() => setCode(prev => prev.slice(0, -1))} style={{ backgroundColor: '#334155', color: '#fbbf24', border: '1px solid #475569', padding: '16px', borderRadius: '14px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}>⌫</button>
          </div>
        </div>
      ) : (
        /* ADMIN SUITE */
        <div style={{ backgroundColor: '#1e293b', borderRadius: '24px', padding: '24px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
            {['dashboard', 'workers', 'payroll'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ backgroundColor: tab === t ? '#f59e0b' : '#334155', color: tab === t ? '#000' : '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                {t === 'dashboard' ? '📊 سجل الحضور' : t === 'workers' ? '👥 العمال والأجور' : '📑 مسير الرواتب'}
              </button>
            ))}
          </div>

          {tab === 'dashboard' && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', color: '#fbbf24' }}>سجل الحضور والانصراف المسجل اليوم</h3>
              <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '13px' }}>
                    <th style={{ padding: '8px' }}>الكود</th>
                    <th style={{ padding: '8px' }}>اسم العامل</th>
                    <th style={{ padding: '8px' }}>وقت الحضور</th>
                    <th style={{ padding: '8px' }}>وقت الانصراف</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length ? attendance.map((a, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '8px', color: '#fbbf24', fontWeight: 'bold' }}>{a.code}</td>
                      <td style={{ padding: '8px' }}>{a.name}</td>
                      <td style={{ padding: '8px', color: '#34d399' }}>{a.inTime}</td>
                      <td style={{ padding: '8px', color: '#f87171' }}>{a.outTime}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>لا توجد بصمات مسجلة اليوم</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'workers' && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', color: '#fbbf24' }}>قائمة عمال المصنع</h3>
              <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '13px' }}>
                    <th style={{ padding: '8px' }}>الكود</th>
                    <th style={{ padding: '8px' }}>اسم العامل</th>
                    <th style={{ padding: '8px' }}>القسم</th>
                    <th style={{ padding: '8px' }}>الأجر الأساسي</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map(w => (
                    <tr key={w.code} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '8px', color: '#fbbf24', fontWeight: 'bold' }}>{w.code}</td>
                      <td style={{ padding: '8px' }}>{w.name}</td>
                      <td style={{ padding: '8px' }}>{w.dept}</td>
                      <td style={{ padding: '8px', color: '#34d399' }}>{w.rate} ج.م</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'payroll' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#fbbf24' }}>كشف الرواتب والمستحقات</h3>
                <button onClick={() => window.print()} style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ طباعة الكشف</button>
              </div>
              <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '13px' }}>
                    <th style={{ padding: '8px' }}>الكود</th>
                    <th style={{ padding: '8px' }}>العامل</th>
                    <th style={{ padding: '8px' }}>القسم</th>
                    <th style={{ padding: '8px' }}>الأجر المستحق</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map(w => (
                    <tr key={w.code} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '8px', color: '#fbbf24', fontWeight: 'bold' }}>{w.code}</td>
                      <td style={{ padding: '8px' }}>{w.name}</td>
                      <td style={{ padding: '8px' }}>{w.dept}</td>
                      <td style={{ padding: '8px', color: '#fbbf24', fontWeight: 'bold' }}>{w.rate} ج.م</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#1e293b', borderRadius: '20px', padding: '24px', maxWidth: '320px', width: '100%', border: '1px solid #334155', position: 'relative' }}>
            <button onClick={() => setShowLogin(false)} style={{ position: 'absolute', top: '12px', left: '12px', background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            <h3 style={{ margin: '0 0 16px 0', textAlign: 'center', color: '#fff' }}>دخول الإدارة</h3>
            {err && <div style={{ color: '#f87171', fontSize: '12px', textAlign: 'center', marginBottom: '12px' }}>{err}</div>}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="admin" required value={user} onChange={e => setUser(e.target.value)} style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '12px', borderRadius: '10px' }} />
              <input type="password" placeholder="••••••••" required value={pass} onChange={e => setPass(e.target.value)} style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '12px', borderRadius: '10px' }} />
              <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>دخول</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
