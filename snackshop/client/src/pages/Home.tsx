import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import Cart from "../components/Cart";
import { gsap } from "gsap";

import { useAuth } from "../context/AuthContext";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();

  const { user, logout } = useAuth();

  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    api.get<Product[]>("/api/products").then((res) => setProducts(res.data));
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

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-4 pt-20"
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)",
      }}
    >
      {}
      <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50 px-8 py-4 flex items-center justify-between">
        <span className="text-xl font-semibold text-blue-700">
          Üdv, {user?.username || "Vendég"}!
        </span>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Kijelentkezés
        </button>
      </nav>

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

        <Cart />
      </div>
    </div>
  );
}
