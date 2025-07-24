import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <nav className="w-full bg-white shadow-md p-4 flex justify-between items-center fixed top-0 left-0 z-50">
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-bold text-blue-700">SnackShop</h1>

        {user && (
          <span className="text-gray-600 text-md">
            Bejelentkezve mint: <strong>{user.username}</strong>
          </span>
        )}
      </div>

      {user && (
        <div className="flex items-center gap-4">
          {user.isAdmin && (
            <>
              <Link
                to="/orders"
                className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white font-semibold px-4 py-2 rounded-xl hover:rounded-md transition-all duration-300"
              >
                Rendelések
              </Link>
              <Link
                to="/admin"
                className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white font-semibold px-4 py-2 rounded-xl hover:rounded-md transition-all duration-300"
              >
                Admin kezdőlap
              </Link>
              <span className="text-gray-300 select-none">|</span>
            </>
          )}

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-xl hover:rounded-md transition-all duration-300"
          >
            Kijelentkezés
          </button>
        </div>
      )}
    </nav>
  );
}
