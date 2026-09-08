import { useState, useMemo } from "react";

const MENU = [
  {
    category: "Coffee",
    items: [
      { name: "Cappuccino", price: 120 },
      { name: "Filter Coffee", price: 60 },
    ],
  },
  {
    category: "Snacks",
    items: [{ name: "Sandwich", price: 90 }],
  },
];

const ORDER_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxhA6BA8P1iKmkEJIcrWLubco8BOg9ye8xI7C97rPVh99P-D6_vG8Oo2HGv6QyOiBzZ/exec";

export default function CafeOrderApp() {
  const [cart, setCart] = useState({});
  const [orderStatus, setOrderStatus] = useState("idle"); // idle | submitting | confirmed | error
  const [errorMessage, setErrorMessage] = useState("");

  const tableNumber = useMemo(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("table");
  }, []);

  const addItem = (name) => {
    setCart((prev) => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
  };

  const removeItem = (name) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[name] <= 1) {
        delete next[name];
      } else {
        next[name] -= 1;
      }
      return next;
    });
  };

  const priceByName = useMemo(() => {
    const map = {};
    MENU.forEach((cat) => cat.items.forEach((item) => (map[item.name] = item.price)));
    return map;
  }, []);

  const cartEntries = Object.entries(cart);
  const total = cartEntries.reduce((sum, [name, qty]) => sum + priceByName[name] * qty, 0);
  const itemCount = cartEntries.reduce((sum, [, qty]) => sum + qty, 0);

  const placeOrder = async () => {
    setOrderStatus("submitting");
    setErrorMessage("");
    try {
      const res = await fetch(ORDER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          table: tableNumber,
          items: cartEntries.map(([name, qty]) => ({
            name,
            quantity: qty,
            price: priceByName[name],
          })),
          total,
        }),
      });
      if (!res.ok) throw new Error("Request failed with status " + res.status);
      setOrderStatus("confirmed");
      setCart({});
    } catch (err) {
      setOrderStatus("error");
      setErrorMessage(
        "Couldn't send your order (" + err.message + "). Please try again, or ask staff for help."
      );
    }
  };

  const startNewOrder = () => {
    setOrderStatus("idle");
    setErrorMessage("");
  };

  return (
    <div className="order-app">
      <style>{`
        .order-app {
          --paper: #F7F2E7;
          --ink: #33241C;
          --rust: #B0472E;
          --moss: #4B5A3D;
          --line: #D9CDB8;
          background: var(--paper);
          color: var(--ink);
          min-height: 100vh;
          font-family: 'Work Sans', -apple-system, sans-serif;
          padding-bottom: ${cartEntries.length ? "180px" : "40px"};
          box-sizing: border-box;
        }
        .order-app * { box-sizing: border-box; }
        .order-app .header {
          padding: 28px 20px 18px;
          border-bottom: 1px solid var(--line);
        }
        .order-app .header h1 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 26px;
          font-weight: 600;
          margin: 0 0 4px;
          letter-spacing: 0.2px;
        }
        .order-app .header p {
          margin: 0;
          font-size: 13px;
          color: #6b5c4f;
        }
        .order-app .table-badge {
          display: inline-block;
          margin-top: 10px;
          font-family: 'Fraunces', Georgia, serif;
          font-size: 14px;
          font-weight: 600;
          padding: 5px 12px;
          border: 1px solid var(--moss);
          color: var(--moss);
          border-radius: 3px;
        }
        .order-app .menu {
          max-width: 480px;
          margin: 0 auto;
          padding: 8px 20px 0;
        }
        .order-app .category {
          margin-top: 26px;
        }
        .order-app .category h2 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 10px;
          padding-bottom: 8px;
          border-bottom: 1px dashed var(--line);
          color: var(--moss);
        }
        .order-app .item-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid var(--line);
        }
        .order-app .item-row:last-child { border-bottom: none; }
        .order-app .item-info { display: flex; flex-direction: column; gap: 2px; }
        .order-app .item-name { font-size: 15px; }
        .order-app .item-price {
          font-size: 13px;
          color: #6b5c4f;
          font-variant-numeric: tabular-nums;
        }
        .order-app .add-btn {
          border: 1px solid var(--rust);
          color: var(--rust);
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          padding: 7px 16px;
          border-radius: 3px;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .order-app .add-btn:hover { background: var(--rust); color: var(--paper); }
        .order-app .add-btn:focus-visible {
          outline: 2px solid var(--moss);
          outline-offset: 2px;
        }

        .order-app .cart {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--ink);
          color: var(--paper);
          border-top: 2px dashed var(--rust);
        }
        .order-app .cart-inner {
          max-width: 480px;
          margin: 0 auto;
          padding: 14px 20px 18px;
        }
        .order-app .cart-list {
          max-height: 130px;
          overflow-y: auto;
          margin-bottom: 10px;
        }
        .order-app .cart-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
          padding: 6px 0;
        }
        .order-app .cart-line-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .order-app .qty-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          font-variant-numeric: tabular-nums;
        }
        .order-app .qty-btn {
          background: transparent;
          border: 1px solid #6b5c4f;
          color: var(--paper);
          width: 22px;
          height: 22px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 13px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .order-app .qty-btn:focus-visible {
          outline: 2px solid #E8B14C;
          outline-offset: 2px;
        }
        .order-app .cart-line-price {
          font-variant-numeric: tabular-nums;
          font-size: 14px;
        }
        .order-app .cart-total-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding-top: 10px;
          border-top: 1px solid #5a4a3c;
        }
        .order-app .cart-total-label {
          font-size: 13px;
          color: #c9bba9;
        }
        .order-app .cart-total-value {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 22px;
          font-variant-numeric: tabular-nums;
        }
        .order-app .place-order-btn {
          width: 100%;
          margin-top: 12px;
          background: #E8B14C;
          color: var(--ink);
          border: none;
          padding: 13px;
          font-size: 15px;
          font-weight: 600;
          border-radius: 3px;
          cursor: pointer;
        }
        .order-app .place-order-btn:focus-visible {
          outline: 2px solid var(--paper);
          outline-offset: 2px;
        }
        .order-app .empty-cart-hint {
          text-align: center;
          font-size: 13px;
          color: #6b5c4f;
          padding: 20px;
        }
        .order-app .place-order-btn:disabled {
          opacity: 0.65;
          cursor: default;
        }
        .order-app .error-banner {
          background: #4a2822;
          color: #F0C9BE;
          font-size: 13px;
          padding: 9px 12px;
          border-radius: 3px;
          margin-top: 12px;
        }
        .order-app .confirmation-overlay {
          position: fixed;
          inset: 0;
          background: var(--paper);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .order-app .confirmation-card {
          max-width: 340px;
          text-align: center;
        }
        .order-app .confirmation-card h2 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 26px;
          font-weight: 600;
          margin: 0 0 12px;
          color: var(--moss);
        }
        .order-app .confirmation-card p {
          font-size: 14px;
          color: #6b5c4f;
          line-height: 1.5;
          margin: 0 0 22px;
        }
        .order-app .confirmation-card .place-order-btn {
          width: auto;
          padding: 12px 24px;
        }
      `}</style>

      <div className="header">
        <h1>Threads &amp; Needles Cafe</h1>
        <p>Tap "Add" on anything you'd like — your order builds up below.</p>
        <span className="table-badge">{tableNumber ? `Table ${tableNumber}` : "Table: unknown"}</span>
      </div>

      <div className="menu">
        {MENU.map((cat) => (
          <div className="category" key={cat.category}>
            <h2>{cat.category}</h2>
            {cat.items.map((item) => (
              <div className="item-row" key={item.name}>
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-price">₹{item.price}</span>
                </div>
                <button className="add-btn" onClick={() => addItem(item.name)}>
                  Add
                </button>
              </div>
            ))}
          </div>
        ))}
        {!cartEntries.length && (
          <div className="empty-cart-hint">Your cart is empty — add something from the menu.</div>
        )}
      </div>

      {cartEntries.length > 0 && (
        <div className="cart">
          <div className="cart-inner">
            <div className="cart-list">
              {cartEntries.map(([name, qty]) => (
                <div className="cart-line" key={name}>
                  <div className="cart-line-left">
                    <span>{name}</span>
                    <div className="qty-controls">
                      <button className="qty-btn" onClick={() => removeItem(name)} aria-label={`Remove one ${name}`}>
                        −
                      </button>
                      <span>{qty}</span>
                      <button className="qty-btn" onClick={() => addItem(name)} aria-label={`Add one ${name}`}>
                        +
                      </button>
                    </div>
                  </div>
                  <span className="cart-line-price">₹{priceByName[name] * qty}</span>
                </div>
              ))}
            </div>
            <div className="cart-total-row">
              <span className="cart-total-label">{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
              <span className="cart-total-value">₹{total}</span>
            </div>
            {orderStatus === "error" && <div className="error-banner">{errorMessage}</div>}
            <button
              className="place-order-btn"
              onClick={placeOrder}
              disabled={orderStatus === "submitting"}
            >
              {orderStatus === "submitting" ? "Sending order…" : "Place Order"}
            </button>
          </div>
        </div>
      )}

      {orderStatus === "confirmed" && (
        <div className="confirmation-overlay">
          <div className="confirmation-card">
            <h2>Order sent</h2>
            <p>
              {tableNumber ? `Table ${tableNumber}'s` : "Your"} order is on its way to the
              kitchen. Sit tight — it'll be with you shortly.
            </p>
            <button className="place-order-btn" onClick={startNewOrder}>
              Start a new order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
