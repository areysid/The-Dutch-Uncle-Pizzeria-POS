import React, { useEffect, useState } from "react";
import api from "../api";
import { Card, CardHeader, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./ui/select";

// ✅ Dynamically use the backend URL (local or deployed)
const BACKEND_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

const Menu = () => {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    available: true,
    image: null,
    category: "",
  });
  const [newCategory, setNewCategory] = useState("");

  // 🧠 Fetch menu and categories
  const fetchMenu = () => {
    api
      .get("/menu")
      .then((res) => setMenu(res.data))
      .catch((err) => console.error("Fetch Menu Error:", err));
  };

  const fetchCategories = () => {
    api
      .get("/menu/categories")
      .then((res) => {
        const catList = Array.isArray(res.data)
          ? ["All", ...res.data]
          : ["All"];
        setCategories(catList);
      })
      .catch((err) => console.error("Fetch Categories Error:", err));
  };

  useEffect(() => {
    fetchMenu();
    fetchCategories();
  }, []);

  // 🧩 Handle new menu item submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("available", form.available ? "true" : "false");
    formData.append("category", form.category);
    if (form.image) formData.append("image", form.image);

    api
      .post("/menu", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        setForm({
          name: "",
          description: "",
          price: "",
          available: true,
          image: null,
          category: "",
        });
        fetchMenu();
        fetchCategories();
      })
      .catch((err) => console.error("Add Menu Error:", err));
  };

  const handleDelete = (id) => {
    api
      .delete(`/menu/${id}`)
      .then(fetchMenu)
      .catch((err) => console.error("Delete Menu Error:", err));
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    api
      .post("/menu/categories", { name: newCategory })
      .then(() => {
        setNewCategory("");
        fetchCategories();
      })
      .catch((err) => console.error("Add Category Error:", err));
  };

  // ✅ Properly resolve image URL
  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${BACKEND_URL}${path}`;
  };

  // 🧮 Filter menu based on category
  const filteredMenu =
    activeCategory === "All"
      ? menu
      : menu.filter((item) => item.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-200">
        {categories.map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={activeCategory === cat ? "default" : "outline"}
            className={`${activeCategory === cat
                ? "bg-black text-white"
                : "border-blue-700 text-black hover:bg-blue-700 hover:text-white"
              }`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Menu List */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-blue-700">Menu Items</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredMenu.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No menu items to display.
            </p>
          ) : (
            filteredMenu.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 border-b border-gray-200 p-2"
              >
                <div className="flex items-center gap-2">
                  {item.image && (
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium">
                      {item.name} (₹{item.price})
                    </p>
                    <p className="text-sm text-gray-500">{item.category}</p>
                    {!item.available && (
                      <p className="text-xs text-red-500">(Unavailable)</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>


      {/* Add New Menu Item */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-blue-700">
            Add New Menu Item
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm">
            <Input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <Input
              placeholder="Price"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
            <Select
              value={form.category}
              onValueChange={(value) => setForm({ ...form, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((c) => c !== "All")
                  .map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* Add new category inline */}
            <div className="flex gap-2">
              <Input
                placeholder="New Category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <Button type="button" onClick={handleAddCategory}>
                Add
              </Button>
            </div>

            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
            />

            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.available}
                onCheckedChange={(checked) =>
                  setForm({ ...form, available: checked })
                }
                className="w-4 h-4 flex items-center justify-center"
              />
              <Label>Available</Label>
            </div>
            <Button type="submit">Add Item</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Menu;
