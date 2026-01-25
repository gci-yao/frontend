import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { Link } from 'react-router-dom';

export default function OwnerHistory() {
  const { user } = useAuth();
  const token = localStorage.getItem('gh_token');

  const [sessions, setSessions] = useState([]);
  const [routers, setRouters] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minLoadingDone, setMinLoadingDone] = useState(false);
  const [activeTab, setActiveTab] = useState('sessions');
  const [search, setSearch] = useState('');
  const [paymentDateFilter, setPaymentDateFilter] = useState('');

  /** 🔹 Minimum loader delay */
  useEffect(() => {
    const timer = setTimeout(() => setMinLoadingDone(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  /** 🔹 Load all data */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [s, r, p] = await Promise.all([
          api.getSessions({ token }),
          api.getMyRouters({ token }),
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

  /** 🔹 Update remaining hours every minute */
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

  /** 🔹 Tabs */
  const renderTabs = () => (
    <div className="flex gap-4 mb-4 border-b border-slate-700 flex-wrap">
      {['sessions', 'routers', 'payments'].map(tab => (
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

  /** 🔹 Filter function */
  const filterData = data => {
    const q = search.toLowerCase();
    switch(activeTab){
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
          const matchesSearch = 
            p.phone?.toLowerCase().includes(q) ||
            p.router?.name?.toLowerCase().includes(q) ||
            p.plan?.toLowerCase().includes(q);
          const created = new Date(p.created_at);
          const matchesStart = paymentDateFilter ? created >= new Date(paymentDateFilter) : true;
          const matchesEnd = true; // On peut étendre si tu veux une vraie plage start/end
          return matchesSearch && matchesStart && matchesEnd;
        });
      default: return data;
    }
  };

  /** 🔹 Charts */
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

    const hashString = str => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
      return Math.abs(hash);
    };
    const colorFromPhone = phone => phone ? `hsl(${hashString(phone) % 360}, 70%, 55%)` : '#888888';

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dataPoints}>
          <CartesianGrid stroke="#2c2c2c" />
          <XAxis dataKey="hour" label={{ value: 'Elapsed Hours', position: 'insideBottom', offset: -5 }} />
          <YAxis label={{ value: 'Remaining Hours', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend verticalAlign="top" />
          {activeSessions.map(s => (
            <Line key={s.id || s.phone} type="monotone" dataKey={s.phone} stroke={colorFromPhone(s.phone)} dot={false} />
          ))}
        </LineChart>
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

  const renderPaymentsChart = () => {
  if (!payments.length) return <div className="text-slate-400">No payments</div>;

  // 🔹 Filtrer uniquement les paiements approved
  const approvedPayments = filterData(payments).filter(p => p.status === 'approved');

  const grouped = {};
  approvedPayments.forEach(p => {
    const date = new Date(p.created_at).toLocaleDateString();
    grouped[date] = (grouped[date] || 0) + Number(p.amount);
  });
  
  const data = Object.entries(grouped).map(([date, amount]) => ({ date, amount }));

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

  const renderChart = () => {
    switch(activeTab){
      case 'sessions': return renderSessionChart();
      case 'routers': return renderRoutersChart();
      case 'payments': return renderPaymentsChart();
      default: return null;
    }
  };

  /** 🔹 Table rendering with date summary for payments and session stats */
  const renderTable = () => {
    const filteredSessions = filterData(sessions);
    const filteredRouters = filterData(routers);
    const filteredPayments = filterData(payments);

    const now = new Date();
    
    const approvedPayments = filteredPayments.filter(p => p.status === 'approved');

    const daily = approvedPayments
    .filter(p => new Date(p.created_at).toDateString() === now.toDateString())
    .reduce((sum, p) => sum + Number(p.amount), 0);

    const startWeek = new Date(now); 
    startWeek.setDate(now.getDate() - now.getDay());

    const weekly = approvedPayments
    .filter(p => new Date(p.created_at) >= startWeek)
    .reduce((sum, p) => sum + Number(p.amount), 0);

    const monthly = approvedPayments
    .filter(p => { 
        const d = new Date(p.created_at); 
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); 
    })
    .reduce((sum, p) => sum + Number(p.amount), 0);

    const yearly = approvedPayments
    .filter(p => new Date(p.created_at).getFullYear() === now.getFullYear())
    .reduce((sum, p) => sum + Number(p.amount), 0);



    const activeSessions = sessions.filter(s => !s.ended);
    const inactiveSessions = sessions.filter(s => s.ended);

    return (
      <>
        {activeTab==='payments' && (
          <div className="mb-2 flex items-center gap-4 flex-wrap">
            <div>
              Payments — 
              <span className="text-green-400"> Today: {daily} </span> | 
              <span className="text-blue-400"> This Week: {weekly} </span> | 
              <span className="text-yellow-400"> This Month: {monthly} </span> | 
              <span className="text-red-400"> This Year: {yearly} </span>
            </div>
            <input 
              type="date"
              value={paymentDateFilter}
              onChange={e => setPaymentDateFilter(e.target.value)}
              className="p-1 rounded border border-slate-700 bg-slate-900 text-white"
              title="Filter by date"
            />
          </div>
        )}
        {activeTab==='sessions' && (
          <div className="mb-2 text-white">
            <span className="text-green-700">Active: {activeSessions.length} </span>
            | <span className="text-red-700">Inactive: {inactiveSessions.length}</span> 
          </div>
        )}
        {activeTab==='sessions' && renderTableContent(filteredSessions)}
        {activeTab==='routers' && renderTableContent(filteredRouters)}
        {activeTab==='payments' && renderTableContent(filteredPayments)}
      </>
    );
  };

  /** Helper to render table content dynamically */
  const renderTableContent = (data) => {
  switch(activeTab){
    case 'sessions':
      return (
        <table className="w-full table-auto border-collapse mb-4">
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
            {data.map(s=>(
              <tr key={s.id} className="border-t border-slate-800">
                <td className="px-3 py-2">{s.phone}</td>
                <td className="px-3 py-2">{s.mac}</td>
                <td className="px-3 py-2">{s.router?.name}</td>
                <td className="px-3 py-2">{s.commune}</td>
                <td className="px-3 py-2">{new Date(s.end_time).toLocaleString()}</td>
                <td className="px-3 py-2">{s.ended ? 'Ended' : s.remainingHours?.toFixed(2)+'h'}</td>
              </tr>
            ))}
            {!data.length && (
              <tr>
                <td colSpan={6} className="py-6 text-slate-400 text-center">No sessions</td>
              </tr>
            )}
          </tbody>
        </table>
      );
    case 'routers':
      return (
        <table className="w-full table-auto border-collapse mb-4">
          <thead className="text-slate-400 text-sm bg-slate-900">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">IP</th>
              <th className="px-3 py-2 text-left">Location</th>
              <th className="px-3 py-2 text-left">Health</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {data.map(r=>(
              <tr key={r.id} className="border-t border-slate-800">
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2">{r.ip}</td>
                <td className="px-3 py-2">{r.location}</td>
                <td className={`px-3 py-2 ${r.health==='ok'?'text-green-400':'text-red-400'}`}>{r.health}</td>
              </tr>
            ))}
            {!data.length && (
              <tr>
                <td colSpan={4} className="py-6 text-slate-400 text-center">No routers</td>
              </tr>
            )}
          </tbody>
        </table>
      );
    case 'payments':
      return (
        <table className="w-full table-auto border-collapse mb-4">
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
            {data.map(p=>(
              <tr key={p.id} className="border-t border-slate-800">
                <td className="px-3 py-2">{p.id}</td>
                <td className="px-3 py-2">{p.phone}</td>
                <td className="px-3 py-2">{p.amount} F</td>
                <td className="px-3 py-2">{p.plan}</td>
                <td className="px-3 py-2">{p.router?.name}</td>
                <td className={`px-3 py-2 ${p.status==='approved'?'text-green-400':p.status==='rejected'?'text-red-400':'text-yellow-400'}`}>{p.status}</td>
                <td className="px-3 py-2">{new Date(p.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {!data.length && (
              <tr>
                <td colSpan={7} className="py-6 text-slate-400 text-center">No payments</td>
              </tr>
            )}
          </tbody>
        </table>
      );
  }
};

  /** 🔹 Loader with animated letters */
  if (loading || !minLoadingDone) {
    const text = "greenhat cloud history...";
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex gap-1 text-3xl font-bold tracking-widest">
          {text.split("").map((char,i) => (
            <span
              key={i}
              className="text-cyan-200 animate-zigzag"
              style={{
                animationDelay: `${i*0.15}s`,
                animationDuration: '1.2s',
                transform: i%2===0 ? 'translateY(-8px)' : 'translateY(8px)'
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
        <h2 className="text-xl font-semibold">Owner History</h2>
        <Link to="/owner/" className="text-sm text-primary hover:underline">← Go to Home</Link>
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
          {activeTab==='sessions'?'Active Sessions Evolution':activeTab==='payments'?'Payments Amount Over Time':'Routers Status'}
        </h3>
        {renderChart()}
      </div>
    </div>
  );
}
