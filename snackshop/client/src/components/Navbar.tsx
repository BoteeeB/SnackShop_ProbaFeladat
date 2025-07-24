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
      <nav className="w-full bg-white shadow-md px-4 py-3 fixed top-0 left-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-blue-700">SnackShop</h1>
            {user && (
              <span className="hidden md:inline text-gray-600">
                Bejelentkezve mint: <strong>{user.username}</strong>
              </span>
            )}
          </div>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden text-gray-700 p-1 active:scale-90 transition-transform duration-200 focus:outline-none"
          >
            {menuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8h16M4 16h16"
                />
              </svg>
            )}
          </button>

          <div
            className={[
              "absolute md:static top-full left-0 w-full md:w-auto bg-white md:bg-transparent",
              "origin-top transform transition-all duration-300 ease-in-out",
              menuOpen
                ? "scale-y-100 opacity-100 shadow-lg"
                : "scale-y-0 opacity-0",
              "md:scale-y-100 md:opacity-100 md:shadow-none md:transform-none md:transition-none",
            ].join(" ")}
          >
            {user && (
              <div className="flex flex-col md:flex-row items-center md:gap-4 p-4 md:p-0">
                {/* Mobile user info */}
                <span className="md:hidden text-gray-600 mb-2">
                  Bejelentkezve: <strong>{user.username}</strong>
                </span>

                {user.isAdmin && (
                  <>
                    <Link
                      to="/orders"
                      onClick={() => setMenuOpen(false)}
                      className="block md:inline-block bg-blue-600 hover:bg-blue-700 text-white hover:text-white font-semibold px-4 py-2 rounded-xl hover:rounded-md transition-all duration-300 mb-2 md:mb-0"
                    >
                      Rendelések
                    </Link>
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="block md:inline-block bg-blue-600 hover:bg-blue-700 text-white hover:text-white font-semibold px-4 py-2 rounded-xl hover:rounded-md transition-all duration-300 mb-2 md:mb-0"
                    >
                      Admin kezdőlap
                    </Link>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="block md:inline-block bg-red-500 hover:bg-red-600 text-white hover:text-white font-semibold px-4 py-2 rounded-xl hover:rounded-md transition-all duration-300"
                >
                  Kijelentkezés
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <div className="h-12 md:h-12" />
    </>
  );
}
