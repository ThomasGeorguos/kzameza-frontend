import { useEffect, useState } from "react";
import { Mail, Trash2, MailOpen, ChevronDown, Inbox } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "../../config/api.js";

// لو الايميل جيميل، افتح جيميل مباشرة في تاب جديد بدل الـ mailto العادي
const getReplyLink = (msg) => {
  const isGmail = /@gmail\.com$/i.test(msg.email?.trim() || "");
  if (isGmail) {
    const params = new URLSearchParams({
      view: "cm",
      fs: "1",
      to: msg.email,
      su: msg.subject || "",
    });
    return `https://mail.google.com/mail/?${params.toString()}`;
  }
  return `mailto:${msg.email}`;
};

function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    apiFetch("/api/contact", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setMessages(data.messages || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const openMessage = async (msg) => {
    const isOpen = openId === msg._id;
    setOpenId(isOpen ? null : msg._id);

    if (!isOpen && !msg.isRead) {
      try {
        const res = await fetch(`/api/contact/${msg._id}/read`, {
          method: "PATCH",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          setMessages((prev) =>
            prev.map((m) => (m._id === msg._id ? data.contactMessage : m)),
          );
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to delete message");
        return;
      }
      setMessages((prev) => prev.filter((m) => m._id !== id));
      toast.success("Message deleted successfully");
    } catch (err) {
      toast.error(err.message || "Server error");
    } finally {
      setBusyId(null);
      setConfirmDeleteId(null);
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-7 bg-green-500 rounded-full" />
        <h3 className="text-2xl font-black text-gray-800">Messages</h3>
        <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
          {messages.length} total
        </span>
        {unreadCount > 0 && (
          <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 border border-yellow-200 px-2.5 py-1 rounded-full">
            {unreadCount} unread
          </span>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-400/25 flex items-center justify-center mx-auto mb-5">
            <Inbox className="w-7 h-7 text-green-400" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">No messages yet</h2>
          <p className="text-gray-400 text-sm">
            Messages sent from the Contact page will show up here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((msg) => {
            const isOpen = openId === msg._id;
            return (
              <div
                key={msg._id}
                className={`bg-[#0B3D4A] border rounded-2xl overflow-hidden transition-colors duration-200 ${
                  msg.isRead ? "border-white/10" : "border-green-400/30"
                }`}
              >
                <button
                  onClick={() => openMessage(msg)}
                  className="w-full flex flex-wrap items-center gap-4 p-5 text-left cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-green-500/15 border border-green-400/25 flex items-center justify-center shrink-0">
                    {msg.isRead ? (
                      <MailOpen className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Mail className="w-4 h-4 text-green-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-[180px]">
                    <p
                      className={`text-sm font-bold ${msg.isRead ? "text-gray-300" : "text-white"}`}
                    >
                      {msg.name}{" "}
                      {!msg.isRead && (
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block ml-1" />
                      )}
                    </p>
                    <p className="text-gray-500 text-xs">{msg.email}</p>
                    {msg.phone && (
                      <p className="text-gray-500 text-xs">{msg.phone}</p>
                    )}
                  </div>

                  <p className="text-gray-400 text-xs flex-1 min-w-[160px] truncate">
                    {msg.subject || "No subject"}
                  </p>

                  <p className="text-gray-500 text-xs shrink-0">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </p>

                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-white/10 p-5 flex flex-col gap-4">
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </p>
                    <div className="flex items-center gap-3">
                      <a
                        href={getReplyLink(msg)}
                        target={
                          /@gmail\.com$/i.test(msg.email?.trim() || "")
                            ? "_blank"
                            : undefined
                        }
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Reply by Email
                      </a>
                      <button
                        onClick={() => setConfirmDeleteId(msg._id)}
                        disabled={busyId === msg._id}
                        className="flex items-center gap-2 bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-gray-300 text-xs font-bold px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-5">
              <Trash2 className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-gray-800 font-black text-lg mb-2">
              Delete Message
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Are you sure you want to delete this message? This can't be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all duration-200 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Messages;
