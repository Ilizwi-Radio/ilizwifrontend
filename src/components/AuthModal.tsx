"use client";

import { useState } from "react";
import { login, register } from "@/lib/api";
import Icon from "@/components/Icon";
import Link from "next/link";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  onLoginSuccess?: (user: any) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  user
}: AuthModalProps){
  const [authTab, setAuthTab] =
    useState("login");

  const [loginEmail, setLoginEmail] =
    useState("");

  const [loginPassword, setLoginPassword] =
    useState("");

  const [registerName, setRegisterName] =
    useState("");

  const [registerEmail, setRegisterEmail] =
    useState("");

  const [registerPassword,
    setRegisterPassword] =
    useState("");

  const [registerLang,
    setRegisterLang] =
    useState("isiZulu");

  const [authLoading,
    setAuthLoading] =
    useState(false);

  const [authError,
    setAuthError] =
    useState("");

  const [authSuccessMsg,
    setAuthSuccessMsg] =
    useState("");

  if (!isOpen) return null;
  if (user) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">

      <div className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl">

        <button
          onClick={onClose}
          className="absolute top-4 right-4"
        >
          ✕
        </button>

        <div className="text-center">

          <div className="w-20 h-20 rounded-full bg-orange-500 text-white text-3xl font-bold flex items-center justify-center mx-auto mb-4">
            {user.full_name?.charAt(0)}
          </div>

          <h2 className="text-xl font-bold">
            {user.full_name}
          </h2>

          <p className="text-neutral-500">
            {user.email}
          </p>

        </div>

        <div className="mt-6 space-y-3">

          <button
            className="w-full border rounded-xl py-3"
          >
            My Profile
          </button>

          <button
            className="w-full border rounded-xl py-3"
          >
            Settings
          </button>

          <button
            onClick={() => {

              localStorage.removeItem("token");
              localStorage.removeItem("user");

              window.location.reload();

            }}
            className="w-full bg-red-500 text-white rounded-xl py-3"
          >
            Logout
          </button>

        </div>

      </div>

    </div>
  );
}
  

  const handleLoginSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      setAuthLoading(true);
      setAuthError("");

      
    const result =
      await login(
        loginEmail,
        loginPassword
      );

      if (
        !result.token ||
        !result.user
      ) {
        throw new Error(
          "Authentication failed"
        );
      }


      console.log("LOGIN RESPONSE:", result);

      localStorage.setItem(
        "token",
        result.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(result.user)
      );

      window.dispatchEvent(new Event("storage"));

      if (onLoginSuccess) {
        onLoginSuccess(result.user);
        console.log("USER SENT TO HOME:", result.user);
    }

      setAuthSuccessMsg(
        "Login successful"
      );

      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error: any) {

  setAuthError(
    error.message ||
    "Invalid email or password"
  );

} finally {

      setAuthLoading(false);

    }
  };

  const handleRegisterSubmit =
    async (
      e: React.FormEvent
    ) => {

      e.preventDefault();

      try {

        setAuthLoading(true);
        setAuthError("");

        await register({
          full_name:
            registerName,
          email:
            registerEmail,
          password:
            registerPassword,
          language:
            registerLang,
        });

        setAuthSuccessMsg(
          "Registration successful"
        );

        setAuthTab("login");

      } catch {

        setAuthError(
          "Registration failed"
        );

      } finally {

        setAuthLoading(false);

      }

    };

  return (

    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">

      <div className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl">

        {/* Close Button */}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-neutral-100"
        >
          ✕
        </button>

        {/* Header */}

        <div className="text-center mb-6">

       <Link href="/" className="flex items-center justify-center gap-3 mb-8">
          <span className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center">
            <Icon name="radio" className="w-5 h-5 text-white" />
          </span>
          <span className="leading-tight text-white">
            <span className="block font-extrabold tracking-tight text-lg text-green-900">
              iLIZWI <span className="text-orange-400">RADIO</span>
            </span>
            <span className="block text-[10px] tracking-[0.2em] text-green-900 -mt-0.5">
              WHERE AFRICA SPEAKS
            </span>
          </span>
        </Link>

          <p className="text-sm text-neutral-500 mt-2">
            Log in or register your digital profile.
          </p>

        </div>

        {/* Tabs */}

        <div className="flex bg-neutral-100 p-1 rounded-xl mb-5">

          <button
            onClick={() => {
              setAuthTab("login");
              setAuthError("");
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold ${
              authTab === "login"
                ? "bg-white shadow-sm text-[#052115]"
                : "text-neutral-500"
            }`}
          >
            Login
          </button>

          <button
            onClick={() => {
              setAuthTab("register");
              setAuthError("");
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold ${
              authTab === "register"
                ? "bg-white shadow-sm text-[#052115]"
                : "text-neutral-500"
            }`}
          >
            Register
          </button>

        </div>

        {authError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-4 text-sm">
            {authError}
          </div>
        )}

        {authSuccessMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl mb-4 text-sm">
            {authSuccessMsg}
          </div>
        )}

        {authTab === "login" ? (

          <form
            onSubmit={handleLoginSubmit}
            className="space-y-4"
          >

            <input
              type="email"
              required
              placeholder="Email Address"
              value={loginEmail}
              onChange={(e) =>
                setLoginEmail(
                  e.target.value
                )
              }
              className="w-full border border-neutral-200 rounded-xl p-3"
            />

            <input
              type="password"
              required
              placeholder="Password"
              value={loginPassword}
              onChange={(e) =>
                setLoginPassword(
                  e.target.value
                )
              }
              className="w-full border border-neutral-200 rounded-xl p-3"
            />

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#052115] hover:bg-[#e2831b] text-white py-3 rounded-xl font-bold"
            >
              {authLoading
                ? "Verifying..."
                : "Sign In"}
            </button>

          </form>

        ) : (

          <form
            onSubmit={
              handleRegisterSubmit
            }
            className="space-y-4"
          >

            <input
              type="text"
              required
              placeholder="Full Name"
              value={registerName}
              onChange={(e) =>
                setRegisterName(
                  e.target.value
                )
              }
              className="w-full border border-neutral-200 rounded-xl p-3"
            />

            <input
              type="email"
              required
              placeholder="Email Address"
              value={registerEmail}
              onChange={(e) =>
                setRegisterEmail(
                  e.target.value
                )
              }
              className="w-full border border-neutral-200 rounded-xl p-3"
            />

            <input
              type="password"
              required
              placeholder="Password"
              value={registerPassword}
              onChange={(e) =>
                setRegisterPassword(
                  e.target.value
                )
              }
              className="w-full border border-neutral-200 rounded-xl p-3"
            />

            <select
              value={registerLang}
              onChange={(e) =>
                setRegisterLang(
                  e.target.value
                )
              }
              className="w-full border border-neutral-200 rounded-xl p-3"
            >
              <option>
                isiZulu
              </option>

              <option>
                English
              </option>

              <option>
                isiXhosa
              </option>

              <option>
                Xitsonga
              </option>
            </select>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#052115] hover:bg-[#e2831b] text-white py-3 rounded-xl font-bold"
            >
              {authLoading
                ? "Creating Account..."
                : "Register"}
            </button>

          </form>

        )}

      </div>

    </div>

  );
}