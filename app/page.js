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
      setAlert({ ok: false, msg: 'يرجى كتابة كود العامل أولاً' });
      setTimer(3);
      return;
    }
    const w = workers.find(x => x.code === code);
    const timeNow = new Date().toLocaleTimeString('ar-EG');
    if (w) {
      if (type === 'in') {
        setAttendance(prev => [{ code: w.code, name: w.name, inTime: timeNow, outTime: '-' }, ...prev]);
        setAlert({ ok: true, msg: `تم تسجيل حضور: ${w.name}`, sub: `الساعة ${timeNow}` });
      } else {
        setAttendance(prev => prev.map(a => a.code === w.code ? { ...a, outTime: timeNow } : a));
        setAlert({ ok: true, msg: `تم تسجيل انصراف: ${w.name}`, sub: `الساعة ${timeNow}` });
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
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#ffffff', fontFamily: 'Arial, sans-serif', padding: '16px', direction: 'rtl', boxSizing: 'border-box' }}>
      {/* الشريط العلوي */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', padding: '14px 20px', borderRadius: '16px', marginBottom: '20px', border: '2px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', backgroundColor: '#f59e0b', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold', fontSize: '24px' }}>D</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#fbbf24', letterSpacing: '1px' }}>DAHAB</h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>نظام إدارة مصنع الملابس المتكامل</p>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#fef08a' }}>{clock || '..:..:..'}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{dateStr}</div>
        </div>
        <div>
          {isAdmin ? (
            <button onClick={() => setIsAdmin(false)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>خروج</button>
          ) : (
            <button onClick={() => setShowLogin(true)} style={{ backgroundColor: '#334155', color: '#fbbf24', border: '2px solid #f59e0b', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>🔒 دخول الإدارة</button>
          )}
        </div>
      </div>

      {/* شاشة تسجيل الحضور للعمال */}
      {!isAdmin ? (
        <div style={{ maxWidth: '440px', margin: '0 auto', backgroundColor: '#1e293b', borderRadius: '24px', padding: '24px', border: '2px solid #334155', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span style={{ backgroundColor: '#334155', color: '#fbbf24', border: '1px solid #f59e0b', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
              شاشة تسجيل الحضور والانصراف باللمس
            </span>
          </div>

          {alert && (
            <div style={{ padding: '14px', borderRadius: '12px', marginBottom: '16px', textAlign: 'center', backgroundColor: alert.ok ? '#065f46' : '#991b1b', color: '#ffffff', border: alert.ok ? '2px solid #10b981' : '2px solid #ef4444' }}>
              <div style={{ fontWeight: 'bold', fontSize: '17px' }}>{alert.msg}</div>
              {alert.sub && <div style={{ fontSize: '13px', marginTop: '4px', opacity: 0.9 }}>{alert.sub}</div>}
              <div style={{ fontSize: '11px', marginTop: '6px', opacity: 0.7 }}>سيتم الإغلاق خلال {timer} ثواني</div>
            </div>
          )}

          {/* شاشة عرض الكود */}
          <div style={{ backgroundColor: '#020617', padding: '16px', borderRadius: '16px', textAlign: 'center', marginBottom: '18px', border: '2px solid #475569' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>أدخل كود العامل (مثال: 1001)</span>
            <span style={{ fontSize: '38px', fontWeight: 'bold', color: '#fbbf24', letterSpacing: '6px' }}>{code || '_ _ _ _'}</span>
          </div>

          {/* أزرار الحضور والانصراف */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
            <button onClick={() => handlePunch('in')} style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '16px', borderRadius: '14px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(16,185,129,0.3)' }}>🟢 حضور</button>
            <button onClick={() => handlePunch('out')} style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '16px', borderRadius: '14px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(239,68,68,0.3)' }}>🔴 انصراف</button>
          </div>

          {/* أزرار الأرقام باللمس */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button key={n} onClick={() => code.length < 8 && setCode(prev => prev + n)} style={{ backgroundColor: '#334155', color: '#ffffff', border: '2px solid #475569', padding: '16px', borderRadius: '12px', fontSize: '24px', fontWeight: 'bold', cursor: 'pointer' }}>{n}</button>
            ))}
            <button onClick={() => setCode('')} style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', border: '2px solid #991b1b', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>مسح C</button>
            <button onClick={() => code.length < 8 && setCode(prev => prev + '0')} style={{ backgroundColor: '#334155', color: '#ffffff', border: '2px solid #475569', padding: '16px', borderRadius: '12px', fontSize: '24px', fontWeight: 'bold', cursor: 'pointer' }}>0</button>
            <button onClick={() => setCode(prev => prev.slice(0, -1))} style={{ backgroundColor: '#334155', color: '#fbbf24', border: '2px solid #475569', padding: '16px', borderRadius: '12px', fontSize: '22px', fontWeight: 'bold', cursor: 'pointer' }}>⌫</button>
          </div>
        </div>
      ) : (
        /* لوحة تحكم الإدارة */
        <div style={{ backgroundColor: '#1e293b', borderRadius: '20px', padding: '20px', border: '2px solid #334155' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <button onClick={() => setTab('dashboard')} style={{ backgroundColor: tab === 'dashboard' ? '#f59e0b' : '#334155', color: tab === 'dashboard' ? '#000' : '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>📊 سجل اليوم</button>
            <button onClick={() => setTab('workers')} style={{ backgroundColor: tab === 'workers' ? '#f59e0b' : '#334155', color: tab === 'workers' ? '#000' : '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>👥 العمال</button>
          </div>

          {tab === 'dashboard' && (
            <div>
              <h3 style={{ color: '#fbbf24', marginTop: 0 }}>سجل بصمات اليوم</h3>
              <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #475569', color: '#94a3b8' }}>
                    <th style={{ padding: '8px' }}>الكود</th>
                    <th style={{ padding: '8px' }}>اسم العامل</th>
                    <th style={{ padding: '8px' }}>وقت الحضور</th>
                    <th style={{ padding: '8px' }}>وقت الانصراف</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length ? attendance.map((a, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '10px', color: '#fbbf24', fontWeight: 'bold' }}>{a.code}</td>
                      <td style={{ padding: '10px' }}>{a.name}</td>
                      <td style={{ padding: '10px', color: '#10b981' }}>{a.inTime}</td>
                      <td style={{ padding: '10px', color: '#ef4444' }}>{a.outTime}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>لا توجد بصمات مسجلة بعد</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'workers' && (
            <div>
              <h3 style={{ color: '#fbbf24', marginTop: 0 }}>قائمة عمال المصنع</h3>
              <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #475569', color: '#94a3b8' }}>
                    <th style={{ padding: '8px' }}>الكود</th>
                    <th style={{ padding: '8px' }}>الاسم</th>
                    <th style={{ padding: '8px' }}>القسم</th>
                    <th style={{ padding: '8px' }}>الأجر اليومي</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map(w => (
                    <tr key={w.code} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '10px', color: '#fbbf24', fontWeight: 'bold' }}>{w.code}</td>
                      <td style={{ padding: '10px' }}>{w.name}</td>
                      <td style={{ padding: '10px' }}>{w.dept}</td>
                      <td style={{ padding: '10px', color: '#10b981' }}>{w.rate} ج.م</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* نافذة تسجيل الدخول */}
      {showLogin && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#1e293b', borderRadius: '20px', padding: '24px', maxWidth: '320px', width: '100%', border: '2px solid #334155', position: 'relative' }}>
            <button onClick={() => setShowLogin(false)} style={{ position: 'absolute', top: '12px', left: '12px', background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            <h3 style={{ margin: '0 0 16px 0', textAlign: 'center', color: '#fff' }}>تسجيل دخول الإدارة</h3>
            {err && <div style={{ color: '#f87171', fontSize: '12px', textAlign: 'center', marginBottom: '10px' }}>{err}</div>}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="admin" required value={user} onChange={e => setUser(e.target.value)} style={{ backgroundColor: '#0f172a', border: '1px solid #475569', color: '#fff', padding: '12px', borderRadius: '10px', fontSize: '14px' }} />
              <input type="password" placeholder="••••••••" required value={pass} onChange={e => setPass(e.target.value)} style={{ backgroundColor: '#0f172a', border: '1px solid #475569', color: '#fff', padding: '12px', borderRadius: '10px', fontSize: '14px' }} />
              <button type="submit" style={{ backgroundColor: '#f59e0b', color: '#000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>دخول</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
          }
