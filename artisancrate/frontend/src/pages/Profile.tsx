import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import type { User } from "../types/auth";
import type { UserAddress } from "../types/address";
import type { ApiResponse } from "../types/common";
import { AxiosError } from "axios";

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

  const handleDeletAddress = async (addr: UserAddress) => {
    if (!window.confirm(`Hapus alamat ${addr.label} di ${addr.city}`)) {
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

  if (loading) return <div>Memuat profil...</div>;

  return (
    <div style={{ maxWidth: 400 }}>
      <h2>Profil</h2>
      {error && <p style={{ color: "red", marginBottom: "0.5rem" }}>{error}</p>}
      {success && (
        <p style={{ color: "green", marginBottom: "0.5rem" }}>{success}</p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>Nama</label>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>Telepon</label>
          <input
            type="text"
            name="phone"
            required
            value={form.phone}
            onChange={handleChange}
            style={{ width: "100%" }}
          />
        </div>
        <button type="submit" disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </div>
  );
}

export default Profile;
