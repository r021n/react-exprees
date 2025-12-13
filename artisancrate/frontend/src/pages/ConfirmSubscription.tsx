import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlanSelectionStore } from "../store/planSelectionStore";

function formatPriceIDR(amount: number) {
  return amount.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });
}

function ConfirmSubscriptionPlan() {
  const { selectedPlan } = usePlanSelectionStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedPlan) {
      navigate("/");
    }
  }, [selectedPlan, navigate]);

  if (!selectedPlan) return <div>Mengarahkan...</div>;

  return (
    <div style={{ maxWidth: 500 }}>
      <h2>Konfirmasi Langganan</h2>
      <p>Anda akan berlangganan paket berikut</p>

      <h3>{selectedPlan.name}</h3>
      {selectedPlan.description && <p>{selectedPlan.description}</p>}

      <p>
        <strong>{formatPriceIDR(selectedPlan.price)}</strong>
      </p>

      <h4>Isi Paket</h4>
      {selectedPlan.items.length ? (
        <ul>
          {selectedPlan.items.map((item) => (
            <li key={item.id}>
              {item.quantity}x {item.product.name}
            </li>
          ))}
        </ul>
      ) : (
        <p>Tidak ada detail produk</p>
      )}

      <p style={{ marginTop: "1rem" }}>
        Langkah berikutnya (Chapter 9): pilih alamat pengiriman dan buat
        subscription di backend.
      </p>
    </div>
  );
}

export default ConfirmSubscriptionPlan;
