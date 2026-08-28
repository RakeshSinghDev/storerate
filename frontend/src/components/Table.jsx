import React from 'react';
import './Table.css';

export const Table = ({ columns, data, keyField = 'id', emptyMessage = 'No data available.' }) => {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key || col.header} style={{ textAlign: col.align || 'left' }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, idx) => (
              <tr key={row[keyField] || idx}>
                {columns.map((col) => (
                  <td key={col.key || col.header} style={{ textAlign: col.align || 'left' }}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
