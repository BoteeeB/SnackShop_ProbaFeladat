import React, { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import api from "../services/api";
import { gsap } from "gsap";
import Navbar from "../components/Navbar";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Omit<Product, "id">>({
    name: "",
    price: 0,
    stock: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formFieldsRef = useRef<(HTMLInputElement | null)[]>([]);
  const productRefs = useRef<(HTMLDivElement | null)[]>([]);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const prevCount = useRef(products.length);

  const fetchProducts = () =>
    api.get<Product[]>("/api/products").then((res) => setProducts(res.data));

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const fields = formFieldsRef.current.filter(Boolean);
    const cards = productRefs.current.filter(Boolean);
    if (!containerRef.current || !headingRef.current || !submitButtonRef.current) return;

    const tl = gsap.timeline();
    gsap.set(containerRef.current, { opacity: 0, y: -40 });
    gsap.set(headingRef.current, { opacity: 0, y: -20 });
    gsap.set(fields, { opacity: 0, x: -40 });
    gsap.set(cards, { opacity: 0, y: 30 });
    gsap.set(submitButtonRef.current, { opacity: 0, scale: 0.98 });

    tl.to(containerRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
    })
      .to(
        headingRef.current,
        { opacity: 1, y: 0, duration: 1.1, ease: "power2.out" },
        "-=0.6"
      )
      .to(
        fields,
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" },
        "-=0.7"
      )
      .to(
        cards,
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "power2.out" },
        "-=0.4"
      )
      .to(
        submitButtonRef.current,
        { opacity: 1, scale: 1, duration: 0.6, ease: "power1.out" },
        "-=0.4"
      );

    const newCount = products.length;
    if (newCount > prevCount.current) {
      const idx = newCount - 1;
      const el = productRefs.current[idx];
      if (el) {
        gsap.from(el, { opacity: 0, y: -20, duration: 0.5, ease: "power2.out" });
      }
    }
    prevCount.current = newCount;
  }, [products.length]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/api/products/${editingId}`, form);
    } else {
      await api.post("/api/products", form);
    }
    setForm({ name: "", price: 0, stock: 0 });
    setEditingId(null);
    fetchProducts();
  };

  const handleEdit = (p: Product) => {
    setForm({ name: p.name, price: p.price, stock: p.stock });
    setEditingId(p.id);
  };

  const handleDelete = (id: string) => {
    const idx = products.findIndex((p) => p.id === id);
    const el = productRefs.current[idx];

    if (el) {
      gsap.to(el, {
        opacity: 0,
        x: 50,
        duration: 0.3,
        ease: "power1.in",
        onComplete: () => {
          api.delete(`/api/products/${id}`).then(fetchProducts).catch(console.error);
        },
      });
    } else {
      api.delete(`/api/products/${id}`).then(fetchProducts).catch(console.error);
    }
  };

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
        className="w-full max-w-5xl bg-[#FFF5E4] rounded-3xl shadow-2xl p-8"
      >
        <h1
          ref={headingRef}
          className="text-4xl font-extrabold mb-6 text-[#FF6F61] text-center"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Admin – Termékek kezelése
        </h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-extrabold">
            <div className="flex flex-col">
              <label htmlFor="name" className="mb-1 text-[#333] text-sm">
                Terméknév
              </label>
              <input
                id="name"
                type="text"
                placeholder="Pl. Chips"
                value={form.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, name: e.target.value })
                }
                ref={(el) => {
                  formFieldsRef.current[0] = el;
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6F61] transition text-lg"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="price" className="mb-1 text-[#333] text-sm">
                Ár (Ft)
              </label>
              <input
                id="price"
                type="number"
                min={1}
                value={form.price}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm({
                    ...form,
                    price: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                ref={(el) => {
                  formFieldsRef.current[1] = el;
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6F61] transition text-lg"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="stock" className="mb-1 text-[#333] text-sm">
                Készlet (db)
              </label>
              <input
                id="stock"
                type="number"
                min={1}
                value={form.stock}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm({
                    ...form,
                    stock: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                ref={(el) => {
                  formFieldsRef.current[2] = el;
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6F61] transition text-lg"
              />
            </div>
          </div>

          <button
            ref={submitButtonRef}
            type="submit"
            className="w-full bg-[#FF6F61] hover:bg-[#F1C40F] text-white py-3 rounded-full font-bold uppercase tracking-wide transition"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {editingId ? "Módosítás" : "Új termék hozzáadása"}
          </button>
        </form>

        <div className="grid gap-4">
          {products.map((p, idx) => (
            <div
              key={p.id}
              ref={(el) => {
                productRefs.current[idx] = el;
              }}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white p-4 rounded-2xl shadow hover:shadow-md transition"
            >
              <span className="text-gray-800 font-extrabold text-center sm:text-left">
                {p.name} – <span className="text-[#FF6F61]">{p.price} Ft</span> –{" "}
                <span className="text-[#88B04B]">{p.stock} db</span>
              </span>
              <div className="flex flex-col sm:flex-row gap-2 self-center sm:self-auto">
                <button
                  onClick={() => handleEdit(p)}
                  className="bg-[#F1C40F] hover:bg-[#FF6F61] text-white px-4 py-2 rounded-full uppercase tracking-wide font-bold transition"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Módosít
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="bg-[#FF6F61] hover:bg-[#D35400] text-white px-4 py-2 rounded-full uppercase tracking-wide font-bold transition"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Törlés
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
