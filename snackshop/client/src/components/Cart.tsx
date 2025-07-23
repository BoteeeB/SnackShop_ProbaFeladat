import { useCart } from "../context/CartContext";
import api from "../services/api";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

interface CartProps {
  onOrderComplete?: () => void;
}

export default function Cart({ onOrderComplete }: CartProps) {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [message, setMessage] = useState("");
  const messageRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleOrder = async () => {
    try {
      const res = await api.post("/api/order", { cart });
      clearCart();
      setMessage(`Sikeres rendelés! Összeg: ${res.data.total} Ft`);
      if (onOrderComplete) onOrderComplete();
    } catch (err) {
      setMessage("Rendelés sikertelen.");
    }
  };

  useEffect(() => {
    if (!message) return;
    const el = messageRef.current;
    if (!el) return;

    gsap.set(el, { opacity: 0, y: 10 });
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
    });

    const timer = setTimeout(() => {
      gsap.to(el, {
        opacity: 0,
        y: -10,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => setMessage(""),
      });
    }, 4000);

    return () => {
      clearTimeout(timer);
      gsap.killTweensOf(el);
    };
  }, [message]);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.set(containerRef.current, { opacity: 0, y: -30 });
    requestAnimationFrame(() => {
      gsap.to(containerRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      });
    });
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div
      ref={containerRef}
      className="mt-10 backdrop-blur-md bg-white/90 p-8 rounded-3xl shadow-2xl max-w-2xl mx-auto border border-gray-200 transition-all"
    >
      <h2 className="text-3xl font-extrabold mb-6 text-blue-700 text-center drop-shadow">
        Kosár
      </h2>

      {message && (
        <p
          ref={messageRef}
          className={`mb-6 text-center font-semibold ${
            message.startsWith("Sikeres") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      {cart.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">A kosár üres.</p>
      ) : (
        <>
          <ul className="space-y-6">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center bg-white p-4 rounded-xl shadow border border-gray-200"
              >
                <div className="text-gray-800 font-medium text-lg">
                  {item.name} – {item.price} Ft x
                  <input
                    type="number"
                    min="1"
                    max={item.stock}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, parseInt(e.target.value))
                    }
                    className="w-16 ml-2 border border-gray-300 rounded px-2 py-1 text-black bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  />
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-red-700 transition"
                >
                  Törlés
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-right text-xl font-bold text-gray-800">
            Végösszeg: {total} Ft
          </p>

          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={handleOrder}
              disabled={cart.length === 0}
              className="bg-green-600 text-white px-5 py-3 rounded-xl font-semibold text-md hover:bg-green-700 transition disabled:opacity-50"
            >
              Rendelés leadása
            </button>
            <button
              onClick={clearCart}
              className="bg-gray-200 text-gray-800 px-5 py-3 rounded-xl font-semibold text-md hover:bg-gray-300 transition"
            >
              Kosár ürítése
            </button>
          </div>
        </>
      )}
    </div>
  );
}
