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

  const prevLength = useRef(cart.length);

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

  useEffect(() => {
    if (!message || !messageRef.current) return;
    const el = messageRef.current;
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
    }, 8000);

    return () => {
      clearTimeout(timer);
      gsap.killTweensOf(el);
    };
  }, [message]);

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
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

      const cartSummary = cart
        .map(
          (item) =>
            `${item.name} (${item.quantity} db) - ${
              item.price * item.quantity
            } Ft`
        )
        .join(", ");

      clearCart();

      setMessage(
        `✅ Sikeres rendelés!\nVégösszeg: ${res.data.total} Ft.\n\n🛒Kosár tartalma:\n${cartSummary.replace(/, /g, "\n")}`
      );

      onOrderComplete?.();
    } catch {
      setMessage("Rendelés sikertelen.");
    }
  };

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

  const handleClearAll = () => {
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
    className="p-8 bg-[#FFF5E4] rounded-3xl shadow-2xl max-w-full lg:max-w-2xl"
    style={{ fontFamily: "Karla, sans-serif" }}
  >
      <h2
        className="text-3xl font-extrabold mb-6 text-[#FF6F61] text-center"
        style={{
          fontFamily: "Poppins, sans-serif",
          textShadow: "0 1px 2px rgba(0,0,0,0.1)",
        }}
      >
        Kosár
      </h2>

      {message && (
        <p
          ref={messageRef}
          className={`mb-6 text-center font-semibold ${
            message.startsWith("Sikeres") ? "text-[#88B04B]" : "text-[#FF6F61]"
          }`}
          style={{
            fontFamily: "Poppins, sans-serif",
            textShadow: "0 1px 1px rgba(0,0,0,0.1)",
            fontSize: "1.25rem",
            whiteSpace: "pre-line",
            lineHeight: "1.6",
          }}
        >
          {message}
        </p>
      )}

      {cart.length === 0 ? (
        <p
          className="text-center text-gray-500 text-lg font-extrabold"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          A kosár üres.
        </p>
      ) : (
        <>
          <ul className="space-y-6">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-md"
              >
                <div
                  className="text-gray-800 font-extrabold text-lg"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  {item.name} –{" "}
                  <span
                    className="text-[#FF6F61]"
                    style={{
                      fontWeight: 700,
                      textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    {item.price} Ft
                  </span>{" "}
                  x{" "}
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
                    className="w-16 ml-2 border border-gray-300 rounded-lg px-2 py-1 text-black bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF6F61] transition"
                    style={{ fontFamily: "Poppins, sans-serif", fontWeight: "600" }}
                  />
                </div>
                <button
                  onClick={(e) => handleRemove(item.id, e)}
                  className="bg-[#FF6F61] text-white px-3 py-2 rounded-full uppercase text-sm font-bold tracking-wide hover:bg-[#F1C40F] transition"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Törlés
                </button>
              </li>
            ))}
          </ul>

          <p
            className="mt-6 text-right text-xl font-extrabold text-gray-800"
            style={{
              fontFamily: "Poppins, sans-serif",
              textShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            Végösszeg:{" "}
            <span className="text-[#FF6F61]">{total} Ft</span>
          </p>

          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={handleOrder}
              disabled={cart.length === 0}
              className="bg-[#FF6F61] text-white px-5 py-3 rounded-full font-bold uppercase tracking-wide transition hover:bg-[#F1C40F] disabled:opacity-50"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Rendelés leadása
            </button>
            <button
              ref={clearBtnRef}
              onClick={handleClearAll}
              className="bg-[#F1C40F] text-white px-5 py-3 rounded-full font-bold uppercase tracking-wide transition hover:bg-[#88B04B]"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Kosár ürítése
            </button>
          </div>
        </>
      )}
    </div>
  );
}
