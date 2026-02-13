'use client';

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';

type Person = {
  name: string;
  company: string;
  relation: string;
  lastContact: string;
};

const data: Person[] = [
  { name: '김철수', company: '네이버', relation: '포스트맨', lastContact: '2024-02-10' },
  { name: '이영희', company: '카카오', relation: '포스트맨', lastContact: '2024-02-12' },
  { name: '박민수', company: '삼성전자', relation: '포스트맨 플러스', lastContact: '2024-02-13' },
];

const columns: ColumnDef<Person>[] = [
  { accessorKey: 'name', header: '이름' },
  { accessorKey: 'company', header: '회사' },
  { accessorKey: 'relation', header: '관계' },
  { accessorKey: 'lastContact', header: '마지막 연락' },
];

export default function GridTest() {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">TanStack Table 테스트</h1>
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-4 py-3 text-left font-semibold">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-t hover:bg-gray-50">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
