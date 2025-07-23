import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { gsap } from "gsap";

interface Order {
  id: string;
  username: string;
  total_price: number;
  created_at: string;
  items: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const orderRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  api.get<Order[]>("/api/orders").then((res) => {
  console.log("Orders response:", res.data);
  setOrders(res.data);
});
}, []);

  useEffect(() => {
    if (!containerRef.current || orders.length === 0) return;

    gsap.set(orderRefs.current, { opacity: 0, y: 20 });

    requestAnimationFrame(() => {
      gsap.to(orderRefs.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
      });
    });
  }, [orders.length]);

  return (
    <div ref={containerRef} className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center text-blue-700">Rendelések</h1>
      <div className="space-y-2">
        {orders.map((order, index) => (
          <div
            key={order.id}
            ref={(el) => {
              orderRefs.current[index] = el;
            }}
            className="bg-white p-3 rounded shadow border border-gray-200"
          >
            <p className="text-lg text-gray-800">
              <b>{order.username}</b> – {order.total_price} Ft –{" "}
              <span className="text-gray-500">
                {new Date(order.created_at).toLocaleString()}
              </span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {order.items}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
