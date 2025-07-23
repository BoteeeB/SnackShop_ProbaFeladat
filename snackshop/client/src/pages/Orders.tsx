import { useEffect, useState } from "react";
import api from "../services/api";

interface Order {
  id: string;
  username: string;
  total_price: number;
  created_at: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.get<Order[]>("/api/orders").then((res) => setOrders(res.data));
  }, []);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Rendelések</h1>
      <div className="space-y-2">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-3 rounded shadow">
            <p>
              <b>{order.username}</b> – {order.total_price} Ft –{" "}
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>);
}