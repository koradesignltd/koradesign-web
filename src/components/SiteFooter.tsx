import { Link } from "@tanstack/react-router";
import logo from "@/assets/kora-logo.png";

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
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Shop</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shop" className="hover:text-foreground">All products</Link></li>
            <li><Link to="/new" className="hover:text-foreground">New products</Link></li>
            <li><Link to="/about" className="hover:text-foreground">About us</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Follow us</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="https://www.instagram.com/koradesignltd/" target="_blank" rel="noreferrer" className="hover:text-foreground">Instagram</a></li>
            <li><a href="https://www.tiktok.com/@koradesignltd" target="_blank" rel="noreferrer" className="hover:text-foreground">TikTok</a></li>
            <li><a href="https://www.youtube.com/@koradesignltd" target="_blank" rel="noreferrer" className="hover:text-foreground">YouTube</a></li>
            <li><a href="https://rw.linkedin.com/company/koradesignltd" target="_blank" rel="noreferrer" className="hover:text-foreground">LinkedIn</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Kora Design. All rights reserved.
      </div>
    </footer>
  );
}
