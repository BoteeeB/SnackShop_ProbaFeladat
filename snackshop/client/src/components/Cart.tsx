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
  const clearBtnRef = useRef<HTMLButtonElement>(null);

  // track previous length to detect adds
  const prevLength = useRef(cart.length);

  // 1) Slide-in when a new item is added
  useEffect(() => {
    const newLen = cart.length;
    if (newLen > prevLength.current && containerRef.current) {
      const ul = containerRef.current.querySelector("ul");
      const lastLi = ul?.lastElementChild as HTMLElement;
      if (lastLi) {
        gsap.from(lastLi, {
          opacity: 0,
          y: 20,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    }
    prevLength.current = newLen;
  }, [cart]);

  // 2) Order feedback animation
  useEffect(() => {
    if (!message) return;
    const el = messageRef.current!;
    gsap.set(el, { opacity: 0, y: 10 });
    gsap.to(el, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });

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

  // 3) Fade-in of the whole cart container on mount
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    gsap.set(el, { opacity: 0, y: -30 });
    requestAnimationFrame(() =>
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      })
    );
  }, []);

  const handleOrder = async () => {
    try {
      const res = await api.post("/api/order", { cart });
      clearCart();
      setMessage(`Sikeres rendelés! Összeg: ${res.data.total} Ft`);
      onOrderComplete?.();
    } catch {
      setMessage("Rendelés sikertelen.");
    }
  };

  // 4) Slide-out + remove single item
  const handleRemove = (id: string, e: React.MouseEvent) => {
    const li = (e.currentTarget as HTMLElement).closest("li") as HTMLElement;
    gsap.to(li, {
      opacity: 0,
      x: 50,
      duration: 0.3,
      ease: "power1.in",
      onComplete: () => removeFromCart(id),
    });
  };

  // 5) Staggered slide-out of all items + button “pop” on clear
  const handleClearAll = () => {
    // animate clear button
    const btn = clearBtnRef.current;
    if (btn) {
      gsap.fromTo(
        btn,
        { scale: 1 },
        {
          scale: 0.9,
          duration: 0.1,
          ease: "power1.inOut",
          yoyo: true,
          repeat: 1,
        }
      );
    }

    // animate items out
    const items = containerRef.current?.querySelectorAll("li") ?? [];
    if (items.length === 0) {
      clearCart();
      return;
    }

    const tl = gsap.timeline({ onComplete: clearCart });
    tl.to(items, {
      opacity: 0,
      x: 50,
      duration: 0.3,
      stagger: 0.05,
      ease: "power1.in",
    });
  };

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
                    onChange={(e) => {
                      const t = e.target as HTMLInputElement;
                      gsap.fromTo(
                        t,
                        { scale: 0.9 },
                        { scale: 1, duration: 0.2, ease: "power1.out" }
                      );
                      updateQuantity(item.id, parseInt(t.value, 10));
                    }}
                    className="w-16 ml-2 border border-gray-300 rounded px-2 py-1 text-black bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  />
                </div>
                <button
                  onClick={(e) => handleRemove(item.id, e)}
                  className="bg-red-600 text-white px-3 py-2 rounded-xl hover:bg-red-700 hover:rounded-md transition-all duration-300 text-sm font-semibold"
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
              className="bg-green-600 text-white px-5 py-3 rounded-xl font-semibold text-md hover:bg-green-700 hover:rounded-md transition-all duration-300 disabled:opacity-50"
            >
              Rendelés leadása
            </button>
            <button
              ref={clearBtnRef}
              onClick={handleClearAll}
              className="bg-gray-200 text-gray-800 px-5 py-3 rounded-xl font-semibold text-md hover:bg-gray-300 hover:rounded-md transition-all duration-300"
            >
              Kosár ürítése
            </button>
          </div>
        </>
      )}
    </div>
  );
}
