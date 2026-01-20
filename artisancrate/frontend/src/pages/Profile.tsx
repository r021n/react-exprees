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

  const handleDeleteAddress = async (addr: UserAddress) => {
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

  return (
    <div style={{ maxWidth: 900, display: "grid", gap: "1.5rem" }}>
      <section style={{ maxWidth: 400 }}>
        <h2>Profil</h2>
        {profileError && (
          <p style={{ color: "red", marginBottom: "0.5rem" }}>{profileError}</p>
        )}
        {profileSuccess && (
          <p style={{ color: "green", marginBottom: "0.5rem" }}>
            {profileSuccess}
          </p>
        )}
        {profileLoading ? (
          <p>Memuat profil...</p>
        ) : (
          <form onSubmit={handleProfileSubmit}>
            <div style={{ marginBottom: "0.5rem" }}>
              <label>Name</label>
              <input
                type="text"
                name="name"
                required
                value={profileForm.name}
                onChange={handleProfileChange}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: "0.rem" }}>
              <label>Telepon</label>
              <input
                type="text"
                name="phone"
                value={profileForm.phone}
                onChange={handleProfileChange}
                style={{ width: "100%" }}
              />
            </div>
            <button type="submit" disabled={profileSaving}>
              {profileSaving ? "Menyimpan..." : "Simpan"}
            </button>
          </form>
        )}
      </section>

      <section>
        <h2>Alamat Pengiriman</h2>
        {addressesError && (
          <p style={{ marginBottom: "0.5rem", color: "red" }}>
            {addressesError}
          </p>
        )}
        {addressesLoading ? (
          <p>Memual alamat...</p>
        ) : addresses.length === 0 ? (
          <p>Belum ada alamat, tambahkan alamat di bawah</p>
        ) : (
          <div style={{ marginBottom: "1rem" }}>
            {addresses.map((addr) => (
              <div
                key={addr.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  padding: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <strong>
                  {addr.label} {addr.isDefault ? "(Default)" : ""}
                </strong>
                <div style={{ fontSize: "0.9rem" }}>
                  <p>
                    {addr.recipientName} ({addr.phone})
                  </p>
                  <p>{addr.addressLine1}</p>
                  {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                  <p>
                    {addr.city}, {addr.province} {addr.postalCode}
                  </p>
                  <p>{addr.country}</p>
                </div>
                <div style={{ marginTop: "0.25rem" }}>
                  <button
                    onClick={() => startEditAddress(addr)}
                    style={{ marginRight: "0.5rem" }}
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDeleteAddress(addr)}>
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <h3>Tambah alamat baru</h3>
        <form
          onSubmit={handleCreateAddress}
          style={{ display: "grid", gap: "0.35rem", maxWidth: 400 }}
        >
          <div>
            <label>Label (misal: rumah, kantor, dll)</label>
            <input
              type="text"
              name="label"
              required
              value={newAddressForm.label}
              onChange={handleNewAddressChange}
            />
          </div>
          <div>
            <label>Nama Penerima</label>
            <input
              type="text"
              name="recipientName"
              required
              value={newAddressForm.recipientName}
              onChange={handleNewAddressChange}
            />
          </div>
          <div>
            <label>Telepon</label>
            <input
              type="text"
              name="phone"
              required
              value={newAddressForm.phone}
              onChange={handleNewAddressChange}
            />
          </div>
          <div>
            <label>Alamat baris 1</label>
            <input
              type="text"
              name="addressLine1"
              required
              value={newAddressForm.addressLine1}
              onChange={handleNewAddressChange}
            />
          </div>
          <div>
            <label>Alamat baris 2</label>
            <input
              type="text"
              name="addressLine2"
              value={newAddressForm.addressLine2}
              onChange={handleNewAddressChange}
            />
          </div>
          <div>
            <label>Kota</label>
            <input
              type="text"
              name="city"
              required
              value={newAddressForm.city}
              onChange={handleNewAddressChange}
            />
          </div>
          <div>
            <label>Provinsi</label>
            <input
              type="text"
              name="province"
              required
              value={newAddressForm.province}
              onChange={handleNewAddressChange}
            />
          </div>
          <div>
            <label>Kode Pos</label>
            <input
              type="text"
              name="postalCode"
              required
              value={newAddressForm.postalCode}
              onChange={handleNewAddressChange}
            />
          </div>
          <div>
            <label>Negara</label>
            <input
              type="text"
              name="country"
              value={newAddressForm.country}
              onChange={handleNewAddressChange}
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                name="isDefault"
                checked={newAddressForm.isDefault}
                onChange={handleNewAddressChange}
              />
              Jadikan default
            </label>
          </div>

          <button type="submit" disabled={creatingAddress}>
            {creatingAddress ? "Menyimpan..." : "Tambah Alamat"}
          </button>
        </form>

        {editingAddress && (
          <div style={{ marginTop: "1.5rem" }}>
            <h3>Edit alamat: {editingAddress.label}</h3>
            <form
              onSubmit={handleUpdateAddress}
              style={{ display: "grid", gap: "0.35rem", maxWidth: 400 }}
            >
              <div>
                <label>Label</label>
                <input
                  type="text"
                  name="label"
                  required
                  value={editingAddressForm.label}
                  onChange={handleEditAddressChange}
                />
              </div>
              <div>
                <label>Nama Penerima</label>
                <input
                  type="text"
                  name="recipientName"
                  required
                  value={editingAddressForm.recipientName}
                  onChange={handleEditAddressChange}
                />
              </div>
              <div>
                <label>Telepon</label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={editingAddressForm.phone}
                  onChange={handleEditAddressChange}
                />
              </div>
              <div>
                <label>Alamat Baris 1</label>
                <input
                  type="text"
                  name="addressLine1"
                  required
                  value={editingAddressForm.addressLine1}
                  onChange={handleEditAddressChange}
                />
              </div>
              <div>
                <label>Alamat Baris 2</label>
                <input
                  type="text"
                  name="addressLine2"
                  value={editingAddressForm.addressLine2}
                  onChange={handleEditAddressChange}
                />
              </div>
              <div>
                <label>Kota</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={editingAddressForm.city}
                  onChange={handleEditAddressChange}
                />
              </div>
              <div>
                <label>Provinsi</label>
                <input
                  type="text"
                  name="province"
                  required
                  value={editingAddressForm.province}
                  onChange={handleEditAddressChange}
                />
              </div>
              <div>
                <label>Kode Pos</label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  value={editingAddressForm.postalCode}
                  onChange={handleEditAddressChange}
                />
              </div>
              <div>
                <label>Negara</label>
                <input
                  type="text"
                  name="country"
                  value={editingAddressForm.country}
                  onChange={handleEditAddressChange}
                />
              </div>
              <div>
                <label>
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={editingAddressForm.isDefault}
                    onChange={handleEditAddressChange}
                  />{" "}
                  Jadikan default
                </label>
              </div>
              <div>
                <button type="submit" disabled={updatingAddress}>
                  {updatingAddress ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingAddress(null)}
                  style={{ marginLeft: "0.5rem" }}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}

export default Profile;
