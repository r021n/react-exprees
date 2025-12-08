import bcrypt from "bcrypt";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../core/AppError";
import { env } from "../config/env";
import { AuthUserPayload } from "../core/types";
import { User } from "../entities/User";

export class AuthService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  private toAuthPayload(user: User): AuthUserPayload {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  private generateToken(user: User): string {
    const payload = this.toAuthPayload(user);
    const secret: Secret = env.jwtSecret;
    const options: SignOptions = {
      expiresIn: env.jwtExpiresIn,
      subject: String(user.id),
    };
    return jwt.sign(payload, secret, options);
  }

  private sanitizeUser(user: User) {
    const { passwordHash, ...rest } = user;
    return rest;
  }

  async register(
    email: string,
    password: string,
    name: string,
    phone?: string
  ) {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new AppError("Email sudah terdaftar", 400, "EMAIL_TAKEN");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.userRepo.createAndSave({
      email,
      passwordHash,
      name,
      phone: phone ?? null,
      role: "user",
    });

    const token = this.generateToken(user);
    return { token, user: this.sanitizeUser(user) };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new AppError(
        "Email atau password salah",
        401,
        "INVALID_CREDENTIALS"
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError(
        "Email atau password salah",
        401,
        "INVALID_CREDENTIALS"
      );
    }

    const token = this.generateToken(user);
    return { token, user: this.sanitizeUser(user) };
  }
}
