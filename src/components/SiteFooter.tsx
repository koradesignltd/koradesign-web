import { Link } from "@tanstack/react-router";
import logo from "@/assets/kora-logo.png";
import { SOCIALS } from "@/lib/social";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Kora Design">
            <img src={logo} alt="Kora Design logo" width={36} height={36} className="h-9 w-9" />
            <span className="font-display text-lg font-semibold">Kora Design</span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Precision laser-cut wall art, signages and personalised gifts crafted with
            care. Black or white, always minimal.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {SOCIALS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Shop</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shop" className="hover:text-foreground">All products</Link></li>
            <li><Link to="/new" className="hover:text-foreground">New products</Link></li>
            <li><Link to="/gallery" className="hover:text-foreground">Gallery</Link></li>
            <li><Link to="/about" className="hover:text-foreground">About us</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Contact</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="https://wa.me/250791446645" target="_blank" rel="noreferrer" className="hover:text-foreground">WhatsApp: +250 791 446 645</a></li>
            <li><a href="mailto:koradesignltd@gmail.com" className="hover:text-foreground">koradesignltd@gmail.com</a></li>
            <li>Kigali, Rwanda</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5">
        <div className="container-page flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Kora Design. All rights reserved.</p>
          <p>
            Developed by{" "}
            <a
              href="https://isaie.cwanda.site"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground hover:text-primary"
            >
              cwanda.site
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
