// web/src/components/Toaster.jsx
import { useEffect, useState } from "react";

export default function Toaster(){
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function onToast(e){
      const id = Math.random().toString(36).slice(2);
      const msg = e.detail?.msg || "Quest completed!";
      setToasts(t => [...t, { id, msg }]);
      // Auto-remove after 1.8s
      setTimeout(() => {
        setToasts(t => t.filter(x => x.id !== id));
      }, 1800);
    }
    window.addEventListener("dq:toast", onToast);
    return () => window.removeEventListener("dq:toast", onToast);
  }, []);

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className="toast">{t.msg}</div>
      ))}
    </div>
  );
}
