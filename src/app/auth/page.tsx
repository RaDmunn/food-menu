"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: "ADMIN" | "RESTAURANT_OWNER";
}

interface CustomSelectProps {
  value: string;
  onChange: (value: "ADMIN" | "RESTAURANT_OWNER") => void;
  options: { value: "ADMIN" | "RESTAURANT_OWNER"; label: string }[];
}

function CustomSelect({ value, onChange, options }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="auth-page__custom-select" ref={selectRef}>
      <button
        type="button"
        className="auth-page__custom-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label}</span>
        <svg
          className={`auth-page__custom-select-arrow ${
            isOpen ? "auth-page__custom-select-arrow--open" : ""
          }`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="auth-page__custom-select-dropdown">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`auth-page__custom-select-option ${
                value === option.value
                  ? "auth-page__custom-select-option--selected"
                  : ""
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "RESTAURANT_OWNER",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "login",
          ...loginForm,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/user");
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "register",
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
          phone: registerForm.phone,
          role: "RESTAURANT_OWNER",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/user");
        }
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__container">
        <aside className="auth-page__editorial"><Link href="/">food<span>menu</span></Link><div><span>THE RESTAURANT WORKSPACE</span><h2>Where every menu finds its place.</h2><p>Considered tools for the people behind memorable places.</p></div><small>FOODMENU / HOSPITALITY PLATFORM</small></aside>
        <div className="auth-page__card">
          <div className="auth-page__header">
            <Link href="/" className="auth-page__home">← Back to website</Link>
            <span className="auth-page__eyebrow">YOUR WORKSPACE</span>
            <h1 className="auth-page__title">{isLogin ? "Welcome back." : "Create your account."}</h1>
            <p className="auth-page__subtitle">
              {isLogin ? "Sign in to manage your restaurants and menus." : "Set up your restaurant workspace."}
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="auth-page__toggle">
            <button
              onClick={() => setIsLogin(true)}
              className={`auth-page__toggle-button ${
                isLogin ? "auth-page__toggle-button--active" : ""
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`auth-page__toggle-button ${
                !isLogin ? "auth-page__toggle-button--active" : ""
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && <div className="auth-page__error">{error}</div>}

          {isLogin ? (
            <form onSubmit={handleLogin} className="auth-page__form">
              <div className="auth-page__field">
                <label htmlFor="email" className="auth-page__label">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                  placeholder="Enter your email"
                  className="auth-page__input"
                />
              </div>

              <div className="auth-page__field">
                <label htmlFor="password" className="auth-page__label">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  placeholder="Enter your password"
                  className="auth-page__input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-page__button"
              >
                {loading ? (
                  <span className="auth-page__loading">
                    <span className="auth-page__loading-spinner"></span>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-page__form">
              <div className="auth-page__field">
                <label htmlFor="name" className="auth-page__label">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={registerForm.name}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, name: e.target.value })
                  }
                  placeholder="Enter your full name"
                  className="auth-page__input"
                />
              </div>

              <div className="auth-page__field">
                <label htmlFor="reg-email" className="auth-page__label">
                  Email address
                </label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      email: e.target.value,
                    })
                  }
                  placeholder="Enter your email"
                  className="auth-page__input"
                />
              </div>

              <div className="auth-page__field">
                <label htmlFor="phone" className="auth-page__label">
                  Phone (optional)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={registerForm.phone}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      phone: e.target.value,
                    })
                  }
                  placeholder="Enter your phone number"
                  className="auth-page__input"
                />
              </div>


              <div className="auth-page__field">
                <label htmlFor="reg-password" className="auth-page__label">
                  Password
                </label>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      password: e.target.value,
                    })
                  }
                  placeholder="Create a password"
                  className="auth-page__input"
                />
              </div>

              <div className="auth-page__field">
                <label htmlFor="confirm-password" className="auth-page__label">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={registerForm.confirmPassword}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm your password"
                  className="auth-page__input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-page__button"
              >
                {loading ? (
                  <span className="auth-page__loading">
                    <span className="auth-page__loading-spinner"></span>
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
