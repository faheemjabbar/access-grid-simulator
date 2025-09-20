import React from 'react';

export default function EmployeeTable({ employees, results }){
  // Map results by id+time+room for quick lookup
  const key = (e)=> `${e.id}|${e.request_time}|${e.room}`;
  const resultMap = new Map();
  (results || []).forEach(r => resultMap.set(key(r), r));

  return (
    <div className="table-section">
      <h2>Employees</h2>
      <table>
        <thead>
          <tr><th>ID</th><th>Access Level</th><th>Request Time</th><th>Room</th><th>Result</th></tr>
        </thead>
        <tbody>
          {employees.map((e,i) => {
            const r = resultMap.get(key(e));
            return (
              <tr key={i}>
                <td>{e.id}</td>
                <td>{e.access_level}</td>
                <td>{e.request_time}</td>
                <td>{e.room}</td>
                <td>{r ? (r.granted ? <span className="granted">Granted</span> : <span className="denied">Denied</span>) : '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
