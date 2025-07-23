import { useState, useEffect, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { gsap } from "gsap";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
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
    const formFields = formFieldRefs.current;

    gsap.set(formContainerRef.current, { opacity: 0, y: -50 });
    gsap.set(headerRef.current, { opacity: 0, y: -20 });
    gsap.set(formFields, { opacity: 0, x: -50 });
    gsap.set(infoContainerRef.current, { opacity: 0, y: 30 });
    gsap.set(submitButtonRef.current, { opacity: 0, scale: 0.8 });

    requestAnimationFrame(() => {
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

      gsap.to(formFields, {
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

      console.log("API response data:", res.data);

      login({
        id: res.data.id,
        username: res.data.username,
        email: res.data.email,
        isAdmin: res.data.isAdmin,
      });

      console.log("User after login:", {
        id: res.data.id,
        username: res.data.username,
        email: res.data.email,
        isAdmin: res.data.isAdmin,
      });

      navigate(res.data.isAdmin ? "/admin" : "/home", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError("Hibás felhasználónév vagy jelszó.");
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)",
      }}
    >
      <div
        ref={formContainerRef}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-12 flex flex-col items-center"
      >
        <h1
          ref={headerRef}
          className="text-5xl font-extrabold mb-10 text-blue-700 text-center drop-shadow"
        >
          SnackShop
        </h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          {error && <p className="text-red-500 text-center">{error}</p>}

          <div
            className="form-field"
            ref={(el) => {
              formFieldRefs.current[0] = el;
            }}
          >
            <label className="block mb-2 font-medium text-gray-700">
              Felhasználónév
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-lg"
              autoComplete="username"
              required
            />
          </div>

          <div
            className="form-field"
            ref={(el) => {
              formFieldRefs.current[1] = el;
            }}
          >
            <label className="block mb-2 font-medium text-gray-700">
              Jelszó
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-lg"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            ref={submitButtonRef}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition"
          >
            Bejelentkezés
          </button>
        </form>

        <p
          className="mt-8 text-base text-center text-gray-600"
          ref={infoContainerRef}
        >
          Nincs fiókod?{" "}
          <a
            href="/register"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Regisztráció
          </a>
        </p>
      </div>
    </div>
  );
}
