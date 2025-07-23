import { useCart } from "../context/CartContext";
import api from "../services/api";
import { useState } from "react";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [message, setMessage] = useState("");

  const handleOrder = async () => {
    try {
      const res = await api.post("/api/order", { cart });
      clearCart();
      setMessage(`Sikeres rendelés! Összeg: ${res.data.total} Ft`);
    } catch (err) {
      setMessage("Rendelés sikertelen.");
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="mt-8 bg-gray-50 p-4 rounded">
      <h2 className="text-xl font-bold mb-2 text-black">Kosár</h2>
      {cart.length === 0 ? (
        <p className="text-black">A kosár üres.</p>
      ) : (
        <>
          <ul>
            {cart.map((item) => (
              <li key={item.id} className="flex justify-between items-center py-2 text-black">
                <div>
                  {item.name} – {item.price} Ft x
                  <input
                    type="number"
                    min="1"
                    max={item.stock}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                    className="w-12 ml-2 border rounded bg-red-400"
                  />
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500"
                >
                  Törlés
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 font-bold text-black">Végösszeg: {total} Ft</p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleOrder}
              className="bg-green-600 text-white px-4 py-2 rounded"
              disabled={cart.length === 0}
            >
              Rendelés leadása
            </button>
            <button
              onClick={clearCart}
              className="bg-gray-300 text-black px-4 py-2 rounded"
            >
              Kosár ürítése
            </button>
          </div>
          {message && <p className="mt-2 text-blue-600">{message}</p>}
        </>
      )}
    </div>
  );
}
