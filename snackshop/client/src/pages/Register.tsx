import React, { useState, useEffect, useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import api from "../services/api";
import FallingSnacks from "../components/FallingSnacks";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
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
    } catch {
      setError("Felhasználónév már létezik.");
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #FFF5E4 0%, #FF6F61 100%)",
      }}
    >
      <FallingSnacks count={60} />

      <div
        ref={formContainerRef}
        className="relative z-10 w-full max-w-lg bg-[#FFF5E4] rounded-2xl shadow-2xl p-12 flex flex-col items-center"
      >
        <h1
          ref={headerRef}
          className="text-5xl font-extrabold mb-10 text-[#FF6F61] text-center"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Regisztráció
        </h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          {error && (
            <p
              className="text-red-600 text-center font-bold"
              style={{ fontFamily: "Karla, sans-serif" }}
            >
              {error}
            </p>
          )}
          {success && (
            <p
              className="text-[#88B04B] text-center font-medium"
              style={{ fontFamily: "Karla, sans-serif" }}
            >
              Sikeres regisztráció!
            </p>
          )}

          <div
            ref={(el) => {
              formFieldRefs.current[0] = el;
            }}
            className="w-full"
          >
            <label
              className="block mb-2 text-[#333333] font-bold"
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
              className="w-full border font-bold border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF6F61] transition text-lg"
            />
          </div>

          <div
            ref={(el) => {
              formFieldRefs.current[1] = el;
            }}
            className="w-full relative"
          >
            <label
              className="block mb-2 text-[#333333] font-bold"
              style={{ fontFamily: "Karla, sans-serif" }}
            >
              Jelszó
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
              className="w-full border font-bold border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#FF6F61] transition text-lg"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-[68%] right-[0%] transform -translate-y-1/2 text-[#FF6F61] hover:text-[#FF6F61] focus:outline-none"
              aria-label={showPassword ? "Rejtse el a jelszót" : "Jelszó megjelenítése"}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.94 17.94a9.969 9.969 0 01-5.94 1.88c-5 0-9-7-9-7a13.57 13.57 0 013.36-4.74"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3l18 18"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5c5 0 9 7 9 7s-4 7-9 7-9-7-9-7 4-7 9-7z"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            ref={submitButtonRef}
            className="w-full bg-[#FF6F61] hover:bg-[#F1C40F] text-white py-3 rounded-full font-extrabold text-lg uppercase tracking-wide transition"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Regisztráció
          </button>
        </form>

        <p
          ref={infoContainerRef}
          className="mt-8 text-base text-center font-bold text-[#333333]"
          style={{ fontFamily: "Karla, sans-serif" }}
        >
          Már van fiókod?{" "}
          <a
            href="/"
            className="underline text-[#FF6F61] font-bold hover:text-[#D35400]"
          >
            Bejelentkezés
          </a>
        </p>
      </div>
    </div>
  );
}
