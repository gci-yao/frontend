import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts';

import { Link } from 'react-router-dom';

export default function SuperHistory() {
  const token = localStorage.getItem('gh_token');

  const [sessions, setSessions] = useState([]);
  const [routers, setRouters] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minLoadingDone, setMinLoadingDone] = useState(false);
  const [activeTab, setActiveTab] = useState('sessions');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');



  useEffect(() => {
      const timer = setTimeout(() => {
        setMinLoadingDone(true);
      }, 3000); // ⏱️ 3 secondes
    
      return () => clearTimeout(timer);
    }, []);
    


  /** 🔹 Load all data **/
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [s, r, p] = await Promise.all([
          api.getSessions({ token }),
          api.getRouters({ token }),
          api.getPayments({ token }),
        ]);
        setSessions(s || []);
        setRouters(r || []);
        setPayments(p || []);
      } catch (err) {
        console.error('Error loading history:', err);
        setSessions([]);
        setRouters([]);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  /** 🔹 Update remaining hours every minute **/
  useEffect(() => {
    const interval = setInterval(() => {
      setSessions(prev =>
        prev.map(s => {
          if (!s.ended) {
            const remaining = Math.max(0, (new Date(s.end_time) - Date.now()) / 3600000);
            return { ...s, remainingHours: remaining };
          }
          return s;
        })
      );
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  /** 🔹 Filter functions **/
  const filterData = (data, type) => {
    const q = search.toLowerCase();
    switch(type) {
      case 'sessions':
        return data.filter(s =>
          s.phone?.toLowerCase().includes(q) ||
          s.mac?.toLowerCase().includes(q) ||
          s.router?.name?.toLowerCase().includes(q)
        );
      case 'routers':
        return data.filter(r =>
          r.name?.toLowerCase().includes(q) ||
          r.ip?.toLowerCase().includes(q) ||
          r.location?.toLowerCase().includes(q)
        );
      case 'payments':
        return data.filter(p => {
          const matchesText = 
            p.phone?.toLowerCase().includes(q) ||
            p.router?.name?.toLowerCase().includes(q) ||
            p.plan?.toLowerCase().includes(q);
          const created = new Date(p.created_at);
          const matchesStart = startDate ? created >= new Date(startDate) : true;
          const matchesEnd = endDate ? created <= new Date(endDate) : true;
          return matchesText && matchesStart && matchesEnd;
        });
      default:
        return data;
    }
  };

  /** 🔹 Tabs **/
  const renderTabs = () => (
    <div className="flex gap-4 mb-4 border-b border-slate-700 flex-wrap">
      {['sessions', 'routers', 'payments', 'business'].map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === tab
              ? 'bg-slate-800 text-white border-t border-x border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );

  /** 🔹 Charts **/
  const renderSessionChart = () => {
    const activeSessions = sessions.filter(s => !s.ended);
    if (!activeSessions.length) return <div className="text-slate-400">No active sessions</div>;

    const now = Date.now();
    const maxHours = Math.max(...activeSessions.map(s => (new Date(s.end_time) - now) / 3600000));

    const dataPoints = [];
    for (let i = 0; i <= Math.ceil(maxHours); i++) {
      const point = { hour: i };
      activeSessions.forEach(s => {
        const remaining = Math.max(0, Math.round(((new Date(s.end_time) - now) / 3600000) - i));
        point[s.phone] = remaining;
      });
      dataPoints.push(point);
    }

    // 🔑 Hash simple d'une string → nombre
        const hashString = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash);
        };

        // 🎨 Couleur stable basée sur le phone
        const colorFromPhone = (phone) => {
        if (!phone) return '#888888'; // fallback
        const hash = hashString(phone.toString());
        const hue = hash % 360; // 0–359
        return `hsl(${hue}, 70%, 55%)`;
        };


    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dataPoints}>
          <CartesianGrid stroke="#2c2c2c" />
          <XAxis dataKey="hour" label={{ value: 'Elapsed Hours', position: 'insideBottom', offset: -5 }} />
          <YAxis label={{ value: 'Remaining Hours', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend verticalAlign="top" />
          {activeSessions.map((s, i) => (
            <Line key={s.id} type="monotone" dataKey={s.phone} stroke={colorFromPhone(s.phone)} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderPaymentsChart = () => {
    if (!payments.length) return <div className="text-slate-400">No payments</div>;

    // 🔹 filtre les paiements avec status "approved" uniquement
    const filteredPayments = payments
        .filter(p => p.status?.toLowerCase() === 'approved') // ignore majuscules/minuscules
        .filter(p => {
        const created = new Date(p.created_at);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        return (!start || created >= start) && (!end || created <= end);
        });

    const grouped = {};
    filteredPayments.forEach(p => {
        const date = new Date(p.created_at).toLocaleDateString();
        grouped[date] = (grouped[date] || 0) + Number(p.amount);
    });

    const data = Object.entries(grouped).map(([date, amount]) => ({ date, amount }));

    if (!data.length) return <div className="text-slate-400">No approved payments</div>;

    return (
        <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
            <CartesianGrid stroke="#2c2c2c" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={v => `${v.toLocaleString()} F`} />
            <Bar dataKey="amount" fill="#3b82f6" />
        </BarChart>
        </ResponsiveContainer>
    );
    };

  const renderRoutersChart = () => {
    if (!routers.length) return <div className="text-slate-400">No routers</div>;
    const data = routers.map(r => ({ name: r.name, status: r.health === 'ok' ? 1 : 0 }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid stroke="#2c2c2c" />
          <XAxis dataKey="name" />
          <YAxis ticks={[0,1]} />
          <Tooltip formatter={v => v === 1 ? 'OK' : 'Down'} />
          <Bar dataKey="status" fill="#facc15" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  /** 🔹 Business Charts **/
  const renderBusinessChart = () => {
    const filtered = filterData(payments, 'payments').filter(p => p.status === 'approved');

    const businessMap = {};

    filtered.forEach(p => {
      const bizId = p.business?.id || 'unknown';
      const bizName = p.business?.name || 'Unknown';

      if (!businessMap[bizId]) {
        businessMap[bizId] = { name: bizName, total: 0 };
      }
      businessMap[bizId].total += Number(p.amount);
    });

    const data = Object.values(businessMap).sort((a, b) => b.total - a.total);

    if (!data.length) return <div className="text-slate-400">No business data</div>;

    return (
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid stroke="#2c2c2c" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={v => `${v.toLocaleString()} F`} />
          <Legend />
          <Bar dataKey="total" fill="#4ade80" name="Total Revenue" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderChart = () => {
    switch(activeTab){
      case 'sessions': return renderSessionChart();
      case 'payments': return renderPaymentsChart();
      case 'routers': return renderRoutersChart();
      case 'business': return renderBusinessChart();
      default: return null;
    }
  };

  /** 🔹 Business Totals Table + Avatar **/
  const renderBusinessTable = () => {
    const filteredPayments = filterData(payments, 'payments').filter(p => p.status === 'approved');
    const businessMap = {};

    filteredPayments.forEach(p => {
      const bizId = p.business?.id || 'unknown';
      const bizName = p.business?.name || 'Unknown';

      if (!businessMap[bizId]) {
        businessMap[bizId] = {
          id: bizId,
          name: bizName,
          payments: [],
          sessions: 0,
          routers: new Set()
        };
      }

      businessMap[bizId].payments.push(p);
    });

    sessions.forEach(s => {
      const bizId = s.business?.id || 'unknown';
      const bizName = s.business?.name || 'Unknown';

      if (!businessMap[bizId]) {
        businessMap[bizId] = {
          id: bizId,
          name: bizName,
          payments: [],
          sessions: 0,
          routers: new Set()
        };
      }

      businessMap[bizId].sessions += 1;
    });

    routers.forEach(r => {
      const bizId = typeof r.business === 'object' ? r.business?.id : r.business;
      const bizName = typeof r.business === 'object' ? r.business?.name : businessMap[bizId]?.name || 'Unknown';
      const key = bizId || 'unknown';

      if (!businessMap[key]) {
        businessMap[key] = {
          id: key,
          name: bizName || 'Unknown',
          payments: [],
          sessions: 0,
          routers: new Set()
        };
      }

      businessMap[key].routers.add(r.id);
    });

    const now = new Date();

    const businessTotals = Object.values(businessMap).map(data => {
      const totalDay = data.payments
        .filter(p => new Date(p.created_at).toDateString() === now.toDateString())
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const startWeek = new Date(now);
      startWeek.setDate(now.getDate() - now.getDay());

      const totalWeek = data.payments
        .filter(p => new Date(p.created_at) >= startWeek)
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const totalMonth = data.payments
        .filter(p => {
          const d = new Date(p.created_at);
          return d.getMonth() === now.getMonth() &&
                 d.getFullYear() === now.getFullYear();
        })
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const totalYear = data.payments
        .filter(p => new Date(p.created_at).getFullYear() === now.getFullYear())
        .reduce((sum, p) => sum + Number(p.amount), 0);

      return {
        business: data.name,
        totalDay,
        totalWeek,
        totalMonth,
        totalYear,
        sessions: data.sessions,
        routers: data.routers.size
      };
    });

    const totalBusinesses = businessTotals.length;

    return (
      <div className="flex flex-col items-center gap-6">
        {/* 🔵 Business Total Avatar */}
        <div className="flex flex-col items-center">
          <div className="w-28 h-28 rounded-full bg-slate-800 border-4 border-indigo-500 
                          flex items-center justify-center text-4xl font-bold text-blue-500 shadow-lg">
            {totalBusinesses}
          </div>
          <div className="mt-2 text-green-100 text-sm tracking-wide">
            Business Total
          </div>
        </div>

        {/* 📊 Tableau */}
        <table className="w-full table-auto border-collapse">
          <thead className="text-slate-400 text-sm bg-slate-900">
            <tr>
              <th className="px-3 py-2 text-left">Business</th>
              <th className="px-3 py-2 text-left">Total Day</th>
              <th className="px-3 py-2 text-left">Total Week</th>
              <th className="px-3 py-2 text-left">Total Month</th>
              <th className="px-3 py-2 text-left">Total Year</th>
              <th className="px-3 py-2 text-left">#Sessions</th>
              <th className="px-3 py-2 text-left">#Routers</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {businessTotals
              .filter(b => b.business.toLowerCase().includes(search.toLowerCase()))
              .map(b => (
                <tr key={b.business} className="border-t border-slate-800">
                  <td className="px-3 py-2">{b.business}</td>
                  <td className="px-3 py-2">{b.totalDay.toLocaleString()} F</td>
                  <td className="px-3 py-2">{b.totalWeek.toLocaleString()} F</td>
                  <td className="px-3 py-2">{b.totalMonth.toLocaleString()} F</td>
                  <td className="px-3 py-2">{b.totalYear.toLocaleString()} F</td>
                  <td className="px-3 py-2">{b.sessions}</td>
                  <td className="px-3 py-2">{b.routers}</td>
                </tr>
              ))}
            {!businessTotals.length && (
              <tr>
                <td colSpan="7" className="py-6 text-slate-400 text-center">
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  /** 🔹 Table Renderer **/
  const renderTable = () => {
    const filteredSessions = filterData(sessions, 'sessions');
    const filteredRouters = filterData(routers, 'routers');
    const filteredPayments = filterData(payments, 'payments');

    switch(activeTab) {
      case 'sessions':
        return (
          <table className="w-full table-auto border-collapse">
            <thead className="text-slate-400 text-sm bg-slate-900">
              <tr>
                <th className="px-3 py-2 text-left">Phone</th>
                <th className="px-3 py-2 text-left">MAC</th>
                <th className="px-3 py-2 text-left">Router</th>
                <th className="px-3 py-2 text-left">Commune</th>
                <th className="px-3 py-2 text-left">End Time</th>
                <th className="px-3 py-2 text-left">Remaining</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredSessions.map(s => (
                <tr key={s.id} className="border-t border-slate-800">
                  <td className="px-3 py-2">{s.phone}</td>
                  <td className="px-3 py-2">{s.mac}</td>
                  <td className="px-3 py-2">{s.router?.name}</td>
                  <td className="px-3 py-2">{s.commune}</td>
                  <td className="px-3 py-2">{new Date(s.end_time).toLocaleString()}</td>
                  <td className="px-3 py-2">{s.ended ? 'Ended' : s.remainingHours?.toFixed(2) + 'h'}</td>
                </tr>
              ))}
              {!filteredSessions.length && <tr><td colSpan="6" className="py-6 text-slate-400 text-center">No activity</td></tr>}
            </tbody>
          </table>
        );
      case 'routers':
        return (
          <table className="w-full table-auto border-collapse">
            <thead className="text-slate-400 text-sm bg-slate-900">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">IP</th>
                <th className="px-3 py-2 text-left">Location</th>
                <th className="px-3 py-2 text-left">Health</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredRouters.map(r => (
                <tr key={r.id} className="border-t border-slate-800">
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2">{r.ip}</td>
                  <td className="px-3 py-2">{r.location}</td>
                  <td className={`px-3 py-2 ${r.health === 'ok' ? 'text-green-400' : 'text-red-400'}`}>{r.health}</td>
                </tr>
              ))}
              {!filteredRouters.length && <tr><td colSpan="4" className="py-6 text-slate-400 text-center">No activity</td></tr>}
            </tbody>
          </table>
        );
      case 'payments':
        return (
          <div className="mb-2 flex gap-2 items-center flex-wrap">
            <label className="text-slate-400 flex items-center gap-1">
              From: <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-1 rounded border border-slate-700 bg-slate-900 text-white"/>
            </label>
            <label className="text-slate-400 flex items-center gap-1">
              To: <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-1 rounded border border-slate-700 bg-slate-900 text-white"/>
            </label>
            <table className="w-full table-auto border-collapse mt-2">
              <thead className="text-slate-400 text-sm bg-slate-900">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">Phone</th>
                  <th className="px-3 py-2 text-left">Amount</th>
                  <th className="px-3 py-2 text-left">Plan</th>
                  <th className="px-3 py-2 text-left">Router</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Created</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredPayments.map(p => (
                  <tr key={p.id} className="border-t border-slate-800">
                    <td className="px-3 py-2">{p.id}</td>
                    <td className="px-3 py-2">{p.phone}</td>
                    <td className="px-3 py-2">{p.amount} F</td>
                    <td className="px-3 py-2">{p.plan}</td>
                    <td className="px-3 py-2">{p.router?.name}</td>
                    <td className={`px-3 py-2 ${p.status === 'approved' ? 'text-green-400' : p.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}`}>{p.status}</td>
                    <td className="px-3 py-2">{new Date(p.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {!filteredPayments.length && <tr><td colSpan="7" className="py-6 text-slate-400 text-center">No activity</td></tr>}
              </tbody>
            </table>
          </div>
        );
      case 'business':
        return renderBusinessTable();
      default: return null;
    }
  };


     if (loading || !minLoadingDone) {
  const text = "greenhat cloud history...";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex gap-1 text-3xl font-bold tracking-widest">
        {text.split("").map((char, i) => (
          <span
            key={i}
            className={`text-cyan-200 animate-zigzag`}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: "1.2s",
              transform: i % 2 === 0 ? "translateY(-8px)" : "translateY(8px)"
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>
    </div>
  );
}

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Super Admin History</h2>
        <Link
            to="/super"
            className="text-sm text-primary hover:underline"
        >
            ← Go to Home
        </Link>
      </div>

      {renderTabs()}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full p-2 rounded border border-slate-700 bg-slate-900 text-white"
        />
      </div>
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-6">
        {renderTable()}
      </div>
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <h3 className="text-lg mb-2">
          {activeTab === 'sessions' ? 'Active Sessions Evolution' :
           activeTab === 'payments' ? 'Payments Amount Over Time' :
           activeTab === 'routers' ? 'Routers Status' :
           activeTab === 'business' ? 'Business Dominance' :
           ''}
        </h3>
        {renderChart()}
      </div>
    </div>
  );
}
