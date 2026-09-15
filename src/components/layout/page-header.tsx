import * as React from "react";
import { Breadcrumb } from "./breadcrumb";

type BreadcrumbItem = { label: string; href?: string };
type Action = { label: string; onClick?: () => void; href?: string; icon?: React.ReactNode };
type Props = { title: string; description?: string; label?: string; breadcrumbs?: BreadcrumbItem[]; actions?: Action[]; children?: React.ReactNode; className?: string };

export function PageHeader({ title, description, label, breadcrumbs, actions, children, className = "" }: Props) {
  return (
    <div className={`relative overflow-hidden border-b border-dark-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,.94),rgba(248,246,242,.78))] ${className}`}>
      <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-primary/8 blur-[100px]" />
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6 lg:py-14">
        {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} className="mb-7" />}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            {label && <span className="section-kicker">{label}</span>}
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-dark sm:text-5xl">{title}</h1>
            {description && <p className="mt-4 max-w-2xl text-lg leading-8 text-dark-600">{description}</p>}
          </div>
          {actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {actions.map((action,index) => {
                const buttonClass = "inline-flex items-center gap-2 rounded-2xl border border-dark-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary hover:shadow-premium";
                if (action.href) return <a key={index} href={action.href} className={buttonClass}>{action.icon}{action.label}</a>;
                return <button key={index} type="button" onClick={action.onClick} className={buttonClass}>{action.icon}{action.label}</button>;
              })}
            </div>
          )}
        </div>
        {children && <div className="mt-7">{children}</div>}
      </div>
    </div>
  );
}
