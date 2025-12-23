import React, { useEffect, useState } from "react";
import api from "../api";
import { Card, CardHeader, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const Reports = () => {
  const [itemSales, setItemSales] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    api
      .get("/reports/items")
      .then((res) => setItemSales(res.data))
      .catch((err) => console.error("Fetch Item Sales Error:", err));
  }, []);

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${BACKEND_URL}${path}`;
  };

  const filteredSales = itemSales.filter((row) => {
    if (!fromDate && !toDate) return true;
    const saleDate = new Date(row.date);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    if (from && saleDate < from) return false;
    if (to && saleDate > to) return false;
    return true;
  });

  const downloadCSV = () => {
    const headers = ["Date", "Item", "Quantity Sold", "Total Sales (₹)"];
    const rows = filteredSales.map((row) => [
      row.date,
      row.name,
      row.quantity,
      row.total_sales.toFixed(2),
    ]);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\n";
    rows.forEach((r) => {
      csvContent += r.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "item_sales_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 max-w-full overflow-x-hidden">
      <h2 className="text-2xl font-bold text-blue-700">
        Item-wise Sales Reports
      </h2>

      {/* Filters */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Filters & Export</h3>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <label className="font-medium whitespace-nowrap">From:</label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <label className="font-medium whitespace-nowrap">To:</label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setFromDate("");
              setToDate("");
            }}
          >
            Clear
          </Button>

          <Button
            size="sm"
            onClick={downloadCSV}
            className="bg-blue-700 text-white hover:bg-blue-800"
          >
            Download CSV
          </Button>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Sales Data</h3>
        </CardHeader>

        <CardContent className="overflow-x-auto max-w-full">
          <table className="w-full table-fixed border border-gray-200 divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left font-medium">Date</th>
                {/* <th className="px-2 py-2 text-left font-medium">Image</th> */}
                <th className="px-2 py-2 text-left font-medium">Item</th>
                <th className="px-2 py-2 text-left font-medium">Qty</th>
                <th className="px-2 py-2 text-left font-medium">₹ Total</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.length ? (
                filteredSales.map((row) => (
                  <tr key={`${row.date}-${row.id}`}>
                    <td className="px-2 py-2 whitespace-nowrap">
                      {row.date}
                    </td>

                    {/* <td className="px-2 py-2">
                      {row.image ? (
                        <img
                          src={getImageUrl(row.image)}
                          alt={row.name}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      ) : (
                        "—"
                      )}
                    </td> */}

                    <td className="px-2 py-2 truncate whitespace-nowrap">
                      {row.name}
                    </td>

                    <td className="px-2 py-2">{row.quantity}</td>

                    <td className="px-2 py-2 font-medium whitespace-nowrap">
                      ₹{row.total_sales.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-4 text-center text-gray-500"
                  >
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
