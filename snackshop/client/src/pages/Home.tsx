import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import Cart from "../components/Cart";
import { gsap } from "gsap";
import Navbar from "../components/Navbar";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");
  const { addToCart } = useCart();

  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const messageRef = useRef<HTMLDivElement>(null);

  const fetchProducts = async () => {
    const res = await api.get<Product[]>("/api/products");
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.set(containerRef.current, { opacity: 0, y: -30 });
    gsap.set(headingRef.current, { opacity: 0, y: -20 });
    gsap.set(cardRefs.current, { opacity: 0, y: 20 });

    requestAnimationFrame(() => {
      gsap.to(containerRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
      });
      gsap.to(headingRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "back.out(1.7)",
        delay: 0.3,
      });
      gsap.to(cardRefs.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.5,
      });
    });
  }, [products]);

  useEffect(() => {
    if (!message || !messageRef.current) return;
    const el = messageRef.current;
    gsap.fromTo(
      el,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );
    const timeout = setTimeout(() => {
      gsap.to(el, {
        opacity: 0,
        y: -20,
        duration: 0.5,
        ease: "power2.in",
      });
    }, 3500);
    return () => clearTimeout(timeout);
  }, [message]);

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 pt-12"
      style={{
        background: "linear-gradient(135deg, #FFF5E4 0%, #FF6F61 100%)",
        fontFamily: "Karla, sans-serif",
      }}
    >
      <Navbar />

      {message && (
        <div
          ref={messageRef}
          className="mt-4 bg-[#DFF2E1] text-[#388E3C] px-4 py-2 rounded shadow"
        >
          {message}
        </div>
      )}

      <div className="w-full max-w-6xl mt-6 flex flex-col md:flex-row items-start gap-8">
        <div
          ref={containerRef}
          className="md:w-2/3 bg-[#FFF5E4] rounded-2xl shadow-2xl p-8 flex-shrink-0"
        >
          <h1
            ref={headingRef}
            className="text-4xl font-extrabold mb-8 text-[#FF6F61] text-center"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Snackek
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, i) => (
              <div
                key={product.id}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transform hover:-translate-y-1 transition"
              >
                <h2
                  className="text-xl font-extrabold text-[#333333] mb-3"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  {product.name}
                </h2>
                <p
                  className="text-xl font-extrabold mb-1"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    color: "#FF6F61",
                  }}
                >
                  Ár:{" "}
                  <span
                    className="font-extrabold"
                    style={{
                      color: "#555555",
                      fontFamily: "Poppins, sans-serif",
                      textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    {product.price} Ft
                  </span>
                </p>
                <p
                  className="text-lg font-extrabold mb-4"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    textTransform: "uppercase",
                    color: "#4B5563",
                    letterSpacing: "0.05em",
                  }}
                >
                  Készlet:{" "}
                  <span
                    className="font-extrabold"
                    style={{
                      textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      color: "#374151",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    {product.stock}
                  </span>
                </p>
                <button
                  onClick={() => {
                    addToCart({ ...product, quantity: 1 });
                    setMessage(`${product.name} hozzáadva a kosárhoz!`);
                  }}
                  disabled={product.stock === 0}
                  className="w-full bg-[#FF6F61] hover:bg-[#F1C40F] text-white py-2 rounded-full font-bold uppercase tracking-wide transition"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Kosárba
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="md:w-1/3 self-start">
          <Cart
            onOrderComplete={() => {
              fetchProducts();
              setMessage("Sikeres rendelés!");
            }}
          />
        </div>
      </div>
    </div>
  );
}
