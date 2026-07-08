export default function Footer() {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-300 px-6 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
      <div>
        <h1 className="text-white text-lg font-semibold mb-2">GuildWorkman</h1>
        <p className="text-sm">
          Great platform to connect both Clients and Skilled workers
          <br />
          to give them a happy ending
        </p>
      </div>
      <div>
        <h1 className="text-white text-base font-semibold mb-2">About</h1>
        <p className="text-sm">Terms</p>
        <p className="text-sm">Pricing</p>
        <p className="text-sm">Advice</p>
        <p className="text-sm">Privacy Policy</p>
        <p className="text-sm">Clients</p>
      </div>
      <div>
        <h1 className="text-white text-base font-semibold mb-2">Resources</h1>
        <p className="text-sm">Guide</p>
        <p className="text-sm">Help Docs</p>
        <p className="text-sm">Contact Us</p>
        <p className="text-sm">Updates</p>
      </div>
      <div>
        <h1 className="text-white text-base font-semibold mb-2">Get job notifications</h1>
        <p className="text-sm">The latest job news articles sent to your inbox everyday</p>
      </div>
    </footer>
  );
}
