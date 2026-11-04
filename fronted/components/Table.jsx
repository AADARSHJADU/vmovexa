import React from 'react';

export const Table = ({ children, className = '', ...props }) => (
  <div className="w-full overflow-auto rounded-xl border border-[var(--border)] bg-[var(--background)]">
    <table className={`w-full text-sm text-left ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className = '', ...props }) => (
  <thead className={`text-xs uppercase bg-slate-100 dark:bg-[#181c2b] text-slate-700 dark:text-slate-200 font-bold ${className}`} {...props}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = '', ...props }) => (
  <tbody className={`divide-y divide-[var(--border)] ${className}`} {...props}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '', hover = true, ...props }) => (
  <tr className={`${hover ? 'hover:bg-[var(--secondary)]/50 transition-colors' : ''} ${className}`} {...props}>
    {children}
  </tr>
);

export const TableHead = ({ children, className = '', ...props }) => (
  <th className={`px-6 py-4 font-bold tracking-wider text-slate-700 dark:text-slate-200 ${className}`} {...props}>
    {children}
  </th>
);

export const TableCell = ({ children, className = '', ...props }) => (
  <td className={`px-6 py-4 ${className}`} {...props}>
    {children}
  </td>
);
