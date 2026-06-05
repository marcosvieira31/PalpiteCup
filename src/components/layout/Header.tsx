export default function Header({ title }: { title: string }) {
  return (
    <header className="bg-primary bg-halftone text-white shadow-md relative overflow-hidden">
      <div className="container mx-auto px-4 h-24 flex items-end pb-4 relative z-10">
        <h1 className="font-bebas text-4xl tracking-wide">{title}</h1>
      </div>
      {/* Optional decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
    </header>
  );
}
