"use client";

import React from "react";

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={() => onOpenChange(false)}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

export function AlertDialogContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl shadow-2xl w-full max-w-md ${className}`}
    >
      {children}
    </div>
  );
}

export function AlertDialogHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="p-6 space-y-2">{children}</div>;
}

export function AlertDialogFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-end gap-2 p-6 pt-0 ${className}`}>{children}</div>
  );
}

export function AlertDialogTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`text-lg font-bold ${className}`}>{children}</h2>
  );
}

export function AlertDialogDescription({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-sm ${className}`}>{children}</p>
  );
}

export function AlertDialogCancel({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

export function AlertDialogAction({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg transition-colors ${className}`}
    >
      {children}
    </button>
  );
}
