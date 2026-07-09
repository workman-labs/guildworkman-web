export default function Footer() {
  return (
    <footer className="mt-auto bg-ink-900 text-ink-300">
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <h2 className="font-heading text-cream text-lg font-semibold mb-3">GuildWorkman</h2>
          <p className="text-sm leading-relaxed">
            Connecting clients with skilled workers they can trust — booked
            appointments, fair pay, verified reputations.
          </p>
        </div>
        <div>
          <h3 className="text-cream text-sm font-semibold uppercase tracking-wide mb-3">About</h3>
          <ul className="space-y-2 text-sm">
            <li>Terms</li>
            <li>Pricing</li>
            <li>Advice</li>
            <li>Privacy Policy</li>
            <li>Clients</li>
          </ul>
        </div>
        <div>
          <h3 className="text-cream text-sm font-semibold uppercase tracking-wide mb-3">Resources</h3>
          <ul className="space-y-2 text-sm">
            <li>Guide</li>
            <li>Help Docs</li>
            <li>Contact Us</li>
            <li>Updates</li>
          </ul>
        </div>
        <div>
          <h3 className="text-cream text-sm font-semibold uppercase tracking-wide mb-3">Stay in the loop</h3>
          <p className="text-sm leading-relaxed">
            The latest jobs and platform news, sent to your inbox.
          </p>
        </div>
      </div>
      <div className="border-t border-cream/10 px-6 py-6 text-center text-xs text-ink-500">
        &copy; {new Date().getFullYear()} GuildWorkman
      </div>
    </footer>
  );
}
