import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { ApiResponse } from "../types/common";
import type { Invoice } from "../types/invoice";
import { formatDate, formatPriceIDR } from "../lib/format";
import { AxiosError } from "axios";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import clsx from "clsx";

function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<Invoice[]>>("/invoices");
      setInvoices(res.data.data);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message = err?.response?.data?.message || "Gagal memuat invoices";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handlePay = async (inv: Invoice) => {
    setPayingId(inv.id);
    try {
      const res = await api.post<ApiResponse<Invoice>>(
        `/invoices/${inv.id}/pay`,
      );
      const updated = res.data.data;
      if (updated.midtransPaymentLink) {
        window.location.href = updated.midtransPaymentLink;
      } else {
        alert("Tidak ada payment link untuk invoice ini");
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message =
        err?.response?.data?.message ?? "Gagal membuat transaksi pembayaran";
      alert(message);
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl py-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Riwayat Invoice</h2>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 animate-pulse rounded-lg"
            ></div>
          ))}
        </div>
      )}

      {error && <Alert variant="error">{error}</Alert>}

      {!loading && !error && invoices.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">Belum ada invoice.</p>
        </div>
      )}

      {!loading && !error && invoices.length > 0 && (
        <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    Nomor Invoice
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Jumlah
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Jatuh Tempo
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-indigo-600 sm:pl-6">
                      <Link
                        to={`/invoices/${inv.id}`}
                        className="hover:text-indigo-900"
                      >
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                      {formatPriceIDR(inv.amount)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={clsx(
                          "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                          inv.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : inv.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800",
                        )}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      {inv.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => handlePay(inv)}
                          disabled={payingId === inv.id}
                          isLoading={payingId === inv.id}
                        >
                          Bayar
                        </Button>
                      )}
                      {inv.status === "paid" && (
                        <span className="text-gray-400 text-xs italic">
                          Lunas
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Invoices;
