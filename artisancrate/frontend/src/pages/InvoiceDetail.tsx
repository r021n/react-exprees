import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import type { ApiResponse } from "../types/common";
import type { Invoice } from "../types/invoice";
import { formatDate, formatPriceIDR } from "../lib/format";
import { AxiosError } from "axios";
import { Card } from "../components/ui/Card";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import clsx from "clsx";

function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<Invoice>>(`/invoices/${id}`);
      setInvoice(res.data.data);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message = err?.response?.data?.message ?? "Gagal memuat invoice";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePay = async () => {
    if (!invoice) return;
    setPaying(true);
    try {
      const res = await api.post<ApiResponse<Invoice>>(
        `/invoices/${invoice.id}/pay`,
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
      setPaying(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );

  if (error)
    return (
      <div className="mx-auto max-w-3xl py-8">
        <Alert variant="error">{error}</Alert>
      </div>
    );

  if (!invoice)
    return <div className="text-center py-12">Invoice tidak ditemukan</div>;

  return (
    <div className="mx-auto max-w-3xl py-8">
      <Link
        to="/invoices"
        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-6 block"
      >
        &larr; Kembali ke daftar invoice
      </Link>

      <Card className="p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
            <p className="text-sm text-gray-500 mt-1">
              #{invoice.invoiceNumber}
            </p>
          </div>
          <div className="text-right">
            <span
              className={clsx(
                "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
                invoice.status === "paid"
                  ? "bg-green-100 text-green-800"
                  : invoice.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800",
              )}
            >
              {invoice.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8 border-t border-b py-8">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
              Ditagihkan Kepada
            </h3>
            <div className="text-gray-900 font-medium">
              {invoice.userSubscription?.shippingAddress ? (
                <>
                  <p>
                    {invoice.userSubscription.shippingAddress.recipientName}
                  </p>
                  <p className="text-gray-500 font-normal text-sm mt-1">
                    {invoice.userSubscription.shippingAddress.addressLine1}
                    <br />
                    {invoice.userSubscription.shippingAddress.city},{" "}
                    {invoice.userSubscription.shippingAddress.postalCode}
                  </p>
                </>
              ) : (
                <p className="text-gray-500 italic">Alamat tidak tersedia</p>
              )}
            </div>
          </div>
          <div className="text-right space-y-2">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Tanggal Invoice
              </h3>
              <p className="text-gray-900">{formatDate(invoice.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Jatuh Tempo
              </h3>
              <p className="text-gray-900">{formatDate(invoice.dueDate)}</p>
            </div>
            {invoice.paidAt && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Dibayar Pada
                </h3>
                <p className="text-green-600 font-medium">
                  {formatDate(invoice.paidAt)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
            Rincian Pembayaran
          </h3>
          <div className="flex justify-between items-center py-4 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">
                {invoice.userSubscription?.subscriptionPlan?.name ||
                  "Biaya Langganan"}
              </p>
              {invoice.billingPeriodStart && (
                <p className="text-sm text-gray-500 mt-1">
                  Periode: {formatDate(invoice.billingPeriodStart)} -{" "}
                  {formatDate(invoice.billingPeriodEnd ?? "")}
                </p>
              )}
            </div>
            <p className="font-medium text-gray-900">
              {formatPriceIDR(invoice.amount)}
            </p>
          </div>
          <div className="flex justify-between items-center py-4">
            <p className="text-lg font-bold text-gray-900">Total Tagihan</p>
            <p className="text-2xl font-bold text-indigo-600">
              {formatPriceIDR(invoice.amount)}
            </p>
          </div>
        </div>

        {invoice.status === "pending" && (
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button
              size="lg"
              onClick={handlePay}
              disabled={paying}
              isLoading={paying}
            >
              Bayar Sekarang
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default InvoiceDetail;
