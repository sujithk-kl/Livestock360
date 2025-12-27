import React from "react";

export default function AuthCard({ children, title, subtitle, maxWidth = "420px" }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-green-100 via-blue-50 to-indigo-100">
      <div
        className="bg-white border border-gray-200 rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        style={{ width: `min(90vw, ${maxWidth})`, aspectRatio: "1 / 1" }}
      >
        <div className="w-full h-full p-8 flex flex-col justify-center overflow-auto">
          {title && (
            <h2 className="text-3xl font-extrabold text-center text-green-700">{title}</h2>
          )}
          {subtitle && <p className="text-sm text-gray-500 text-center mb-4">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
