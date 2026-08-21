"use client";

import { useState } from "react";
import { login, register } from "@/lib/api";
import Icon from "@/components/Icon";
import Link from "next/link";

export default function AuthPage() {
  const [authTab, setAuthTab] = useState("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerLang, setRegisterLang] = useState("isiZulu");

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccessMsg, setAuthSuccessMsg] = useState("");

  const handleLoginSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      setAuthLoading(true);
      setAuthError("");

      const result = await login(
        loginEmail,
        loginPassword
      );

      localStorage.setItem(
        "token",
        result.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(result.user)
      );

      setAuthSuccessMsg(
        "Login successful"
      );

    } catch {

      setAuthError(
        "Login failed"
      );

    } finally {

      setAuthLoading(false);

    }
  };

  const handleRegisterSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      setAuthLoading(true);
      setAuthError("");

      await register({
        full_name: registerName,
        email: registerEmail,
        password: registerPassword,
        language: registerLang
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
    <div className="max-w-md mx-auto p-6">

      <Link href="/" className="flex items-center justify-center gap-3 mb-8">
          <span className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center">
            <Icon name="radio" className="w-5 h-5 text-white" />
          </span>
          <span className="leading-tight text-white">
            <span className="block font-extrabold tracking-tight text-lg">
              iLIZWI <span className="text-orange-400">RADIO</span>
            </span>
            <span className="block text-[10px] tracking-[0.2em] text-white/70 -mt-0.5">WHERE AFRICA SPEAKS</span>
          </span>
        </Link>

      <div className="flex mb-4">

        <button
          onClick={() => setAuthTab("login")}
          className="flex-1 p-2 border"
        >
          Login
        </button>

        <button
          onClick={() => setAuthTab("register")}
          className="flex-1 p-2 border"
        >
          Register
        </button>

      </div>

      {authError && (
        <div className="mb-3 text-red-600">
          {authError}
        </div>
      )}

      {authSuccessMsg && (
        <div className="mb-3 text-green-600">
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
            placeholder="Email"
            value={loginEmail}
            onChange={(e) =>
              setLoginEmail(
                e.target.value
              )
            }
            className="w-full border p-2"
          />

          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) =>
              setLoginPassword(
                e.target.value
              )
            }
            className="w-full border p-2"
          />

          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-green-900 text-white p-2"
          >
            {authLoading
              ? "Verifying..."
              : "Login"}
          </button>

        </form>

      ) : (

        <form
          onSubmit={handleRegisterSubmit}
          className="space-y-4"
        >

          <input
            type="text"
            placeholder="Full Name"
            value={registerName}
            onChange={(e) =>
              setRegisterName(
                e.target.value
              )
            }
            className="w-full border p-2"
          />

          <input
            type="email"
            placeholder="Email"
            value={registerEmail}
            onChange={(e) =>
              setRegisterEmail(
                e.target.value
              )
            }
            className="w-full border p-2"
          />

          <input
            type="password"
            placeholder="Password"
            value={registerPassword}
            onChange={(e) =>
              setRegisterPassword(
                e.target.value
              )
            }
            className="w-full border p-2"
          />

          <select
            value={registerLang}
            onChange={(e) =>
              setRegisterLang(
                e.target.value
              )
            }
            className="w-full border p-2"
          >
            <option value="isiZulu">
              isiZulu
            </option>
            <option value="English">
              English
            </option>
            <option value="Xitsonga">
              Xitsonga
            </option>
          </select>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-orange-600 text-white p-2"
          >
            {authLoading
              ? "Creating..."
              : "Register"}
          </button>

        </form>

      )}

    </div>
  );
}