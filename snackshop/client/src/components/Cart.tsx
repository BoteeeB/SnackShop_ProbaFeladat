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

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="mt-8 bg-gray-50 p-4 rounded">
      <h2 className="text-xl font-bold mb-2 text-black">Kosár</h2>

      {}
      {message && (
        <p
          ref={messageRef}
          className={`mb-4 font-semibold ${
            message.startsWith("Sikeres") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      {cart.length === 0 ? (
        <p className="text-black">A kosár üres.</p>
      ) : (
        <>
          <ul>
            {cart.map((item) => (
              <li key={item.id} className="flex justify-between items-center py-2 text-black">
                <div>
                  {item.name} – {item.price} Ft x
                  <input
                    type="number"
                    min="1"
                    max={item.stock}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                    className="w-12 ml-2 border rounded bg-red-400"
                  />
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500"
                >
                  Törlés
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 font-bold text-black">Végösszeg: {total} Ft</p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleOrder}
              className="bg-green-600 text-white px-4 py-2 rounded"
              disabled={cart.length === 0}
            >
              Rendelés leadása
            </button>
            <button
              onClick={clearCart}
              className="bg-gray-300 text-black px-4 py-2 rounded"
            >
              Kosár ürítése
            </button>
          </div>
        </>
      )}
    </div>
  );
}
