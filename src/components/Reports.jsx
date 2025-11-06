import React, { useEffect, useState } from 'react';
import api from '../api';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const Reports = () => {
  const [itemSales, setItemSales] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    api.get('/reports/items')
      .then(res => setItemSales(res.data))
      .catch(err => console.error('Fetch Item Sales Error:', err));
  }, []);

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path; // handle absolute URLs too
    return `${BACKEND_URL}${path}`;
  };

  // Filter rows by selected from/to dates
  const filteredSales = itemSales.filter(row => {
    if (!fromDate && !toDate) return true;
    const saleDate = new Date(row.date);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    if (from && saleDate < from) return false;
    if (to && saleDate > to) return false;
    return true;
  });

  // Download table as CSV
  const downloadCSV = () => {
    const headers = ['Date', 'Item', 'Quantity Sold', 'Total Sales (₹)'];
    const rows = filteredSales.map(row => [
      row.date,
      row.name,
      row.quantity,
      row.total_sales.toFixed(2)
    ]);

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += headers.join(',') + '\n';
    rows.forEach(r => {
      csvContent += r.join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'item_sales_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-blue-700">Item-wise Sales Reports</h2>

      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Filters & Export</h3>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <label htmlFor="from-date" className="font-medium whitespace-nowrap">
              From:
            </label>
            <Input
              id="from-date"
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <label htmlFor="to-date" className="font-medium whitespace-nowrap">
              To:
            </label>
            <Input
              id="to-date"
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
            />
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setFromDate('');
              setToDate('');
            }}
          >
            Clear
          </Button>

          <Button
            size="sm"
            onClick={downloadCSV}
            className="bg-blue-700 text-white border-blue-700 hover:bg-blue-800"
          >
            Download CSV
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Sales Data</h3>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Image</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Item</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Quantity Sold</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Total Sales (₹)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.length ? (
                filteredSales.map(row => (
                  <tr key={`${row.date}-${row.id}`}>
                    <td className="px-3 py-2">{row.date}</td>
                    <td className="px-3 py-2">
                      {row.image ? (
                        <img
                          src={getImageUrl(row.image)}
                          alt={row.name}
                          width={40}
                          height={40}
                          className="rounded-md object-cover"
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2">{row.quantity}</td>
                    <td className="px-3 py-2 font-medium">₹{row.total_sales.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-gray-500">
                    No sales data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
