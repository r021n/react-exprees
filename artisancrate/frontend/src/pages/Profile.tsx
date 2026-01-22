import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import type { User } from "../types/auth";
import type { UserAddress } from "../types/address";
import type { ApiResponse } from "../types/common";
import { AxiosError } from "axios";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Alert } from "../components/ui/Alert";

interface ProfileForm {
  name: string;
  phone: string;
}

interface AddressForm {
  label: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

function emptyAddressForm(): AddressForm {
  return {
    label: "",
    recipientName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Indonesia",
    isDefault: false,
  };
}

function Profile() {
  const { user: authUser, setAuth, token } = useAuthStore();

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: authUser?.name ?? "",
    phone: authUser?.phone ?? "",
  });
  const [profileLoading, setProfileLoading] = useState(!authUser);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressesError, setAddressesError] = useState<string | null>(null);

  const [newAddressForm, setNewAddressForm] =
    useState<AddressForm>(emptyAddressForm());
  const [creatingAddress, setCreatingAddress] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);

  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(
    null,
  );
  const [editingAddressForm, setEditingAddressForm] =
    useState<AddressForm>(emptyAddressForm());
  const [updatingAddress, setUpdatingAddress] = useState(false);

  const loadProfile = async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const res = await api.get<ApiResponse<User>>("/me");
      const user = res.data.data;

      if (token) {
        setAuth(user, token);
      }
      setProfileForm({ name: user.name, phone: user.phone ?? "" });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message = err?.response?.data?.message ?? "Gagal memuat profil";
      setProfileError(message);
    } finally {
      setProfileLoading(false);
    }
  };

  const loadAddresses = async () => {
    setAddressesLoading(true);
    setAddressesError(null);
    try {
      const res = await api.get<ApiResponse<UserAddress[]>>("/me/addresses");
      setAddresses(res.data.data);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message =
        err.response?.data?.message ?? "Gagal memuat alamat pengiriman";
      setAddressesError(message);
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    loadAddresses();
    // eslint-disable-next-line
  }, []);

  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const res = await api.put<{ success: boolean; data: User }>(
        "/me",
        profileForm,
      );
      const updated = res.data.data;
      if (token) {
        setAuth(updated, token);
      }
      setProfileSuccess("Profil berhasil diperbarui");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message = err?.response?.data?.message ?? "Gagal update profil";
      setProfileError(message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleNewAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    // eslint-disable-next-line
    const { name, value, type, checked } = e.target as any;
    setNewAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateAddress = async (e: FormEvent) => {
    e.preventDefault();
    setCreatingAddress(true);
    try {
      await api.post("/me/addresses", newAddressForm);
      setNewAddressForm(emptyAddressForm());
      setShowAddAddress(false);
      await loadAddresses();
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message =
        err.response?.data?.message ?? "Gagal menambahkan alamat baru";
      alert(message);
    } finally {
      setCreatingAddress(false);
    }
  };

  const startEditAddress = (addr: UserAddress) => {
    setEditingAddress(addr);
    setEditingAddressForm({
      label: addr.label,
      recipientName: addr.recipientName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 ?? "",
      city: addr.city,
      province: addr.province,
      postalCode: addr.postalCode,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setShowAddAddress(false);
  };

  const handleEditAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    // eslint-disable-next-line
    const { name, value, type, checked } = e.target as any;
    setEditingAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdateAddress = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingAddress) return;
    setUpdatingAddress(true);

    try {
      await api.put(`/me/addresses/${editingAddress.id}`, editingAddressForm);
      setEditingAddress(null);
      loadAddresses();
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message = err.response?.data?.message ?? "Gagal memperbarui alamat";
      alert(message);
    } finally {
      setUpdatingAddress(false);
    }
  };

  const handleDeleteAddress = async (addr: UserAddress) => {
    if (!window.confirm(`Hapus alamat ${addr.label} di ${addr.city}?`)) {
      return;
    }

    try {
      await api.delete(`/me/addresses/${addr.id}`);
      await loadAddresses();
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message = err.response?.data?.message ?? "Gagal menghapus alamat";
      alert(message);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Pengaturan Akun</h2>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Section */}
        <div className="md:col-span-1">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Profil Saya
            </h3>
            {profileError && (
              <Alert variant="error" className="mb-4">
                {profileError}
              </Alert>
            )}
            {profileSuccess && (
              <Alert variant="success" className="mb-4">
                {profileSuccess}
              </Alert>
            )}

            {profileLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <Input
                  label="Nama Lengkap"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  required
                />
                <Input
                  label="Nomor Telepon"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                />
                <Button
                  type="submit"
                  disabled={profileSaving}
                  isLoading={profileSaving}
                  className="w-full"
                >
                  Simpan Perubahan
                </Button>
              </form>
            )}
          </Card>
        </div>

        {/* Addresses Section */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Buku Alamat</h3>
            {!showAddAddress && !editingAddress && (
              <Button size="sm" onClick={() => setShowAddAddress(true)}>
                + Tambah Alamat
              </Button>
            )}
          </div>

          {addressesError && <Alert variant="error">{addressesError}</Alert>}

          {showAddAddress && (
            <Card className="border-indigo-100 bg-indigo-50/30">
              <h4 className="font-medium text-gray-900 mb-4">
                Tambah Alamat Baru
              </h4>
              <AddressFormFields
                form={newAddressForm}
                onChange={handleNewAddressChange}
                onSubmit={handleCreateAddress}
                loading={creatingAddress}
                onCancel={() => setShowAddAddress(false)}
                submitLabel="Simpan Alamat"
              />
            </Card>
          )}

          {editingAddress && (
            <Card className="border-indigo-100 bg-indigo-50/30">
              <h4 className="font-medium text-gray-900 mb-4">Edit Alamat</h4>
              <AddressFormFields
                form={editingAddressForm}
                onChange={handleEditAddressChange}
                onSubmit={handleUpdateAddress}
                loading={updatingAddress}
                onCancel={() => setEditingAddress(null)}
                submitLabel="Simpan Perubahan"
              />
            </Card>
          )}

          {addressesLoading && !addresses.length ? (
            <p className="text-gray-500">Memuat alamat...</p>
          ) : addresses.length === 0 && !showAddAddress ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">Belum ada alamat tersimpan</p>
              <Button
                variant="secondary"
                onClick={() => setShowAddAddress(true)}
              >
                Tambah Alamat Sekarang
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`relative rounded-lg border p-4 transition-all ${
                    addr.isDefault
                      ? "border-indigo-300 bg-indigo-50/20 ring-1 ring-indigo-300"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold text-gray-900">
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                        Utama
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mb-4 leading-relaxed">
                    <p className="font-medium text-gray-800">
                      {addr.recipientName}{" "}
                      <span className="text-gray-500 font-normal">
                        ({addr.phone})
                      </span>
                    </p>
                    <p>{addr.addressLine1}</p>
                    {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                    <p>
                      {addr.city}, {addr.province} {addr.postalCode}
                    </p>
                    <p>{addr.country}</p>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => startEditAddress(addr)}
                      className="text-xs h-8"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteAddress(addr)}
                      className="text-xs h-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddressFormFields({
  form,
  onChange,
  onSubmit,
  loading,
  onCancel,
  submitLabel,
}: {
  form: AddressForm;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Label Alamat"
          placeholder="Rumah, Kantor"
          name="label"
          value={form.label}
          onChange={onChange}
          required
          className="bg-white"
        />
        <Input
          label="Nama Penerima"
          name="recipientName"
          value={form.recipientName}
          onChange={onChange}
          required
          className="bg-white"
        />
        <Input
          label="Nomor Telepon"
          name="phone"
          value={form.phone}
          onChange={onChange}
          required
          className="bg-white"
        />
        <Input
          label="Negara"
          name="country"
          value={form.country}
          onChange={onChange}
          className="bg-white"
        />
      </div>
      <Input
        label="Alamat Lengkap"
        name="addressLine1"
        value={form.addressLine1}
        onChange={onChange}
        required
        className="bg-white"
      />
      <Input
        label="Detail Tambahan (Opsional)"
        placeholder="Patokan, Gedung, dll"
        name="addressLine2"
        value={form.addressLine2}
        onChange={onChange}
        className="bg-white"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          label="Kota"
          name="city"
          value={form.city}
          onChange={onChange}
          required
          className="bg-white"
        />
        <Input
          label="Provinsi"
          name="province"
          value={form.province}
          onChange={onChange}
          required
          className="bg-white"
        />
        <Input
          label="Kode Pos"
          name="postalCode"
          value={form.postalCode}
          onChange={onChange}
          required
          className="bg-white"
        />
      </div>
      <div className="flex items-center">
        <input
          id="isDefault"
          type="checkbox"
          name="isDefault"
          checked={form.isDefault}
          onChange={onChange}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
          Jadikan alamat utama
        </label>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} isLoading={loading}>
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}

export default Profile;
