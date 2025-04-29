"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getDictionary } from "../lib/dictionary";
import { useAuth } from "@/app/contexts/AuthContext";
import { hasRole } from "@/app/utils/roleHelper";
import { Insurance } from "@/app/types";

interface Dictionary {
  login: {
    signin: string;
    create: string;
    credentials: string;
    join: string;
    email: string;
    password: string;
    confirmPassword: string;
    remember: string;
    forgot: string;
    submit: string;
    register: string;
    account: string;
    noAccount: string;
    or: string;
  };
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [insuranceId, setInsuranceId] = useState("");
  const [insuranceNumber, setInsuranceNumber] = useState("");
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);
  const router = useRouter();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      // Redirect berdasarkan role setelah login
      if (hasRole(user.role, "admin")) {
        router.push("/admin");
      } else {
        // User dengan role staff/doctor diarahkan ke homepage
        router.push("/");
      }
    }
  }, [user, router]);

  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await getDictionary("id");
      setDictionary(dict as Dictionary);
    };

    loadDictionary();
  }, []);

  useEffect(() => {
    const fetchInsurances = async () => {
      try {
        const response = await fetch("/api/insurances");
        if (response.ok) {
          const data = await response.json();
          setInsurances(data);
        }
      } catch (error) {
        console.error("Error fetching insurances:", error);
      }
    };

    if (!isLogin) {
      fetchInsurances();
    }
  }, [isLogin]);

  // Reset form when switching between login and register
  useEffect(() => {
    setError("");
    setSuccessMessage("");
    setPassword("");
    setConfirmPassword("");
    if (isLogin) {
      setName("");
      setPhone("");
      setUsername("");
      setIdentityNumber("");
      setInsuranceId("");
      setInsuranceNumber("");
    }
  }, [isLogin]);

  // Fallback text
  const loginText = {
    signin: dictionary?.login?.signin || "Masuk ke akun Anda",
    create: dictionary?.login?.create || "Buat akun baru",
    credentials:
      dictionary?.login?.credentials ||
      "Masukkan kredensial Anda untuk mengakses dasbor kesehatan Anda",
    join:
      dictionary?.login?.join ||
      "Bergabunglah dengan platform kesehatan kami untuk mengelola kesehatan Anda dengan lebih efisien",
    email: dictionary?.login?.email || "Email",
    password: dictionary?.login?.password || "Kata Sandi",
    confirmPassword:
      dictionary?.login?.confirmPassword || "Konfirmasi Kata Sandi",
    remember: dictionary?.login?.remember || "Ingat saya",
    forgot: dictionary?.login?.forgot || "Lupa kata sandi?",
    submit: dictionary?.login?.submit || "Masuk",
    register: dictionary?.login?.register || "Daftar",
    account: dictionary?.login?.account || "Sudah punya akun?",
    noAccount: dictionary?.login?.noAccount || "Belum punya akun?",
    or: dictionary?.login?.or || "atau",
  };

  const validateForm = () => {
    if (!isLogin) {
      if (password !== confirmPassword) {
        setError("Kata sandi dan konfirmasi kata sandi tidak cocok");
        return false;
      }

      if (password.length < 6) {
        setError("Kata sandi harus minimal 6 karakter");
        return false;
      }

      if (!name) {
        setError("Nama lengkap harus diisi");
        return false;
      }
    }
    return true;
  };

  const handleRegister = async () => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          username: username || undefined, // Only send if provided
          identityNumber: identityNumber || undefined,
          insuranceId: insuranceId || undefined,
          insuranceNumber: insuranceNumber || undefined,
        }),
      });

      if (response.ok) {
        setSuccessMessage(
          "Registrasi berhasil! Silakan masuk dengan akun baru Anda."
        );
        // Switch to login form after successful registration
        setTimeout(() => {
          setIsLogin(true);
          setSuccessMessage("");
        }, 3000);
        return true;
      } else {
        const data = await response.json();
        setError(
          data.error || "Gagal melakukan registrasi. Silakan coba lagi."
        );
        return false;
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Terjadi kesalahan saat registrasi. Silakan coba lagi.");
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validate form inputs first
    if (!email) {
      setError("Silakan masukkan email atau username Anda");
      return;
    }

    if (!password) {
      setError("Silakan masukkan password Anda");
      return;
    }

    // Additional validation if needed
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    if (isLogin) {
      // Login
      try {
        console.log("Login: Attempting login with:", email);
        const success = await login(email, password);

        if (success) {
          // Redirect akan ditangani oleh useEffect di atas
          console.log(
            "Login: Login successful, redirect will be handled by useEffect"
          );
        } else {
          console.log("Login: Login failed");
          setError("Email/username atau password salah. Silakan coba lagi.");
        }
      } catch (err) {
        console.error("Login: Error during login process:", err);
        let errorMessage = "Terjadi kesalahan saat login.";

        if (err instanceof Error) {
          console.error("Login error details:", err.message);
          // Provide more specific error messages based on error
          if (
            err.message.includes("network") ||
            err.message.includes("fetch")
          ) {
            errorMessage =
              "Gagal terhubung ke server. Periksa koneksi internet Anda.";
          }
        }

        setError(errorMessage);
      }
    } else {
      // Register
      await handleRegister();
    }

    setLoading(false);
  };

  // Function to check if insurance number field should be shown
  const shouldShowInsuranceNumber = () => {
    // Get selected insurance from the list
    if (!insuranceId) return false;

    const selectedInsurance = insurances.find((ins) => ins.id === insuranceId);
    // Only show insurance number field if insurance is not "Umum"
    return selectedInsurance && selectedInsurance.name !== "Umum";
  };

  // Jika sudah login, jangan tampilkan halaman login
  if (user) {
    return null; // Redirect akan dilakukan oleh useEffect
  }

  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="py-16 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLogin ? loginText.signin : loginText.create}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {isLogin ? loginText.credentials : loginText.join}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <>
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Nama Lengkap
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="username"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Username (Opsional)
                      </label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="johndoe123"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Nomor Telepon
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="08123456789"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="identityNumber"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Nomor Identitas
                      </label>
                      <input
                        id="identityNumber"
                        name="identityNumber"
                        type="text"
                        value={identityNumber}
                        onChange={(e) => setIdentityNumber(e.target.value)}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="3274XXXXXXXXXXX"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="insuranceId"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Asuransi
                      </label>
                      <select
                        id="insuranceId"
                        name="insuranceId"
                        value={insuranceId}
                        onChange={(e) => setInsuranceId(e.target.value)}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        <option value="">Pilih Asuransi (Opsional)</option>
                        {insurances.map((insurance) => (
                          <option key={insurance.id} value={insurance.id}>
                            {insurance.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {shouldShowInsuranceNumber() && (
                      <div>
                        <label
                          htmlFor="insuranceNumber"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Nomor Asuransi
                        </label>
                        <input
                          id="insuranceNumber"
                          name="insuranceNumber"
                          type="text"
                          value={insuranceNumber}
                          onChange={(e) => setInsuranceNumber(e.target.value)}
                          className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                          placeholder="123456789"
                        />
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {isLogin ? "Email atau Username" : loginText.email}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type={isLogin ? "text" : "email"}
                    autoComplete={isLogin ? "username" : "email"}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder={
                      isLogin
                        ? "name@email.com atau username"
                        : "name@email.com"
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {loginText.password}
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder={isLogin ? "••••••••" : "Minimal 6 karakter"}
                  />
                </div>

                {!isLogin && (
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {loginText.confirmPassword}
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="Konfirmasi kata sandi"
                    />
                  </div>
                )}

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-700 rounded"
                      />
                      <label
                        htmlFor="remember-me"
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        {loginText.remember}
                      </label>
                    </div>

                    <div className="text-sm">
                      <Link
                        href="/forgot-password"
                        className="font-medium text-primary hover:text-primary-dark"
                      >
                        {loginText.forgot}
                      </Link>
                    </div>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                  >
                    {loading ? (
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : null}
                    {loading
                      ? "Memproses..."
                      : isLogin
                      ? loginText.submit
                      : loginText.register}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isLogin ? loginText.noAccount : loginText.account}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-1 font-medium text-primary hover:text-primary-dark"
                  >
                    {isLogin ? loginText.register : loginText.submit}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
