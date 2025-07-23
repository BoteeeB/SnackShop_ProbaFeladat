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
    if (products.length > 0) {
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
    }
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
      className="min-h-screen flex flex-col items-center justify-start px-4 pt-20"
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)",
      }}
    >
      <Navbar /> {}

      {message && (
        <div
          ref={messageRef}
          className="mt-4 bg-green-100 text-green-700 px-4 py-2 rounded shadow"
        >
          {message}
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl p-8 mt-6"
      >
        <h1
          ref={headingRef}
          className="text-4xl font-extrabold mb-8 text-blue-700 text-center drop-shadow"
        >
          Snackek
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <div
              key={product.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className="border p-4 rounded-lg shadow bg-gray-100 flex flex-col items-start"
            >
              <h2 className="text-lg font-semibold text-black">{product.name}</h2>
              <p className="text-sm text-black">Ár: {product.price} Ft</p>
              <p className="text-sm text-black">Készlet: {product.stock}</p>
              <button
                onClick={() => addToCart({ ...product, quantity: 1 })}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                disabled={product.stock === 0}
              >
                Kosárba
              </button>
            </div>
          ))}
        </div>

        <Cart
          onOrderComplete={() => {
            fetchProducts();
            setMessage("Sikeres rendelés!");
            setTimeout(() => setMessage(""), 4000);
          }}
        />
      </div>
    </div>
  );
}
