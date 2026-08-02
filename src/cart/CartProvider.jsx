import {
  useState,
  useEffect,
  useMemo,
  useContext,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import { AuthContext } from "../auth/AuthContext";

const calcTotals = (cart) => {
  cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  cart.totalPrice = cart.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  cart.totalAmount = cart.totalPrice;
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const navigate = useNavigate();

  const { user, setUser } = useContext(AuthContext);

  const debounceTimers = useRef({});
  const latestQuantity = useRef({});

  const headers = {
    "Content-Type": "application/json",
  };

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/cart", {
        credentials: "include",
        headers,
      });

      const data = await res.json();

      if (res.ok) {
        setCart(data.cart);
      } else if (res.status === 401 || res.status === 400) {
        setCart(null);
      }
    } catch (err) {
      console.error("Error fetching cart", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [user, fetchCart]);

  const addToCart = async (productId, price) => {
    // لازم يكون عامل لوجين قبل ما نعمل أي تحديث أو نبعت للسيرفر
    if (!user) {
      setShowLoginAlert(true);
      return {
        success: false,
        message: "Please login to add items to your cart",
      };
    }

    // نحتفظ بنسخة من الكارت قبل التعديل عشان نرجعلها فورًا لو السيرفر رفض
    let prevCart;
    // غير الـ UI فوراً
    setCart((prev) => {
      prevCart = prev;
      if (!prev)
        return {
          items: [{ product: { _id: productId }, quantity: 1, price }],
          totalItems: 1,
          totalPrice: price,
          totalAmount: price,
        };
      const itemIndex = prev.items.findIndex(
        (it) => (it.product?._id || it.product).toString() === productId,
      );
      const updated = { ...prev, items: [...prev.items] };
      if (itemIndex > -1) {
        updated.items[itemIndex] = {
          ...updated.items[itemIndex],
          quantity: updated.items[itemIndex].quantity + 1,
        };
      } else {
        updated.items.push({ product: { _id: productId }, quantity: 1, price });
      }
      calcTotals(updated);
      return updated;
    });
    // بعت للباك
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();

      if (res.ok) {
        setCart(data.cart);
      } else {
        // ارجع فورًا لحالة الكارت الصح (مش هنستنى fetchCart لأنه ممكن كمان يفشل لنفس السبب)
        setCart(prevCart ?? null);

        if (res.status === 401 || res.status === 400) {
          // الجلسة منتهية أو غير صالحة - رجّع حالة اليوزر لغير مسجل واطلب منه يسجل دخول تاني
          setUser(null);
          setShowLoginAlert(true);
        }
      }

      return {
        success: res.ok,
        message: data.message,
      };
    } catch (err) {
      setCart(prevCart ?? null);
      return { success: false, message: err.message };
    }
  };

  const updateCart = useCallback(
    (productId, quantity) => {
      latestQuantity.current[productId] = quantity;

      setCart((prev) => {
        if (!prev) return prev;

        const updated = {
          ...prev,
          items: prev.items.map((item) =>
            (item.product?._id || item.product).toString() === productId
              ? { ...item, quantity }
              : item,
          ),
        };

        calcTotals(updated);

        return updated;
      });

      if (debounceTimers.current[productId]) {
        clearTimeout(debounceTimers.current[productId]);
      }

      debounceTimers.current[productId] = setTimeout(async () => {
        const finalQuantity = latestQuantity.current[productId];
        try {
          const res = await fetch("/api/cart", {
            method: "PUT",
            credentials: "include",
            headers,
            body: JSON.stringify({ productId, quantity: finalQuantity }),
          });
          const data = await res.json();

          if (!res.ok) {
            // السيرفر رفض (مثلاً الكمية أكبر من المتاح بالستوك) - رجع الكارت الصح من السيرفر
            await fetchCart();
            return { success: false, message: data.message };
          }
          // ← مش بنعمل setCart هنا خالص لو نجح
        } catch (err) {
          console.error("Error updating cart", err);
          fetchCart(); // بس لو فيه error نعمل refresh
        }
      }, 400);
    },
    [fetchCart],
  );

  const removeFromCart = async (productId) => {
    try {
      if (debounceTimers.current[productId]) {
        clearTimeout(debounceTimers.current[productId]);
        delete debounceTimers.current[productId];
      }

      const res = await fetch("/api/cart", {
        method: "DELETE",
        credentials: "include",
        headers,
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();

      if (res.ok) {
        setCart(data.cart);
      }

      return {
        success: res.ok,
        message: data.message,
        cart: data.cart,
      };
    } catch (err) {
      console.error("Error removing item", err);

      return {
        success: false,
        message: err.message || "Network error",
      };
    }
  };

  const clearCart = async () => {
    try {
      const res = await fetch("/api/cart/clear", {
        method: "DELETE",
        credentials: "include",
        headers,
      });

      const data = await res.json();

      if (res.ok) {
        setCart(data.cart);
      }

      return {
        success: res.ok,
        message: data.message,
        cart: data.cart,
      };
    } catch (err) {
      console.error("Error clearing cart", err);

      return {
        success: false,
        message: err.message || "Network error",
      };
    }
  };

  const totalItems = useMemo(() => {
    return cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }, [cart]);

  const totalPrice = useMemo(() => {
    return (
      cart?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
      0
    );
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        totalItems,
        totalPrice,
        addToCart,
        updateCart,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}

      {/* Login Required Alert - SweetAlert style */}
      {showLoginAlert && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-5">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-gray-800 font-black text-lg mb-2">
              Login Required
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              You need to sign in to your account before adding products to your
              cart.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginAlert(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLoginAlert(false);
                  navigate("/login");
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-green-500 hover:bg-green-600 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30 cursor-pointer"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}
