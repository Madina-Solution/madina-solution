import * as React from "react";
import { Breadcrumb } from "./breadcrumb";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Action = {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: React.ReactNode;
};

type Props = {
  title: string;
  description?: string;
  label?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: Action[];
  children?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  label,
  breadcrumbs,
  actions,
  children,
  className = "",
}: Props) {
  return (
    <div className={`relative overflow-hidden border-b border-black/[0.06] bg-[#F7F5F1] ${className}`}>
      <div className="relative mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-16">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb items={breadcrumbs} className="mb-6" />
        )}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            {label && (
              <span className="eyebrow">
                {label}
              </span>
            )}
            <h1 className="mt-5 text-3xl font-bold tracking-[-0.04em] text-dark-900 sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            {description && (
              <p className="mt-4 max-w-2xl text-base leading-7 text-dark-600 lg:text-lg">{description}</p>
            )}
          </div>

          {actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {actions.map((action, index) => {
                const buttonClass = "inline-flex h-10 items-center gap-2 rounded-xl border border-dark-200 bg-white px-4 text-sm font-semibold text-dark-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:text-primary hover:shadow-md";
                if (action.href) {
                  return (
                    <a
                      key={index}
                      href={action.href}
                      className={buttonClass}
                    >
                      {action.icon}
                      {action.label}
                    </a>
                  );
                }
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={action.onClick}
                    className={buttonClass}
                  >
                    {action.icon}
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}
