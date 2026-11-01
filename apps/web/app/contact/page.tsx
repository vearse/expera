export default function ContactPage() {
  return (
    <main className="expera-container expera-section max-w-3xl">
      <h1 className="text-3xl font-bold text-expera-navy">Contact</h1>
      <p className="mt-4 leading-relaxed text-expera-ink-soft">
        For early access, partnerships and school enquiries, use the{" "}
        <a href="/#early-access" className="font-semibold text-expera-primary-deep hover:underline">
          early access form
        </a>{" "}
        on the home page.
      </p>
      <p className="mt-4 leading-relaxed text-expera-ink-soft">
        Email placeholder:{" "}
        <a href="mailto:hello@expera.ng" className="font-semibold text-expera-primary-deep hover:underline">
          hello@expera.ng
        </a>{" "}
        (configure before production launch).
      </p>
    </main>
  );
}
