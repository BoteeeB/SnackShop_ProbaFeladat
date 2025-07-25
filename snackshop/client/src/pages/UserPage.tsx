import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { Settings } from "lucide-react";

interface User {
  id: string;
  username: string;
  isAdmin: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [openPopupId, setOpenPopupId] = useState<string | null>(null);
  const userRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const deleteMessageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    api.get("/api/users").then((res) => {
      const mappedUsers = res.data.map((user: any) => ({
        id: user.id,
        username: user.username,
        isAdmin: !!user.is_admin,
      }));
      setUsers(mappedUsers);
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.set(userRefs.current, { opacity: 0, y: 20 });
    requestAnimationFrame(() => {
      gsap.to(userRefs.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });
    });
  }, [users.length]);

  const handleCogClick = (userId: string) => {
    const isSame = openPopupId === userId;

    if (isSame) {
      const popup = popupRefs.current[userId];
      if (popup) {
        gsap.to(popup, {
          opacity: 0,
          scale: 0.9,
          duration: 0.2,
          ease: "power1.in",
          onComplete: () => setOpenPopupId(null),
        });
      } else {
        setOpenPopupId(null);
      }
    } else if (openPopupId) {
      const currentPopup = popupRefs.current[openPopupId];
      if (currentPopup) {
        gsap.to(currentPopup, {
          opacity: 0,
          scale: 0.9,
          duration: 0.2,
          ease: "power1.in",
          onComplete: () => setOpenPopupId(userId),
        });
      } else {
        setOpenPopupId(userId);
      }
    } else {
      setOpenPopupId(userId);
    }
  };

  useEffect(() => {
    if (openPopupId) {
      const popup = popupRefs.current[openPopupId];
      if (popup) {
        gsap.fromTo(
          popup,
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            ease: "back.out(1.7)",
          }
        );
      }
    }
  }, [openPopupId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openPopupId &&
        popupRefs.current[openPopupId] &&
        !popupRefs.current[openPopupId]?.contains(event.target as Node)
      ) {
        handleCogClick(openPopupId);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openPopupId]);

  const handleDelete = async (userId: string) => {
    const confirmDelete = window.confirm("Biztosan törölni szeretnéd a fiókot?");
    if (!confirmDelete) return;

    const userToDelete = users.find((u) => u.id === userId);

    try {
      await api.delete(`/api/users/${userId}`);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setOpenPopupId(null);

      if (userToDelete) {
        setDeleteMessage(`A(z) "${userToDelete.username}" nevű fiók törlésre került.`);
      }

      setTimeout(() => {
        if (deleteMessageRef.current) {
          gsap.to(deleteMessageRef.current, {
            opacity: 0,
            y: -10,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => setDeleteMessage(null),
          });
        } else {
          setDeleteMessage(null);
        }
      }, 6000);
    } catch (err) {
      console.error("Törlési hiba:", err);
      alert("Hiba történt a törlés során.");
    }
  };

  useEffect(() => {
    if (deleteMessage && deleteMessageRef.current) {
      gsap.fromTo(
        deleteMessageRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [deleteMessage]);

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
        className="w-full max-w-6xl bg-[#FFF5E4] rounded-3xl shadow-2xl p-8"
      >
        <h1
          className="text-4xl font-extrabold mb-6 text-[#FF6F61] text-center"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Felhasználók
        </h1>

        {deleteMessage && (
          <div
            ref={deleteMessageRef}
            className="mb-6 text-center text-green-800 bg-green-100 border border-green-300 px-4 py-3 rounded-xl shadow-md"
            style={{
              fontFamily: "Karla, sans-serif",
            }}
          >
            {deleteMessage}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user, idx) => (
            <div
              key={user.id}
              ref={(el) => {
                userRefs.current[idx] = el;
              }}
              className="relative bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition"
            >
              {!user.isAdmin && (
                <div className="absolute top-3 right-3 z-10">
                  <Settings
                    onClick={() => handleCogClick(user.id)}
                    className="text-gray-400 hover:text-gray-600 transition-transform duration-300 hover:rotate-45 cursor-pointer"
                    size={20}
                  />
                </div>
              )}

              {openPopupId === user.id && (
                <div
                  ref={(el) => {
                    popupRefs.current[user.id] = el;
                  }}
                  className="absolute top-10 right-4 bg-white rounded-xl shadow-lg p-4 border border-gray-200 z-20"
                  style={{
                    minWidth: "160px",
                    fontFamily: "Karla, sans-serif",
                  }}
                >
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="w-full px-3 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition duration-200"
                  >
                    Fiók törlése
                  </button>
                </div>
              )}

              <h2 className="text-xl font-bold text-[#333333] mb-1">
                {user.username}
              </h2>

              <span
                className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                  user.isAdmin
                    ? "bg-[#FF6F61] text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {user.isAdmin ? "Admin" : "Felhasználó"}
              </span>
            </div>
          ))}

          {users.length === 0 && (
            <p className="text-center text-gray-500 text-lg col-span-full">
              Nincsenek felhasználók.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
