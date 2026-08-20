import React from "react";
import type { TemplateNoticeProps } from "../../types/template.types";

const TemplateNotice: React.FC<TemplateNoticeProps> = (props: Readonly<TemplateNoticeProps>) => {
    const {
        title = "Template ITDCMADA — Pour les développeurs",
        message = "Ce dépôt est un template pour démarrer rapidement les développements chez ITDCMADA. Respecte la structure, les conventions et les composants partagés.",
    } = props;


    return (
        <div
            aria-live="polite"
            className="mx-auto max-w-7xl px-6 py-4 rounded-lg bg-linear-to-r from-indigo-700 via-indigo-600 to-indigo-500 text-white shadow-md"
        >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-start gap-3">
                    <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-md bg-white/10">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path d="M12 2L2 7v6c0 5 5 9 10 9s10-4 10-9V7L12 2z" fill="currentColor" opacity="0.15" />
                            <path d="M12 8v4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="16" r="1" fill="white" />
                        </svg>
                    </span>

                    <div>
                        <h3 className="text-base font-semibold">{title}</h3>
                        <p className="mt-1 text-sm text-white/90 max-w-xl">{message}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs text-white/90">Template version: <strong className="ml-1">1.0.0</strong></span>
                </div>
            </div>
        </div>
    );
};

export default TemplateNotice;