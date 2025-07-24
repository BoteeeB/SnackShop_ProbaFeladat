import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { gsap } from "gsap";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import FallingSnacks from "../components/FallingSnacks";
import type { ChangeEvent, FormEvent } from "react";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, user, isLoading } = useAuth();

  const formContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const formFieldRefs = useRef<(HTMLDivElement | null)[]>([]);
  const infoContainerRef = useRef<HTMLParagraphElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (
        !formContainerRef.current ||
        !headerRef.current ||
        !infoContainerRef.current ||
        !submitButtonRef.current
      )
        return;

      const fields = formFieldRefs.current.filter(Boolean);
      if (!fields.length) return;

      gsap.set(formContainerRef.current, { opacity: 0, y: -50 });
      gsap.set(headerRef.current, { opacity: 0, y: -20 });
      gsap.set(fields, { opacity: 0, x: -50 });
      gsap.set(infoContainerRef.current, { opacity: 0, y: 30 });
      gsap.set(submitButtonRef.current, { opacity: 0, scale: 0.8 });

      gsap.to(formContainerRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
      });
      gsap.to(headerRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "power2.out",
      });
      gsap.to(fields, {
        opacity: 1,
        x: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power4.out",
      });
      gsap.to(infoContainerRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power2.out",
        delay: 0.5,
      });
      gsap.to(submitButtonRef.current, {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: "back.out(2)",
      });
    });

    return () => cancelAnimationFrame(id);
  }, []);

  if (isLoading) return null;
  if (user) return <Navigate to={user.isAdmin ? "/admin" : "/home"} replace />;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await api.post<{
        id: string;
        username: string;
        email: string;
        isAdmin: boolean;
      }>("/api/login", form);
      login(res.data);
      navigate(res.data.isAdmin ? "/admin" : "/home", { replace: true });
    } catch {
      setError("Hibás felhasználónév vagy jelszó.");
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #FFF5E4 0%, #FF6F61 100%)",
      }}
    >
      <FallingSnacks count={25} />

      <div
        ref={formContainerRef}
        className="relative z-10 w-full max-w-lg bg-[#FFF5E4] rounded-2xl shadow-2xl p-12 flex flex-col items-center"
      >
        <h1
          ref={headerRef}
          className="text-5xl font-extrabold mb-10 text-[#FF6F61] text-center"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          SnackShop
        </h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          {error && (
            <p className="text-[#333333] text-center" style={{ fontFamily: "Karla, sans-serif" }}>
              {error}
            </p>
          )}

          <div
            ref={(el) => {
              formFieldRefs.current[0] = el;
            }}
            className="w-full"
          >
            <label
              className="block mb-2 font-medium text-[#333333]"
              style={{ fontFamily: "Karla, sans-serif" }}
            >
              Felhasználónév
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#88B04B] transition text-lg"
            />
          </div>

          <div
            ref={(el) => {
              formFieldRefs.current[1] = el;
            }}
            className="w-full"
          >
            <label
              className="block mb-2 font-medium text-[#333333]"
              style={{ fontFamily: "Karla, sans-serif" }}
            >
              Jelszó
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#88B04B] transition text-lg"
            />
          </div>

          <button
            type="submit"
            ref={submitButtonRef}
            className="w-full bg-[#FF6F61] hover:bg-[#F1C40F] text-white py-3 rounded-lg font-extrabold text-lg uppercase tracking-wide transition"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Bejelentkezés
          </button>
        </form>

        <p
          ref={infoContainerRef}
          className="mt-8 text-base text-center text-[#333333]"
          style={{ fontFamily: "Karla, sans-serif" }}
        >
          Nincs fiókod?{" "}
          <a
            href="/register"
            className="underline text-[#FF6F61] hover:text-[#D35400]"
          >
            Regisztráció
          </a>
        </p>
      </div>
    </div>
  );
}
