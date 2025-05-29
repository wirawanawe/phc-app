"use client";

import { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";
import { getDictionary } from "../lib/dictionary";
import { useAuth } from "@/app/contexts/AuthContext";
import { hasRole } from "@/app/utils/roleHelper";
import { Insurance } from "@/app/types";
import SessionExpiredModal from "../components/SessionExpiredModal";

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

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData extends LoginFormData {
  name: string;
  phone: string;
  username?: string;
  identityNumber?: string;
  insuranceId?: string;
  insuranceNumber?: string;
}

interface FormProps {
  onSubmit: (data: LoginFormData | RegisterFormData) => Promise<void>;
  loading: boolean;
  loginText: Dictionary["login"];
  error: string;
  successMessage: string;
}

interface RegisterFormProps extends FormProps {
  insurances: Insurance[];
}

const LoginForm: React.FC<FormProps> = ({
  onSubmit,
  loading,
  loginText,
  error,
  successMessage,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit({ email, password });
    },
    [email, password, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-black">
          {loginText.email}
        </label>
        <input
          id="email"
          name="email"
          type="text"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full border-gray-300 text-black dark:border-gray-700 dark:bg-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
          placeholder={loginText.email}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-black"
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
          className="mt-1 block w-full border-gray-300 text-black dark:border-gray-700 dark:bg-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
          placeholder={loginText.password}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 text-black dark:border-gray-700 rounded"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-black"
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

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#E32345] hover:bg-[#E32345] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
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
          {loading ? "Memproses..." : loginText.submit}
        </button>
      </div>
    </form>
  );
};

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  loading,
  loginText,
  error,
  successMessage,
  insurances,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [insuranceId, setInsuranceId] = useState("");
  const [insuranceNumber, setInsuranceNumber] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit({
        name,
        email,
        password,
        phone,
        username,
        identityNumber,
        insuranceId,
        insuranceNumber,
      });
    },
    [
      name,
      email,
      password,
      phone,
      username,
      identityNumber,
      insuranceId,
      insuranceNumber,
      onSubmit,
    ]
  );

  // Function to check if insurance number field should be shown
  const shouldShowInsuranceNumber = () => {
    // Get selected insurance from the list
    if (!insuranceId) return false;

    const selectedInsurance = insurances.find((ins) => ins.id === insuranceId);
    // Only show insurance number field if insurance is not "Umum"
    return selectedInsurance && selectedInsurance.name !== "Umum";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-black">
          Nama Lengkap
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full border-gray-300 text-black dark:border-gray-700 dark:bg-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-black"
        >
          Username (Opsional)
        </label>
        <input
          id="username"
          name="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 block w-full border-gray-300 text-black dark:border-gray-700 dark:bg-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
          placeholder="johndoe123"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-black">
          Nomor Telepon
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 block w-full border-gray-300 text-black dark:border-gray-700 dark:bg-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
          placeholder="08123456789"
        />
      </div>

      <div>
        <label
          htmlFor="identityNumber"
          className="block text-sm font-medium text-black"
        >
          Nomor Identitas
        </label>
        <input
          id="identityNumber"
          name="identityNumber"
          type="text"
          value={identityNumber}
          onChange={(e) => setIdentityNumber(e.target.value)}
          className="mt-1 block w-full border-gray-300 text-black dark:border-gray-700 dark:bg-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
          placeholder="3274XXXXXXXXXXX"
        />
      </div>

      <div>
        <label
          htmlFor="insuranceId"
          className="block text-sm font-medium text-black"
        >
          Asuransi
        </label>
        <select
          id="insuranceId"
          name="insuranceId"
          value={insuranceId}
          onChange={(e) => setInsuranceId(e.target.value)}
          className="mt-1 block w-full border-gray-300 text-black dark:border-gray-700 dark:bg-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
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
            className="block text-sm font-medium text-black"
          >
            Nomor Asuransi
          </label>
          <input
            id="insuranceNumber"
            name="insuranceNumber"
            type="text"
            value={insuranceNumber}
            onChange={(e) => setInsuranceNumber(e.target.value)}
            className="mt-1 block w-full border-gray-300 text-black dark:border-gray-700 dark:bg-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="123456789"
          />
        </div>
      )}

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-black"
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
          className="mt-1 block w-full border-gray-300 text-black dark:border-gray-700 dark:bg-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
          placeholder="Konfirmasi kata sandi"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#E32345] hover:bg-[#E32345] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
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
          {loading ? "Memproses..." : loginText.register}
        </button>
      </div>
    </form>
  );
};

