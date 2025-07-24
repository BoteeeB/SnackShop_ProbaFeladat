import { useEffect, useRef, useState } from "react";
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
    const allFields = formFieldsRef.current.filter(Boolean);
    const allProducts = productRefs.current.filter(Boolean);

    if (
      !containerRef.current ||
      !headingRef.current ||
      !submitButtonRef.current
    )
      return;

    const tl = gsap.timeline();
    gsap.set(containerRef.current, { opacity: 0, y: -40 });
    gsap.set(headingRef.current, { opacity: 0, y: -20 });
    gsap.set(allFields, { opacity: 0, x: -40 });
    gsap.set(allProducts, { opacity: 0, y: 30 });
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
        allFields,
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" },
        "-=0.7"
      )
      .to(
        allProducts,
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
      const newEl = productRefs.current[idx];
      if (newEl) {
        gsap.from(newEl, {
          opacity: 0,
          y: -20,
          duration: 0.5,
          ease: "power2.out",
        });
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

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
    });
    setEditingId(product.id);
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
        api
          .delete(`/api/products/${id}`)
          .then(() => fetchProducts())
          .catch((err) => console.error(err));
      },
    });
  } else {
    api.delete(`/api/products/${id}`).then(fetchProducts);
  }
};


  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)",
      }}
    >
      <Navbar />

      <div
        ref={containerRef}
        className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl p-8"
      >
        <h1
          ref={headingRef}
          className="text-4xl font-extrabold mb-8 text-blue-700 text-center drop-shadow"
        >
          Admin – Termékek kezelése
        </h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 mb-8">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Név"
              value={form.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm({ ...form, name: e.target.value })
              }
              ref={(el) => {
                formFieldsRef.current[0] = el;
              }}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-lg"
            />

            <input
              type="number"
              min={1}
              placeholder="Ár"
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
              className="w-32 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-lg"
            />

            <input
              type="number"
              min={1}
              placeholder="Készlet"
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
              className="w-32 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-lg"
            />
          </div>

          <button
            ref={submitButtonRef}
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:rounded-md font-semibold text-lg hover:bg-blue-700 transition-all duration-300"
          >
            {editingId ? "Módosít" : "Hozzáad"}
          </button>
        </form>

        <div className="grid gap-4">
          {products.map((p, index) => (
            <div
              key={p.id}
              ref={(el) => {
                productRefs.current[index] = el;
              }}
              className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow transition hover:shadow-md"
            >
              <span className="text-lg font-medium text-gray-800">
                {p.name} – <span className="text-blue-700">{p.price} Ft</span> –{" "}
                <span className="text-green-600">{p.stock} db</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-xl hover:rounded-md hover:bg-yellow-600 transition-all duration-300"
                >
                  Módosít
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-xl hover:rounded-md hover:bg-red-700 transition-all duration-300"
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
