import React, { useEffect, useState } from "react";
import api from "../api";
import { Card, CardHeader, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";


const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [orderItems, setOrderItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [activeTab, setActiveTab] = useState("pending"); // new
  // 🔄 Sorting and bulk actions
  const [sortOrder, setSortOrder] = useState("asc"); // asc or desc
  // 🧾 Delete confirmation popup
  const [deleteDialog, setDeleteDialog] = useState({ open: false, orderId: null });



  const fetchOrders = () => api.get("/orders").then((res) => setOrders(res.data));
  const fetchMenu = () => api.get("/menu").then((res) => setMenu(res.data));
  const fetchCategories = () =>
    api.get("/menu/categories").then((res) => setCategories(res.data));

  useEffect(() => {
    fetchOrders();
    fetchMenu();
    fetchCategories();
  }, []);

  const updateTotal = (items) => {
    const newTotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotal(newTotal);
  };

  const addQuantity = (id) => {
    const existing = orderItems.find((i) => i.id === id);
    if (existing) {
      const updated = orderItems.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity + 1 } : i
      );
      setOrderItems(updated);
      updateTotal(updated);
    } else {
      const item = menu.find((m) => m.id === id);
      if (!item) return;
      const newItems = [...orderItems, { ...item, quantity: 1, description: "" }];
      setOrderItems(newItems);
      updateTotal(newItems);
    }
  };

  const subtractQuantity = (id) => {
    const existing = orderItems.find((i) => i.id === id);
    if (!existing) return;
    if (existing.quantity === 1) {
      const updated = orderItems.filter((i) => i.id !== id);
      setOrderItems(updated);
      updateTotal(updated);
    } else {
      const updated = orderItems.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity - 1 } : i
      );
      setOrderItems(updated);
      updateTotal(updated);
    }
  };

  const handleDescriptionChange = (id, value) => {
    const updated = orderItems.map((i) =>
      i.id === id ? { ...i, description: value } : i
    );
    setOrderItems(updated);
  };

  const handleOrder = () => {
    api
      .post("/orders", {
        items: orderItems,
        total_price: total,
        payment_mode: paymentMode,
      })
      .then(() => {
        setOrderItems([]);
        setTotal(0);
        setPaymentMode("Cash");
        fetchOrders();
      });
  };

  const updateStatus = (id, status) => {
    api.put(`/orders/${id}`, { status }).then(fetchOrders);
  };

  // 🧩 Bulk status update — Mark All as Prepared / Collected
  const handleBulkUpdate = (status) => {
    // pick orders based on current tab
    const targetOrders = orders.filter((order) => {
      if (activeTab === "pending" && status === "completed")
        return order.status === "pending";
      if (activeTab === "completed" && status === "collected")
        return order.status === "completed";
      return false;
    });

    if (targetOrders.length === 0) return;

    if (!confirm(`Are you sure you want to mark all ${targetOrders.length} orders as ${status}?`))
      return;

    Promise.all(targetOrders.map((order) => api.put(`/orders/${order.id}`, { status })))
      .then(fetchOrders)
      .catch((err) => console.error("Bulk update error:", err));
  };


  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path; // handle absolute URLs too
    return `${BACKEND_URL}${path}`;
  };

  const pendingOrders = orders.filter((order) => order.status === "pending");
  const completedOrders = orders.filter((order) => order.status === "completed");
  const collectedOrders = orders.filter((order) => order.status === "collected");

  const filteredMenu =
    activeCategory === "All"
      ? menu
      : menu.filter((item) => item.category === activeCategory);




  const handlePrint = (order) => {
    let slipText = "";
    slipText += "       [ORDER SLIP]\n";
    slipText += "-----------------------------\n";
    slipText += `Order ID: ${order.id}\n`;
    slipText += `Payment: ${order.payment_mode}\n`;
    slipText += "-----------------------------\n";

    order.items.forEach((i) => {
      const line = `${i.name} x${i.quantity} Rs${(i.price * i.quantity).toFixed(2)}`;
      slipText += line + "\n";
    });

    slipText += "-----------------------------\n";
    slipText += `TOTAL: Rs. ${order.total_price}\n`;
    slipText += "-----------------------------\n";
    slipText += "      Thank you!\n";
    slipText += "   Have a great day!\n\n\n\n";

    const encoded = encodeURIComponent(slipText);
    window.location.href = `rawbt:text:${encoded}`;
  };

  const TABS = [
    { view: "pending", name: "Pending" },
    { view: "completed", name: "Prepared" },
    { view: "collected", name: "Collected" },
  ];

  const getOrdersForTab = () => {
    switch (activeTab) {
      case "pending":
        return pendingOrders;
      case "completed":
        return completedOrders;
      case "collected":
        return collectedOrders;
      default:
        return [];
    }
  };


  // Constants
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const itemsPerPage = 10;

  // 🧩 Helper to extract and normalize date safely
  const getOrderDate = (order) => {
    const rawDate = order.date || order.created_at || order.timestamp;
    if (!rawDate) return null;

    // Handle SQLite format ("YYYY-MM-DD HH:MM:SS") → ISO
    const normalized = rawDate.includes("T") ? rawDate : rawDate.replace(" ", "T");
    const d = new Date(normalized);
    if (isNaN(d)) return null;

    return d.toISOString().split("T")[0];
  };

  // 🗓️ Today's date (local)
  const today = new Date();
  const todayString = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    .toISOString()
    .split("T")[0];

  // 🔍 Filter by active tab + today toggle
  let filteredOrders = getOrdersForTab().filter((order) => {
    if (!showTodayOnly) return true;
    const orderDate = getOrderDate(order);
    return orderDate === todayString;
  });

  // 🆕 Sort "preparing" and "completed" orders by ascending ID
  // 🧭 Apply sorting dynamically
  filteredOrders = filteredOrders.sort((a, b) =>
    sortOrder === "asc" ? a.id - b.id : b.id - a.id
  );


  // Pagination
  const paginatedOrders = filteredOrders.slice(0, visibleCount);

  // 🗑️ Delete single order
  const handleDeleteOrder = (id) => {
    setDeleteDialog({ open: true, orderId: id }); // open modal
  };

  const confirmDelete = () => {
    const { orderId } = deleteDialog;
    if (!orderId) return;

    api
      .delete(`/orders/${orderId}`)
      .then(() => {
        setDeleteDialog({ open: false, orderId: null });
        fetchOrders();
      })
      .catch((err) => {
        console.error("Delete failed:", err);
        setDeleteDialog({ open: false, orderId: null });
      });
  };


  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-blue-700">Take Order</h2>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          size="sm"
          variant={activeCategory === "All" ? "default" : "outline"}
          className={`${activeCategory === "All"
            ? "bg-blue-700 text-white"
            : "border-blue-700 text-black hover:bg-blue-700 hover:text-white"
            }`}
          onClick={() => setActiveCategory("All")}
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={activeCategory === cat ? "default" : "outline"}
            className={`${activeCategory === cat
              ? "bg-blue-700 text-white"
              : "border-blue-700 text-black hover:bg-blue-700 hover:text-white"
              }`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Menu Section */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Add Items</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredMenu.length ? (
            filteredMenu.map((item) => {
              const existing = orderItems.find((i) => i.id === item.id);
              return (
                <div key={item.id} className="flex items-center gap-3">
                  {item.image && (
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-10 h-10 rounded-md object-cover"
                    />
                  )}
                  <span className="flex-1">
                    {item.name} (₹{item.price})
                  </span>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => subtractQuantity(item.id)}
                    disabled={!existing}
                    className="text-black border-black hover:bg-black hover:text-white"
                  >
                    −
                  </Button>

                  <span className="px-2">{existing ? existing.quantity : 0}</span>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addQuantity(item.id)}
                    className="bg-blue-700 text-white border-blue-700 hover:bg-blue-800"
                  >
                    +
                  </Button>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">No items in this category.</p>
          )}
        </CardContent>
      </Card>

      {/* Current Order */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Current Order</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderItems.length ? (
            orderItems.map((item) => (
              <div
                key={item.id}
                className="space-y-2 border-b border-gray-200 pb-3"
              >
                {/* 🧾 Top section with item image + controls */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  {item.image && (
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-[100px] text-sm sm:text-base">
                    <span className="font-medium">{item.name}</span>
                  </div>

                  {/* Quantity controls — stack on mobile */}
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => subtractQuantity(item.id)}
                      className="text-black border-black hover:bg-black hover:text-white w-8 sm:w-9"
                    >
                      −
                    </Button>

                    <span className="text-sm font-medium">{item.quantity}</span>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addQuantity(item.id)}
                      className="bg-blue-700 text-white border-blue-700 hover:bg-blue-800 w-8 sm:w-9"
                    >
                      +
                    </Button>

                    <span className="text-sm sm:text-base font-medium sm:ml-4 w-full sm:w-auto text-right sm:text-left">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Notes / special instructions */}
                <Input
                  placeholder="Add special instructions (e.g. No onions, extra cheese)"
                  value={item.description}
                  onChange={(e) =>
                    handleDescriptionChange(item.id, e.target.value)
                  }
                  className="text-sm"
                />
              </div>
            ))
          ) : (
            <p className="text-gray-500">No items in the order.</p>
          )}

          {/* Bottom section — payment + total */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Payment Mode */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-medium text-sm sm:text-base">Payment Mode:</span>
              <Select value={paymentMode} onValueChange={setPaymentMode}>
                <SelectTrigger className="w-[140px] sm:w-[160px]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Total + Button */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
              <span className="font-semibold text-lg text-center sm:text-left">
                Total: ₹{total.toFixed(2)}
              </span>
              <Button
                onClick={handleOrder}
                disabled={orderItems.length === 0}
                className="w-full sm:w-auto"
              >
                Place Order
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Tabs for Orders */}
      <nav className="bg-white border-b border-gray-200 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-2 py-2 overflow-x-auto justify-center">
          {TABS.map((tab) => (
            <Button
              key={tab.view}
              onClick={() => setActiveTab(tab.view)}
              variant={activeTab === tab.view ? "default" : "ghost"}
              className={`transition-all duration-300 min-w-[100px] text-base ${activeTab === tab.view
                ? "bg-black text-white"
                : "text-black border-blue-700"
                }`}
            >
              {tab.name}
            </Button>
          ))}
        </div>
      </nav>

      {/* Orders by Tab */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <h3 className="text-xl font-semibold capitalize">{activeTab} Orders</h3>

            <div className="flex items-center flex-wrap gap-4">
              {/* 🗓️ Date Filter Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="todayFilter"
                  checked={showTodayOnly}
                  onChange={(e) => {
                    setShowTodayOnly(e.target.checked);
                    setVisibleCount(10);
                  }}
                  className="w-4 h-4 accent-blue-700"
                />
                <label
                  htmlFor="todayFilter"
                  className="text-sm font-medium text-gray-700 select-none"
                >
                  Show only today’s orders
                </label>
              </div>

              {/* ⏫ Sorting Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Sort by ID:</span>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Sort Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">ASC</SelectItem>
                    <SelectItem value="desc">DESC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 🔘 Mark All Button */}
              {(activeTab === "pending" || activeTab === "completed") && (
                <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                  <Button
                    size="sm"
                    onClick={() =>
                      handleBulkUpdate(activeTab === "pending" ? "completed" : "collected")
                    }
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    {activeTab === "pending"
                      ? "Mark All as Prepared"
                      : "Mark All as Collected"}
                  </Button>
                </div>
              )}

            </div>
          </div>
        </CardHeader>


        <CardContent className="space-y-4">
          {paginatedOrders.length ? (
            paginatedOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col border-b border-gray-200 pb-3"
              >
                {/* 🔹 Header Row (Order ID + Status) */}
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <span className="font-medium text-sm sm:text-base">
                    ID {order.id}
                  </span>
                  <Badge
                    variant="outline"
                    className="capitalize text-xs sm:text-sm"
                  >
                    {order.status}
                  </Badge>
                </div>

                {/* 🔹 Payment Mode */}
                <span className="text-xs sm:text-sm text-gray-600 mt-1">
                  💳 {order.payment_mode}
                </span>

                {/* 🔹 Item List */}
                <div className="flex flex-col gap-3 mt-2">
                  {order.items.map((i, idx) => (
                    <div
                      key={`${order.id}-${i.id}-${idx}`}
                      className="flex flex-wrap sm:flex-nowrap items-start sm:items-center gap-2 sm:gap-3"
                    >
                      {i.image && (
                        <img
                          src={getImageUrl(i.image)}
                          alt={i.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-md object-cover flex-shrink-0"
                        />
                      )}

                      <div className="flex flex-col text-sm sm:text-base flex-1">
                        <span className="font-medium">
                          {i.name} x {i.quantity || 1}
                        </span>
                        {i.description && (
                          <span className="text-xs sm:text-sm text-gray-500 italic">
                            “{i.description}”
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 🔹 Footer (Total + Actions) */}
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="font-semibold text-sm sm:text-base text-center sm:text-left">
                    Total: ₹{order.total_price}
                  </span>

                  {activeTab === "pending" && (
                    <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => handlePrint(order)}
                      >
                        🖨️ Print Slip
                      </Button>

                      <Button
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => updateStatus(order.id, "completed")}
                      >
                        Mark as Prepared
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700"
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        🗑️ Delete
                      </Button>
                    </div>
                  )}


                  {activeTab === "completed" && (
                    <div className="flex justify-center sm:justify-end">
                      <Button
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => updateStatus(order.id, "collected")}
                      >
                        Mark as Collected
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm sm:text-base">
              No {activeTab} orders.
            </p>
          )}

          {/* Pagination Button */}
          {filteredOrders.length > visibleCount && (
            <div className="flex justify-center mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setVisibleCount((prev) => prev + itemsPerPage)}
              >
                Show More
              </Button>
            </div>
          )}

          {/* Show Less Button */}
          {visibleCount > itemsPerPage && (
            <div className="flex justify-center mt-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setVisibleCount(itemsPerPage)}
              >
                Show Less
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🗑️ Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, orderId: null })}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Order #{deleteDialog.orderId}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 mt-2">
            Are you sure you want to permanently delete this order?
            This action cannot be undone.
          </p>

          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, orderId: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Orders;