function LoginPageContent() {
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
  const searchParams = useSearchParams();
  const { login, user } = useAuth();
  const [sessionExpired, setSessionExpired] = useState(false);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState("");

  // Check URL parameters for session expiration
  useEffect(() => {
    const expired = searchParams.get("expired");
    const reason = searchParams.get("reason");

    if (expired === "true") {
      if (reason === "ip_changed") {
        setSessionExpiredMessage(
          "Terdeteksi penggunaan dari perangkat atau lokasi yang berbeda. Harap login kembali untuk alasan keamanan."
        );
      } else {
        setSessionExpiredMessage(
          "Sesi login Anda telah berakhir. Harap login kembali untuk melanjutkan."
        );
      }
      setSessionExpired(true);

      // Update URL without the query parameters to prevent showing the modal again on refresh
      window.history.replaceState({}, "", "/login");
    }
  }, [searchParams]);

  // Close the session expired modal
  const handleCloseSessionModal = () => {
    setSessionExpired(false);
    setSessionExpiredMessage("");
  };

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

  const loginText = useMemo(
    () => ({
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
    }),
    [dictionary]
  );

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

  const handleRegister = async (formData: RegisterFormData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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

  const handleSubmit = useCallback(
    async (formData: LoginFormData | RegisterFormData) => {
      setError("");
      setSuccessMessage("");
      setLoading(true);

      try {
        if (isLogin) {
          const success = await login(formData.email, formData.password);
          if (!success) {
            setError("Email/username atau password salah. Silakan coba lagi.");
          }
        } else {
          await handleRegister(formData as RegisterFormData);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Terjadi kesalahan. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    },
    [isLogin, login]
  );

  // Jika sudah login, jangan tampilkan halaman login
  if (user) {
    return null; // Redirect akan dilakukan oleh useEffect
  }

  return (
    <main className="min-h-screen bg-gray-100 pb-20">
      <Navbar />
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 my-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Logo section - Shows at top on mobile, right side on desktop */}
            <div className="md:order-2 md:w-1/2 bg-[#E32345] p-8 flex items-center justify-center">
              <div className="text-center">
                <Image
                  src="/logo doctorPHC.jpg"
                  alt="PHC Logo"
                  width={200}
                  height={200}
                  className="mx-auto mb-4"
                />
                <h3 className="text-2xl font-bold text-white mb-2">
                  Selamat Datang di PHC
                </h3>
                <p className="text-blue-100">
                  Kembangkan kesehatan Anda bersama kami.
                </p>
              </div>
            </div>

            {/* Form section - Shows below logo on mobile, left side on desktop */}
            <div className="md:order-1 md:w-1/2 p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-black mb-2">
                {isLogin ? loginText.signin : loginText.create}
              </h2>
              <p className="text-black mb-6">
                {isLogin ? loginText.credentials : loginText.join}
              </p>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{successMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {isLogin ? (
                <LoginForm
                  onSubmit={handleSubmit}
                  loading={loading}
                  loginText={loginText}
                  error={error}
                  successMessage={successMessage}
                />
              ) : (
                <RegisterForm
                  onSubmit={handleSubmit}
                  loading={loading}
                  loginText={loginText}
                  error={error}
                  successMessage={successMessage}
                  insurances={insurances}
                />
              )}

              <div className="mt-4 text-center">
                {isLogin ? (
                  <p className="text-sm text-black">
                    {loginText.noAccount}{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(false)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {loginText.register}
                    </button>
                  </p>
                ) : (
                  <p className="text-sm text-black">
                    {loginText.account}{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(true)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {loginText.submit}
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Session Expired Modal */}
      <SessionExpiredModal
        isOpen={sessionExpired}
        message={sessionExpiredMessage}
        onClose={handleCloseSessionModal}
      />
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
