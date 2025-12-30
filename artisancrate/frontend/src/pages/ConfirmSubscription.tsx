import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePlanSelectionStore } from "../store/planSelectionStore";
import { api } from "../lib/api";
import type { UserAddress } from "../types/address";
import type { ApiResponse } from "../types/common";
import type { UserSubscription } from "../types/subscription";
import type { Invoice } from "../types/invoice";
import { formatPriceIDR } from "../lib/format";
import { AxiosError } from "axios";

interface CreateSubscriptionResponse {
  subscription: UserSubscription;
  initialInvoice: Invoice;
}

function ConfirmSubscriptionPlan() {
  const { selectedPlan, clearSelectedPlan } = usePlanSelectionStore();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPlan) {
      navigate("/");
    }
  }, [selectedPlan, navigate]);

  useEffect(() => {
    const loadAddresses = async () => {
      setLoadingAddresses(true);
      setError(null);
      try {
        const res = await api.get<ApiResponse<UserAddress[]>>("/me/addresses");
        const list = res.data.data;
        setAddresses(list);
        if (list.length > 0) {
          const defaultAddr = list.find((a) => a.isDefault) ?? list[0];
          setSelectedAddressId(defaultAddr.id);
        }
      } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message =
          err?.response?.data?.message ??
          "Gagal memuat alamat pengiriman. Tambahkan alamat di halaman profil";
        setError(message);
      } finally {
        setLoadingAddresses(false);
      }
    };

    loadAddresses();
  }, []);

  if (!selectedPlan) return <div>Mengarahkan...</div>;

  const handleConfirm = async () => {
    if (!selectedAddressId) {
      alert("Pilih alamat pengiriman terlebih dahulu");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post<ApiResponse<CreateSubscriptionResponse>>(
        "/subscriptions",
        {
          subscription_plan_id: selectedPlan.id,
          shipping_address_id: selectedAddressId,
          payment_method_type: "manual_payment_link",
        }
      );
      const { initialInvoice } = res.data.data;

      clearSelectedPlan();

      if (initialInvoice.midtransPaymentLink) {
        window.location.href = initialInvoice.midtransPaymentLink;
      } else {
        alert("Subscription berhasil dibuat tetapi tidak ada payment link");
        navigate("/subscriptions");
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message =
        err?.response?.data?.message ??
        "Gagal membuat subscription. coba lagi?";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 500 }}>
      <h2>Konfirmasi Langganan</h2>
      {error && <p style={{ color: "red", marginBottom: "0.5rem" }}>{error}</p>}

      <section>
        <h3>Paket</h3>
        <h4>{selectedPlan.name}</h4>
        {selectedPlan.description && <p>{selectedPlan.description}</p>}
        <p>
          Harga: <strong>{formatPriceIDR(selectedPlan.price)}</strong>
        </p>

        <h4>Isi Paket</h4>
        {selectedPlan.items?.length ? (
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
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h3>Alamat Pengiriman</h3>
        {loadingAddresses && <p>Memuat alamat...</p>}
        {!loadingAddresses && addresses.length === 0 && (
          <p>
            Belum ada alamat, silahkan tambahkan alamat di halaman{" "}
            <Link to={"/profile"}>Profil</Link> terlebih dahulu
          </p>
        )}

        {!loadingAddresses && addresses.length > 0 && (
          <div>
            <select
              value={selectedAddressId ?? ""}
              onChange={(e) => setSelectedAddressId(Number(e.target.value))}
            >
              <option value="" disabled>
                Pilih alamat
              </option>
              {addresses.map((addr) => (
                <option key={addr.id} value={addr.id}>
                  {addr.label} - {addr.city}
                </option>
              ))}
            </select>
            <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
              {selectedAddressId &&
                (() => {
                  const addr = addresses.find(
                    (a) => a.id === selectedAddressId
                  );
                  if (!addr) return null;
                  return (
                    <>
                      <p>
                        {addr.recipientName} ({addr.phone})
                      </p>
                      <p>{addr.addressLine1}</p>
                      {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                      <p>
                        {addr.city}, {addr.province} {addr.postalCode}
                      </p>
                    </>
                  );
                })()}
            </div>
          </div>
        )}
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <button
          onClick={handleConfirm}
          disabled={submitting || addresses.length === 0}
        >
          {submitting ? "Membayar..." : "Konfirmasi dan bayar"}
        </button>
      </section>
    </div>
  );
}

export default ConfirmSubscriptionPlan;
