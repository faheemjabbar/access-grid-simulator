import React, { useState } from 'react';
import EmployeeTable from './components/EmployeeTable';

const DEFAULT_EMPLOYEES = [
  { id: "EMP001", access_level: 2, request_time: "09:15", room: "ServerRoom" },
  { id: "EMP002", access_level: 1, request_time: "09:30", room: "Vault" },
  { id: "EMP003", access_level: 3, request_time: "10:05", room: "ServerRoom" },
  { id: "EMP004", access_level: 3, request_time: "09:45", room: "Vault" },
  { id: "EMP005", access_level: 2, request_time: "08:50", room: "R&D Lab" },
  { id: "EMP006", access_level: 1, request_time: "10:10", room: "R&D Lab" },
  { id: "EMP007", access_level: 2, request_time: "10:18", room: "ServerRoom" },
  { id: "EMP008", access_level: 3, request_time: "09:55", room: "Vault" },
  { id: "EMP001", access_level: 2, request_time: "09:28", room: "ServerRoom" },
  { id: "EMP006", access_level: 1, request_time: "10:15", room: "R&D Lab" }
];

export default function App(){
  const [employees, setEmployees] = useState(DEFAULT_EMPLOYEES);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendUrl, setBackendUrl] = useState('http://localhost:5000');

  async function simulate(){
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch(`${backendUrl}/api/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees })
      });
      const data = await res.json();
      if (data && data.success) {
        setResults(data.results);
      } else {
        setResults([{ id: 'ERROR', reason: data.error || 'Unknown error', granted: false }]);
      }
    } catch (err) {
      setResults([{ id: 'ERROR', reason: err.message, granted: false }]);
    } finally {
      setLoading(false);
    }
  }

  function onFileUpload(e){
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!Array.isArray(parsed)) throw new Error('JSON should be an array of employees');
        setEmployees(parsed);
        setResults(null);
      } catch (err) {
        alert('Failed to parse JSON: ' + err.message);
      }
    };
    reader.readAsText(f);
  }

  function onPasteReplace(){
    const text = prompt('Paste JSON array of employees here:');
    if (!text) return;
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error('JSON should be an array');
      setEmployees(parsed);
      setResults(null);
    } catch (err) {
      alert('Invalid JSON: ' + err.message);
    }
  }

  return (
    <div className="container">
      <h1>Employee Access Simulator</h1>
      <div className="controls">
        <div>
          <input type="file" accept=".json" onChange={onFileUpload} />
          <button onClick={onPasteReplace}>Paste JSON</button>
          <button onClick={() => { setEmployees(DEFAULT_EMPLOYEES); setResults(null); }}>Load Default</button>
          <button className="primary" onClick={simulate} disabled={loading}>
            {loading ? 'Simulating...' : 'Simulate Access'}
          </button>
        </div>
      </div>

      <EmployeeTable employees={employees} results={results} />

      {results && (
        <div className="results">
          <h2>Results</h2>
          <table>
            <thead>
              <tr><th>ID</th><th>Room</th><th>Time</th><th>Granted</th><th>Reason</th></tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td>{r.id}</td>
                  <td>{r.room}</td>
                  <td>{r.request_time}</td>
                  <td className={r.granted ? 'granted' : 'denied'}>{r.granted ? 'Granted' : 'Denied'}</td>
                  <td>{r.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
