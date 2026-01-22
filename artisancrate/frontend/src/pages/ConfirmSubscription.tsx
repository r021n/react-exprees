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
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Alert } from "../components/ui/Alert";

interface CreateSubscriptionResponse {
  subscription: UserSubscription;
  initialInvoice: Invoice;
}

function ConfirmSubscriptionPlan() {
  const { selectedPlan, clearSelectedPlan } = usePlanSelectionStore();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
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
        },
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
    <div className="mx-auto max-w-4xl py-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Konfirmasi Langganan
      </h2>
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* Plan Summary */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Ringkasan Paket
          </h3>
          <Card>
            <h4 className="text-xl font-bold text-gray-900">
              {selectedPlan.name}
            </h4>
            {selectedPlan.description && (
              <p className="text-gray-600 mt-2">{selectedPlan.description}</p>
            )}

            <div className="my-6 border-t border-b py-4">
              <div className="flex justify-between items-center text-lg">
                <span className="font-medium text-gray-900">Harga</span>
                <span className="font-bold text-indigo-600">
                  {formatPriceIDR(selectedPlan.price)}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <h5 className="font-medium text-gray-900 mb-3">Isi Paket:</h5>
              {selectedPlan.items?.length ? (
                <ul className="space-y-3">
                  {selectedPlan.items.map((item) => (
                    <li key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.product.name}</span>
                      <span className="font-medium text-gray-900">
                        {item.quantity}x
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  Tidak ada detail produk
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Shipping & Payment */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Pengiriman</h3>
          <Card>
            {loadingAddresses ? (
              <p className="text-gray-500 text-sm">Memuat alamat...</p>
            ) : addresses.length === 0 ? (
              <Alert variant="warning">
                Belum ada alamat tersimpan.
                <Link
                  to="/profile"
                  className="block mt-2 font-medium underline"
                >
                  + Tambah Alamat di Profil
                </Link>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Alamat Pengiriman
                  </label>
                  <select
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    value={selectedAddressId ?? ""}
                    onChange={(e) =>
                      setSelectedAddressId(Number(e.target.value))
                    }
                  >
                    <option value="" disabled>
                      -- Pilih Alamat --
                    </option>
                    {addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label} - {addr.recipientName}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedAddressId && (
                  <div className="rounded-md bg-gray-50 p-4 border border-gray-200 text-sm">
                    {(() => {
                      const addr = addresses.find(
                        (a) => a.id === selectedAddressId,
                      );
                      if (!addr) return null;
                      return (
                        <div className="space-y-1 text-gray-600">
                          <p className="font-medium text-gray-900">
                            {addr.recipientName} ({addr.phone})
                          </p>
                          <p>{addr.addressLine1}</p>
                          {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                          <p>
                            {addr.city}, {addr.province} {addr.postalCode}
                          </p>
                          <p>{addr.country}</p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 pt-6 border-t">
              <Button
                onClick={handleConfirm}
                disabled={
                  submitting || addresses.length === 0 || !selectedAddressId
                }
                isLoading={submitting}
                className="w-full"
                size="lg"
              >
                Konfirmasi & Bayar
              </Button>
              <p className="mt-3 text-xs text-center text-gray-500">
                Anda akan diarahkan ke halaman pembayaran amamn.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ConfirmSubscriptionPlan;
