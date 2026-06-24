export function Table({ columns = [], rows = [] }) {
  return (
    <table className="token-table">
      <thead>
        <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={row.id || rowIndex}>
            {columns.map((column) => <td key={column.key}>{row[column.key]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
