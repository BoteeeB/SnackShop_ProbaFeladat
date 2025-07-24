import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { gsap } from "gsap";
import Navbar from "../components/Navbar";

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
  const backButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    api.get<Order[]>("/api/orders").then((res) => {
      setOrders(res.data);
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    gsap.set(orderRefs.current, { opacity: 0, y: 20 });
    gsap.set(backButtonRef.current, { opacity: 0, y: 20 });

    requestAnimationFrame(() => {
      const tl = gsap.timeline();
      tl.to(orderRefs.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });
      tl.to(
        backButtonRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
        },
        "-=0.3"
      );
    });
  }, [orders.length]);

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4"
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)",
      }}
    >
      <Navbar />

      {}
      <div className="h-12 md:h-12" />

      <div
        ref={containerRef}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-8"
      >
        <h1 className="text-3xl font-bold mb-8 text-blue-700 text-center drop-shadow">
          Rendelések
        </h1>

        <div className="space-y-4">
          {orders.map((order, index) => (
            <div
              key={order.id}
              ref={(el) => {
                orderRefs.current[index] = el;
              }}
              className="bg-gray-100 p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <p className="text-lg text-gray-800 font-medium">
                <span className="text-blue-700">{order.username}</span> –{" "}
                {order.total_price} Ft –{" "}
                <span className="text-gray-500">
                  {new Date(order.created_at).toLocaleString()}
                </span>
              </p>
              <p className="text-sm text-gray-600 mt-2">{order.items}</p>
            </div>
          ))}

          {orders.length === 0 && (
            <p className="text-center text-gray-500">
              Nincsenek rendelési adatok.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
