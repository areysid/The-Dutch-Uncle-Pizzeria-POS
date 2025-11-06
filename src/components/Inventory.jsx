import React, { useEffect, useState } from 'react';
import api from '../api';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [form, setForm] = useState({ item_name: '', quantity: '' });

  const fetchInventory = () => api.get('/inventory').then(res => setInventory(res.data));

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    api.post('/inventory', form).then(() => {
      setForm({ item_name: '', quantity: '' });
      fetchInventory();
    });
  };

  const handleUpdate = (id, item_name, quantity) => {
    api.put(`/inventory/${id}`, { item_name, quantity }).then(fetchInventory);
  };

  return (
    <div>
      <h2>Inventory</h2>
      <ul>
        {inventory.map(item => (
          <li key={item.id}>
            {item.item_name}: {item.quantity}
            <button onClick={() => handleUpdate(item.id, item.item_name, item.quantity + 1)}>+1</button>
            <button onClick={() => handleUpdate(item.id, item.item_name, item.quantity - 1)}>-1</button>
          </li>
        ))}
      </ul>
      <h3>Add Item to Inventory</h3>
      <form onSubmit={handleSubmit}>
        <input placeholder="Item Name" value={form.item_name} onChange={e => setForm({...form, item_name: e.target.value})} required />
        <input placeholder="Quantity" type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required />
        <button type="submit">Add</button>
      </form>
    </div>
  );
};

export default Inventory;