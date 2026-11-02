import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "accent";
  size?: "sm" | "lg";
}

const styles: Record<string, React.CSSProperties> = {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    border: "none",
    borderRadius: "var(--radius)",
    fontWeight: 500,
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.15s",
    textDecoration: "none",
    whiteSpace: "nowrap",
    fontFamily: "var(--font-sans)",
  },
  primary: {
    background: "var(--accent)",
    color: "#fff",
    padding: "9px 18px",
  },
  secondary: {
    background: "var(--surface)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-strong)",
    padding: "9px 18px",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "1px solid var(--border)",
    padding: "7px 14px",
  },
  accent: {
    background: "var(--accent-bg)",
    color: "var(--accent-text)",
    border: "1px solid var(--accent-border)",
    padding: "6px 12px",
    fontSize: "13px",
  },
  sm: {
    padding: "6px 12px",
    fontSize: "13px",
  },
  lg: {
    padding: "12px 24px",
    fontSize: "15px",
  },
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size,
  style,
  disabled,
  onClick,
  ...rest
}) => {
  return (
    <button
      style={{
        ...styles.base,
        ...styles[variant],
        ...(size ? styles[size] : {}),
        ...(disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}),
        ...style,
      }}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
};
