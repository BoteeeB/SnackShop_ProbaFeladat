import { useState, useEffect, useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import api from "../services/api";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const formContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const formFieldRefs = useRef<(HTMLDivElement | null)[]>([]);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const infoContainerRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    gsap.set(formContainerRef.current, { opacity: 0, y: -50 });
    gsap.set(headerRef.current, { opacity: 0, y: -20 });
    gsap.set(formFieldRefs.current, { opacity: 0, x: -50 });
    gsap.set(submitButtonRef.current, { opacity: 0, scale: 0.8 });
    gsap.set(infoContainerRef.current, { opacity: 0, y: 30 });

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

      gsap.to(formFieldRefs.current, {
        opacity: 1,
        x: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power4.out",
      });

      gsap.to(submitButtonRef.current, {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: "back.out(2)",
      });

      gsap.to(infoContainerRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        delay: 0.5,
        ease: "power2.out",
      });
    });
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await api.post("/api/register", form);
      setSuccess(true);
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError("Felhasználónév már létezik.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
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
          Regisztráció
        </h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-500 text-center">Sikeres regisztráció!</p>}

          <div
            className="form-field"
            ref={(el) => {
              formFieldRefs.current[0] = el;
            }}
          >
            <label className="block mb-2 font-medium text-gray-700">Felhasználónév</label>
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
            <label className="block mb-2 font-medium text-gray-700">Jelszó</label>
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
            Regisztráció
          </button>
        </form>

        <p
          className="mt-8 text-base text-center text-gray-600"
          ref={infoContainerRef}
        >
          Már van fiókod?{" "}
          <a href="/" className="text-blue-600 underline hover:text-blue-800">
            Bejelentkezés
          </a>
        </p>
      </div>
    </div>
  );
}
