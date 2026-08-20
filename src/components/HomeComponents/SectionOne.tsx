import React from "react";
import { Link } from "react-router-dom";
import imageSonarQube from "../../assets/files/images/background/sonarqube.png";
import type { SectionOneProps } from "../../types/sectionone.types";

const SectionOne: React.FC<SectionOneProps> = (props: Readonly<SectionOneProps>) => {
    const {
        title = "Information",
        subtitle = "Veuillez activer l'extension SonarQube dans votre éditeur de code afin de respecter les bonnes pratiques.",
        actions = [
            { label: "Commencer", to: "/example", variant: "primary" },
        ],
        imageAlt = "Développeurs travaillant sur un projet",
    } = props;

    return (
        <section className="py-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 items-center gap-8">
                {/* Texte */}
                <div className="md:col-span-7">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                        {title}
                    </h1>

                    <p className="mt-4 text-lg text-gray-600 max-w-2xl">
                        {subtitle}
                    </p>

                    <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3">
                        {actions.map((a) => (
                            <Link
                                key={a.to}
                                to={a.to}
                                className={
                                    a.variant === "primary"
                                        ? "inline-flex items-center justify-center px-5 py-3 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
                                        : "inline-flex items-center justify-center px-5 py-3 rounded-md border border-gray-200 text-gray-700 bg-white text-sm font-medium hover:bg-gray-50 transition"
                                }
                                aria-label={a.label}
                            >
                                {a.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Image */}
                <div className="md:col-span-5">
                    <div className="w-full rounded-lg overflow-hidden shadow-lg bg-gray-100">
                        <img
                            src={imageSonarQube}
                            alt={imageAlt}
                            loading="lazy"
                            className="object-cover w-full h-64 sm:h-80 md:h-64 lg:h-80"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SectionOne;