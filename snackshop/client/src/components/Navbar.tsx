import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      <nav
        className="w-full bg-[#FFF5E4] shadow-md px-6 py-4 fixed top-0 left-0 z-50"
        style={{ fontFamily: "Karla, sans-serif" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <img
              src="/images/snackshop_logo (1).png"
              alt="SnackShop"
              className="h-10 w-auto transform scale-[2.5] lg:scale-[3] origin-left"
              style={{ marginTop: "0.2rem" }}
            />
          </div>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="lg:hidden text-[#FF6F61] hover:text-[#F1C40F] p-2 active:scale-95 transition-transform duration-200 focus:outline-none"
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          <div
            className={[
              "absolute lg:static top-full left-0 w-full lg:w-auto bg-[#FFF5E4] lg:bg-transparent",
              "origin-top transform transition-all duration-300 ease-in-out",
              menuOpen ? "scale-y-100 opacity-100 shadow-lg" : "scale-y-0 opacity-0",
              "lg:scale-y-100 lg:opacity-100 lg:shadow-none lg:transform-none lg:transition-none",
            ].join(" ")}
          >
            {user && (
              <div className="flex flex-col lg:flex-row items-center gap-4 p-4 lg:p-0">
                {user.isAdmin && (
                  <>
                    <Link
                      to="/orders"
                      onClick={() => setMenuOpen(false)}
                      className="block lg:inline-block bg-[#FF6F61] hover:bg-[#F1C40F] text-white hover:text-white uppercase tracking-wide px-4 py-2 rounded-full font-bold transition"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Rendelések
                    </Link>

                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="block lg:inline-block bg-[#FF6F61] hover:bg-[#F1C40F] text-white hover:text-white uppercase tracking-wide px-4 py-2 rounded-full font-bold transition"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Admin kezdőlap
                    </Link>

                    <Link
                      to="/users"
                      onClick={() => setMenuOpen(false)}
                      className="block lg:inline-block bg-[#FF6F61] hover:bg-[#F1C40F] text-white hover:text-white uppercase tracking-wide px-4 py-2 rounded-full font-bold transition"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Felhasználók
                    </Link>

                    <span className="text-[#333333] mx-2 hidden lg:inline">|</span>
                  </>
                )}

                {!user.isAdmin && (
                  <>
                    <span
                      className="hidden lg:inline bg-[#FF6F61] text-white uppercase tracking-wide px-4 py-2 rounded-full font-bold select-none"
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        userSelect: "none",
                        pointerEvents: "none",
                      }}
                    >
                      {user.username}
                    </span>
                    <span className="hidden lg:inline text-[#333333] mx-2">|</span>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="block lg:inline-block bg-[#FF6F61] hover:bg-[#F1C40F] text-white uppercase tracking-wide px-4 py-2 rounded-full font-bold transition"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Kijelentkezés
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <div className="h-16" />
    </>
  );
}
