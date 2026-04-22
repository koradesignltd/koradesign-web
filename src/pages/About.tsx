import { Helmet } from "react-helmet-async";

export default function AboutPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <Helmet>
        <title>About — Kora Design</title>
        <meta name="description" content="Kora Design is a Rwandan studio crafting precision laser-cut wall art, signages and personalised gifts." />
        <meta property="og:title" content="About — Kora Design" />
        <meta property="og:description" content="Kora Design is a Rwandan studio crafting precision laser-cut wall art and gifts." />
      </Helmet>
      <div className="max-w-3xl">
        <div className="accent-line mb-3" />
        <h1 className="font-display text-4xl font-bold md:text-5xl">About Kora Design</h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Kora Design is a small Rwandan studio crafting precision laser-cut wall art,
          signages and personalised gifts. We believe in minimal, considered objects that
          bring warmth and meaning to modern spaces.
        </p>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Each piece is cut, finished and inspected by hand in our workshop. We work with
          natural woods, considered typography and a tight palette — so the work feels
          personal rather than mass-produced.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            { title: "Crafted to order", body: "Designs can be customised to your name, language or occasion." },
            { title: "Local, fast", body: "Made and delivered from Kigali — talk to us on WhatsApp." },
            { title: "Always minimal", body: "Black or white, clean typography, considered details." },
          ].map((b) => (
            <div key={b.title} className="card-elegant p-5">
              <h3 className="font-display text-lg font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold">Get in touch</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            WhatsApp:{" "}
            <a href="https://wa.me/250791446645" target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
              +250 791 446 645
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
