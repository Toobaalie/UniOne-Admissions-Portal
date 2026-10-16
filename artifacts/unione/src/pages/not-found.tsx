import { Link } from 'wouter';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-[#f8f6f0] px-5">
      <section className="max-w-md text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-[22px_22px_22px_7px] bg-[#203b61] text-[#f1bd7d]"><Compass size={27} /></div>
        <div className="eyebrow mt-6">A small detour</div>
        <h1 className="font-display mt-2 text-4xl font-extrabold tracking-[-.05em] text-[#203b61]">This page isn't on the map.</h1>
        <p className="mt-3 leading-7 text-[#6b788a]">The link may have moved, but your next step is still easy to find.</p>
        <Link href="/" className="button button-primary mt-6"><ArrowLeft size={15} />Back to UniOne</Link>
      </section>
    </div>
  );
}
