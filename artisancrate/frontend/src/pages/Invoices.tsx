import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { ApiResponse } from "../types/common";
import type { Invoice } from "../types/invoice";
import { formatDate, formatPriceIDR } from "../lib/format";
import { AxiosError } from "axios";

function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);

  const navigate = useNavigate();

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
        `/invoices/${inv.id}/pay`
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
    <div>
      <h2>Invoice</h2>
      {loading && <p>Memuat invoice...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && invoices.length === 0 && <p>Belum ada invoice</p>}

      {!loading && !error && invoices.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ddd" }}>Nomor</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Jumlah</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Status</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Jatuh Tempo</th>
              <th style={{ borderBottom: "1px solid #ddd" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td style={{ padding: "0.5rem 0" }}>
                  <button
                    style={{ textDecoration: "underline", cursor: "pointer" }}
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                  >
                    {inv.invoiceNumber}
                  </button>
                </td>
                <td>{formatPriceIDR(inv.amount)}</td>
                <td>{inv.status}</td>
                <td>{formatDate(inv.dueDate)}</td>
                <td>
                  {inv.status === "pending" && (
                    <button
                      disabled={payingId === inv.id}
                      onClick={() => handlePay(inv)}
                    >
                      {payingId === inv.id ? "Memproses..." : "Bayar"}
                    </button>
                  )}
                  {inv.status === "paid" && <span>Sudah dibayar...</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Invoices;
