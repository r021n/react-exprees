import { UserRepository } from "../repositories/UserRepository";
import { UserAddressRepository } from "../repositories/UserAddressRepository";
import { AppError } from "../core/AppError";
import { User } from "../entities/User";

export class UserService {
  private userRepo: UserRepository;
  private addressRepo: UserAddressRepository;

  constructor() {
    this.userRepo = new UserRepository();
    this.addressRepo = new UserAddressRepository();
  }

  private sanitizeUser(user: User) {
    const { passwordHash, ...rest } = user;
    return rest;
  }

  async getProfile(userId: number) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError("User tidak ditemukan", 404, "USER_NOT_FOUND");
    }
    return this.sanitizeUser(user);
  }

  async updateProfile(userId: number, data: { name?: string; phone?: string }) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError("User tidak ditemukan", 404, "USER_NOT_FOUND");
    }

    if (typeof data.name === "string") {
      user.name = data.name;
    }

    if (typeof data.phone === "string") {
      user.phone = data.phone;
    }

    const saved = await this.userRepo.save(user);
    return this.sanitizeUser(saved);
  }

  getAddresses(userId: number) {
    return this.addressRepo.findByUser(userId);
  }

  async createAddress(
    userId: number,
    payload: {
      label: string;
      recipientName: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string | null;
      city: string;
      province: string;
      postalCode: string;
      country?: string;
      isDefault?: boolean;
    }
  ) {
    if (payload.isDefault) {
      // TODO (opsional): clear default lama milik user ini
      // untuk MVP, bisa diabaikan atau diimplementasi nanti
    }

    const address = await this.addressRepo.createAndSave({
      userId,
      label: payload.label,
      recipientName: payload.recipientName,
      phone: payload.phone,
      addressLine1: payload.addressLine1,
      addressLine2: payload.addressLine2 ?? null,
      city: payload.city,
      province: payload.province,
      postalCode: payload.postalCode,
      country: payload.country ?? "Indonesia",
      isDefault: payload.isDefault ?? false,
    });

    return address;
  }

  async updateAddress(
    userId: number,
    addressId: number,
    payload: Partial<{
      label: string;
      recipientName: string;
      phone: string;
      addressLine1: string;
      addressLine2: string | null;
      city: string;
      province: string;
      postalCode: string;
      country: string;
      isDefault: boolean;
    }>
  ) {
    const address = await this.addressRepo.findByIdAndUser(addressId, userId);
    if (!address) {
      throw new AppError("Alamat tidak ditemukan", 404, "ADDRESS_NOT_FOUND");
    }

    Object.assign(address, payload);

    const saved = await this.addressRepo.save(address);
    return saved;
  }

  async deleteAddress(userId: number, addressId: number) {
    const address = await this.addressRepo.findByIdAndUser(addressId, userId);
    if (!address) {
      throw new AppError("Alamat tidak ditemukan", 404, "ADDRESS_NOT_FOUND");
    }

    await this.addressRepo.delete(address);
  }
}
