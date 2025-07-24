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
      className="min-h-screen flex flex-col items-center px-4 pt-2"
      style={{
        background: "linear-gradient(135deg, #FFF5E4 0%, #FF6F61 100%)",
        fontFamily: "Karla, sans-serif",
      }}
    >
      <Navbar />
      <div className="h-16" />

      <div
        ref={containerRef}
        className="w-full max-w-4xl bg-[#FFF5E4] rounded-3xl shadow-2xl p-8"
      >
        <h1
          className="text-4xl font-extrabold mb-6 text-[#FF6F61] text-center"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Rendelések
        </h1>

        <div className="flex flex-col space-y-4">
          {orders.map((order, idx) => (
            <div
              key={order.id}
              ref={(el) => { orderRefs.current[idx] = el; }}
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-200"
            >
              <p className="text-lg text-[#333333] font-medium">
                <span className="text-[#FF6F61]">{order.username}</span> –{" "}
                {order.total_price} Ft –{" "}
                <span className="text-gray-500">
                  {new Date(order.created_at).toLocaleString()}
                </span>
              </p>
              <p className="mt-2 text-sm text-[#555555]">
                {order.items}
              </p>
            </div>
          ))}

          {orders.length === 0 && (
            <p className="text-center text-gray-500 text-lg">
              Nincsenek rendelési adatok.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
