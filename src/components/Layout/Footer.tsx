import React, { useState } from "react";
import { Link } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LogoITDC from "../../assets/files/images/logo/itdc_logo.png";
import { InsertLinkOutlined } from "@mui/icons-material";
import type { FooterProps, SocialItem } from "../../types/footer.types";

function SocialIcon({ kind }: Readonly<{ kind?: SocialItem["kind"] }>) {
    switch (kind) {
        case "web":
            return <InsertLinkOutlined fontSize="large" color="primary" />;
        case "linkedin":
            return <LinkedInIcon fontSize="large" color="primary" />;
        case "facebook":
            return <FacebookIcon fontSize="large" color="primary" />;
        default:
            return <OpenInNewIcon fontSize="large" color="primary" />;
    }
}

const Footer: React.FC<FooterProps> = (props: Readonly<FooterProps>) => {
    const {
        companyName = "ITDC Mada",
        navLinks = [{ label: "Accueil", to: "/" }, { label: "Example", to: "/example" }],
        contact = { email: "contact@itdcmada.mg", phone: "+261 34 28 085 30", address: "Fianarantsoa, Madagascar" },
        socials = [
            { href: "https://itdcmada.mg/", kind: "web", ariaLabel: "Site Web" },
            { href: "https://www.linkedin.com/company/itdcmada", kind: "linkedin", ariaLabel: "LinkedIn" },
            { href: "https://www.facebook.com/itdcmada", kind: "facebook", ariaLabel: "Facebook" },
        ],
        onSubscribe,
    } = props;

    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setMessage("Adresse e-mail invalide.");
            return;
        }

        try {
            setSubmitting(true);
            if (onSubscribe) {
                await onSubscribe(email);
            } else {
                // template behaviour: log it (developers should override onSubscribe)
                // eslint-disable-next-line no-console
                console.info("Subscribe (template):", email);
            }
            setMessage("Merci ! Vérifie ta boîte mail.");
            setEmail("");
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
            setMessage("Une erreur est survenue, réessaye plus tard.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <footer className="bg-gray-900 text-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="inline-flex items-center gap-3">
                            <img
                                src={LogoITDC}
                                alt={`${companyName} logo`}
                                loading="lazy"
                                className="w-12 h-12 object-contain"
                            />
                            <span className="text-2xl font-bold tracking-tight text-primary">{companyName}</span>
                        </Link>

                        <p className="text-sm text-gray-300 max-w-xs">
                            Petit texte à propos du site. Personnalise-le pour présenter ta mission, ton produit ou un
                            slogan court et percutant.
                        </p>

                        <div className="flex items-center gap-2">
                            {socials.map((s) => (
                                // stable key: combine kind and href (href should be unique)
                                <IconButton
                                    key={`${s.kind ?? "social"}-${s.href}`}
                                    component="a"
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.ariaLabel ?? `Ouvrir ${companyName} social`}
                                    size="small"
                                    className="text-gray-300 hover:text-primary hover:bg-primary/5 p-2"
                                >
                                    <SocialIcon kind={s.kind} />
                                </IconButton>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div className="md:col-span-2 grid grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Liens utiles</h4>
                            <ul className="mt-4 space-y-2 text-sm text-gray-300">
                                {navLinks.map((link) => (
                                    <li key={link.to}>
                                        <Link to={link.to} className="hover:text-primary transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Contact</h4>
                            <ul className="mt-4 space-y-2 text-sm text-gray-300">
                                {contact.email && (
                                    <li>
                                        <a href={`mailto:${contact.email}`} className="hover:text-primary transition-colors">
                                            {contact.email}
                                        </a>
                                    </li>
                                )}
                                {contact.phone && (
                                    <li>
                                        <a href={`tel:${contact.phone}`} className="hover:text-primary transition-colors">
                                            {contact.phone}
                                        </a>
                                    </li>
                                )}
                                {contact.address && <li className="text-gray-400">{contact.address}</li>}
                            </ul>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Newsletter</h4>
                        <p className="text-sm text-gray-300">
                            Reçois les nouveautés et ressources utiles — une ou deux fois par mois.
                        </p>

                        <form onSubmit={handleSubscribe} className="mt-3 flex items-center gap-2">
                            <label htmlFor="footer-newsletter" className="sr-only">
                                Email
                            </label>
                            <input
                                id="footer-newsletter"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="ton.email@exemple.com"
                                className="flex-1 px-3 py-2 border rounded-md bg-primary/5 text-sm placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                aria-label="Adresse e-mail pour la newsletter"
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 rounded-md bg-indigo-500 hover:bg-indigo-600 text-primary text-sm transition-colors disabled:opacity-60"
                                aria-disabled={submitting}
                            >
                                {submitting ? "..." : "S'inscrire"}
                            </button>
                        </form>

                        {message && <p className="text-xs text-gray-300 mt-2">{message}</p>}

                        <p className="text-xs text-gray-400 mt-2 max-w-[18rem]">
                            Nous respectons ta vie privée. Aucun spam — tu peux te désinscrire à tout moment.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;