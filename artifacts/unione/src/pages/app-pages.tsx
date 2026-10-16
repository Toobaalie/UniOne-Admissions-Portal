import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth, useUser } from '@clerk/react';
import {
  ArrowDownRight, ArrowLeft, ArrowRight, Bookmark, Check, CheckCircle2,
  CircleHelp, Clock3, GraduationCap, MapPin, Plus, Search,
  SlidersHorizontal, Sparkles, Trash2, UserRound, WalletCards, X,
} from 'lucide-react';
import {
  getGetStudentProfileQueryKey, getListShortlistQueryKey,
  useAddProgramToShortlist,
  useGetStudentProfile, useGetUniversity, useListShortlist,
  useListUniversities, useRemoveProgramFromShortlist, useSaveStudentProfile,
} from '@workspace/api-client-react';
import type { EducationRecord, ListUniversitiesParams, Program, StudentProfileInput, TestScore, University } from '@workspace/api-client-react';

const money = (value?: number | null) => value == null ? 'Fee information unavailable' : `PKR ${new Intl.NumberFormat('en-PK').format(value)} / year`;
const dateLabel = (value?: string | null) => value ? new Date(value).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date to be announced';
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase();

export function LoadingRows({ count = 3 }: { count?: number }) {
  return <div className="grid gap-3" aria-label="Loading content">{Array.from({ length: count }, (_, i) => <div key={i} className="subtle-card flex items-center gap-4 p-5"><div className="skeleton h-12 w-12" /><div className="flex-1 space-y-2"><div className="skeleton h-4 w-2/5" /><div className="skeleton h-3 w-3/5" /></div></div>)}</div>;
}

function ErrorPanel({ retry, message = 'We could not load this just now.' }: { retry: () => void; message?: string }) {
  return <div className="error-state"><div className="font-bold">{message}</div><p className="mb-4 mt-1 text-sm">Your progress is safe. Please try again in a moment.</p><button className="button button-outline min-h-9 px-3 text-sm" onClick={retry} data-testid="button-retry">Try again</button></div>;
}

function UniversityMark({ name, gold = false }: { name: string; gold?: boolean }) {
  return <div className={`university-monogram${gold ? ' gold' : ''}`} aria-hidden="true">{initials(name)}</div>;
}

function UniversityCard({ item }: { item: University }) {
  return <Link href={`/universities/${item.slug}`} className="subtle-card group block p-5 transition-transform hover:-translate-y-1" data-testid={`card-university-${item.id}`}>
    <div className="flex items-start gap-4"><UniversityMark name={item.shortName || item.name} gold /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="section-title text-[18px] leading-tight">{item.name}</h3>{item.scholarshipAvailable && <span className="pill">Scholarships</span>}</div><p className="mt-1 flex items-center gap-1.5 text-sm text-[#69778a]"><MapPin size={14} />{item.city}</p></div><ArrowRight size={18} className="mt-1 text-[#a2a9ac] transition-transform group-hover:translate-x-1" /></div>
    <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#657286]">{item.description}</p>
    <div className="mt-5 flex items-center justify-between border-t border-[#eee9df] pt-4 text-xs font-semibold text-[#68768a]"><span>{item.programCount} programs</span><span>{money(item.minAnnualFeePkr)}</span></div>
  </Link>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user } = useUser();
  const links = [
    { href: '/dashboard', title: 'Overview', icon: GraduationCap },
    { href: '/universities', title: 'Explore universities', icon: Search },
    { href: '/shortlist', title: 'My shortlist', icon: Bookmark },
    { href: '/profile', title: 'My profile', icon: UserRound },
  ];
  const active = (href: string) => location === href || (href === '/universities' && location.startsWith('/universities/'));
  return <div className="page-shell">
    <aside className="side-nav">
      <Link href="/" className="brand mb-12 px-2 text-[#fffaf1]"><span className="brand-mark">U</span>UniOne</Link>
      <div className="eyebrow mb-3 px-3 text-[#aebfd1]">Your admissions</div>
      <nav>{links.map(({ href, title, icon: Icon }) => <Link key={href} href={href} className={`nav-link${active(href) ? ' active' : ''}`} data-testid={`link-${title.toLowerCase().replaceAll(' ', '-')}`}><Icon size={18} strokeWidth={1.8} />{title}</Link>)}</nav>
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/[.06] p-4"><div className="mb-2 flex items-center gap-2 text-sm font-bold"><CircleHelp size={16} className="text-[#f0bc7b]" />A clear next step</div><p className="m-0 text-xs leading-5 text-[#c7d3e0]">Your profile can be reused for every opportunity you explore.</p><Link href="/profile" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#f3c18a]">Complete your profile <ArrowRight size={13} /></Link></div>
      <div className="mt-5 flex items-center gap-3 border-t border-white/10 px-2 pt-5"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#f1bd7b] text-sm font-bold text-[#203b61]">{initials(user?.firstName || user?.fullName || 'S')}</div><div className="min-w-0"><div className="truncate text-sm font-bold">{user?.firstName || 'Student'}</div><div className="truncate text-xs text-[#b8c7d7]">Admissions profile</div></div></div>
    </aside>
    <div className="shell-main">
      <header className="topbar"><div><span className="text-sm font-semibold text-[#69778a]">Your admissions, in one place</span></div><div className="flex items-center gap-3"><span className="pill"><span className="h-2 w-2 rounded-full bg-[#5a9c79]" />Private & secure</span><Link href="/profile" className="grid h-9 w-9 place-items-center rounded-full bg-[#f1dfc5] text-sm font-extrabold text-[#294361]" aria-label="Open profile">{initials(user?.firstName || user?.fullName || 'S')}</Link></div></header>
      <header className="mobile-top"><Link href="/" className="brand text-[#fffaf1]"><span className="brand-mark">U</span>UniOne</Link><Link href="/profile" aria-label="Open profile" className="grid h-9 w-9 place-items-center rounded-full bg-[#f1bd7b] text-sm font-bold text-[#203b61]">{initials(user?.firstName || user?.fullName || 'S')}</Link></header>
      {children}
      <nav className="mobile-nav">{links.map(({ href, title, icon: Icon }) => <Link key={href} href={href} className={active(href) ? 'active' : ''}><Icon size={18} />{title.split(' ')[0]}</Link>)}</nav>
    </div>
  </div>;
}

export function DashboardPage() {
  const profile = useGetStudentProfile();
  const shortlist = useListShortlist();
  const { user } = useUser();
  const pct = profile.data?.completionPercent ?? 0;
  const nextStep = !profile.data?.legalName ? 'Add your personal details' : profile.data.education.length === 0 ? 'Add your education history' : profile.data.testScores.length === 0 ? 'Add your test scores' : 'Review your admissions profile';
  return <main className="content-area">
    <div className="mb-8 animate-rise"><div className="eyebrow">Your dashboard</div><h1 className="section-title mt-2 text-3xl md:text-[38px]">Welcome back{user?.firstName ? `, ${user.firstName}` : ''}.</h1><p className="mt-2 text-[#6b788a]">A little progress now makes the next application easier.</p></div>
    {(profile.isError || shortlist.isError) && <div className="mb-5"><ErrorPanel retry={() => { void profile.refetch(); void shortlist.refetch(); }} /></div>}
    <section className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
      <div className="subtle-card relative overflow-hidden p-6 md:p-8">
        <div className="absolute -right-8 -top-16 h-52 w-52 rounded-full border border-[#f0cfaa] opacity-50" /><div className="absolute -right-2 -top-10 h-40 w-40 rounded-full border border-[#f0cfaa] opacity-50" />
        <div className="relative flex flex-wrap items-start justify-between gap-6"><div className="max-w-lg"><div className="eyebrow">Your profile</div><h2 className="section-title mt-3 text-2xl">One profile. Every opportunity.</h2><p className="mt-2 max-w-md text-sm leading-6 text-[#68768a]">Build your reusable admissions profile once, then keep it ready as you discover programs.</p><Link href="/profile" className="button button-primary mt-5" data-testid="button-continue-profile">{pct > 0 ? 'Continue your profile' : 'Build your profile'}<ArrowRight size={16} /></Link></div>
          <div className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#c98242 ${pct * 3.6}deg, #efe9de 0deg)` }}><div className="grid h-[88px] w-[88px] place-items-center rounded-full bg-[#fffdf8]"><div className="text-center"><div className="font-display text-2xl font-extrabold text-[#203b61]">{profile.isLoading ? '—' : `${pct}%`}</div><div className="text-[10px] font-semibold text-[#788291]">complete</div></div></div></div>
        </div>
      </div>
      <div className="subtle-card flex flex-col justify-between p-6"><div><div className="eyebrow">Suggested next step</div><div className="mt-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f6ead9] text-[#bd7a3b]"><ArrowDownRight size={21} /></div><h3 className="section-title mt-4 text-xl">{profile.isLoading ? 'Finding your next step…' : nextStep}</h3><p className="mt-2 text-sm leading-6 text-[#69778a]">Your information stays in one place and is easy to update whenever things change.</p></div><Link href="/profile" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#234369]">Go to profile <ArrowRight size={15} /></Link></div>
    </section>
    <section className="mt-10">
      <div className="mb-4 flex items-end justify-between gap-3"><div><div className="eyebrow">Saved for later</div><h2 className="section-title mt-1 text-2xl">Your shortlist</h2></div><Link href="/shortlist" className="text-sm font-bold text-[#355579]">See all <ArrowRight className="ml-1 inline" size={14} /></Link></div>
      {shortlist.isLoading ? <LoadingRows count={2} /> : shortlist.data?.length ? <div className="grid gap-3 md:grid-cols-2">{shortlist.data.slice(0, 2).map((item) => <Link key={item.programId} href={`/universities/${item.universitySlug}`} className="subtle-card flex items-center gap-4 p-5" data-testid={`shortlist-preview-${item.programId}`}><UniversityMark name={item.universityName} /><div className="min-w-0 flex-1"><h3 className="section-title truncate text-[16px]">{item.programName}</h3><p className="mt-1 truncate text-sm text-[#758092]">{item.universityName} · {item.city}</p></div><ArrowRight size={16} className="text-[#8893a1]" /></Link>)}</div> : <div className="empty-state"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f4eadb] text-[#ba7940]"><Bookmark size={21} /></div><h3 className="section-title mt-4 text-lg">Your shortlist starts here</h3><p className="mx-auto mt-1 max-w-md text-sm text-[#6b788a]">Save programs that feel right, then compare them when you are ready.</p><Link href="/universities" className="button button-primary mt-4">Explore programs <ArrowRight size={15} /></Link></div>}
    </section>
    <section className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-[#e9eee9] p-6 md:px-8"><div className="flex items-start gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#fffaf1] text-[#395c70]"><Sparkles size={20} /></div><div><div className="eyebrow text-[#557562]">Start exploring</div><h2 className="section-title mt-1 text-xl">Find a place that fits your plans.</h2><p className="mt-1 text-sm text-[#65756e]">Browse universities, fees, deadlines and scholarship availability.</p></div></div><Link href="/universities" className="button button-outline">Explore universities <ArrowRight size={15} /></Link></section>
  </main>;
}

export function UniversitiesPage() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [field, setField] = useState('');
  const [degreeLevel, setDegreeLevel] = useState('');
  const [minFee, setMinFee] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [deadlineBefore, setDeadlineBefore] = useState('');
  const [scholarshipOnly, setScholarshipOnly] = useState(false);
  const [page, setPage] = useState(1);
  const params = useMemo<ListUniversitiesParams>(() => ({
    q: query || undefined,
    city: city || undefined,
    field: field || undefined,
    degreeLevel: degreeLevel || undefined,
    feeMin: minFee === '' ? undefined : Number(minFee),
    feeMax: maxFee === '' ? undefined : Number(maxFee),
    deadlineBefore: deadlineBefore || undefined,
    scholarshipOnly: scholarshipOnly || undefined,
    page,
    pageSize: 9,
  }), [query, city, field, degreeLevel, minFee, maxFee, deadlineBefore, scholarshipOnly, page]);
  const result = useListUniversities(params);
  return <main className="content-area">
    <div className="mb-7 animate-rise"><div className="eyebrow">Explore</div><h1 className="section-title mt-2 text-3xl md:text-[38px]">Universities & programs</h1><p className="mt-2 text-[#6b788a]">Explore your options with the details that matter most.</p></div>
    <div className="mb-5 rounded-xl border border-[#ead8bf] bg-[#fff8ed] px-4 py-3 text-sm leading-6 text-[#725b40]" role="note"><strong>Sample catalogue:</strong> university entries, fees, requirements, and deadlines are illustrative. Confirm current details directly with each institution.</div>
    <section className="subtle-card mb-6 p-4 md:p-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <label className="relative"><span className="sr-only">Search universities</span><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a94a1]" size={17} /><input className="field pl-10" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search universities or programs" data-testid="input-university-search" /></label>
        <select className="field" value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }} aria-label="Filter by city" data-testid="select-city"><option value="">All cities</option>{['Lahore','Karachi','Islamabad','Swabi','Peshawar','Quetta','Faisalabad','Multan'].map((name) => <option key={name}>{name}</option>)}</select>
        <select className="field" value={degreeLevel} onChange={(e) => { setDegreeLevel(e.target.value); setPage(1); }} aria-label="Filter by degree level" data-testid="select-degree-level"><option value="">All degree levels</option>{['Undergraduate','Postgraduate','Doctoral'].map((name) => <option key={name}>{name}</option>)}</select>
        <select className="field" value={field} onChange={(e) => { setField(e.target.value); setPage(1); }} aria-label="Filter by field" data-testid="select-field"><option value="">All fields</option>{['Engineering','Computing','Business','Sciences','Health Sciences','Social Sciences','Economics','Architecture','Education'].map((name) => <option key={name}>{name}</option>)}</select>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr_auto_auto]">
        <label><span className="field-label">Minimum annual fee (PKR)</span><input className="field" type="number" min="0" value={minFee} onChange={(e) => { setMinFee(e.target.value); setPage(1); }} placeholder="No minimum" data-testid="input-min-fee" /></label>
        <label><span className="field-label">Maximum annual fee (PKR)</span><input className="field" type="number" min="0" value={maxFee} onChange={(e) => { setMaxFee(e.target.value); setPage(1); }} placeholder="No maximum" data-testid="input-max-fee" /></label>
        <label><span className="field-label">Deadline on or before</span><input className="field" type="date" value={deadlineBefore} onChange={(e) => { setDeadlineBefore(e.target.value); setPage(1); }} data-testid="input-deadline-before" /></label>
        <button onClick={() => { setScholarshipOnly(!scholarshipOnly); setPage(1); }} className={`button self-end ${scholarshipOnly ? 'button-primary' : 'button-outline'}`} data-testid="button-scholarships"><SlidersHorizontal size={16} />Scholarships</button>
        <button onClick={() => { setQuery(''); setCity(''); setField(''); setDegreeLevel(''); setMinFee(''); setMaxFee(''); setDeadlineBefore(''); setScholarshipOnly(false); setPage(1); }} className="button button-outline self-end" data-testid="button-reset-filters">Reset</button>
      </div>
    </section>
    <div className="mb-4 flex items-center justify-between"><div className="text-sm text-[#718094]">{result.isLoading ? 'Finding universities…' : `${result.data?.total ?? 0} universities to explore`}</div><div className="pill"><CheckCircle2 size={13} />Details worth comparing</div></div>
    {result.isLoading ? <LoadingRows count={6} /> : result.isError ? <ErrorPanel retry={() => void result.refetch()} message="University search is taking a pause." /> : result.data?.items.length ? <><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{result.data.items.map((item) => <UniversityCard key={item.id} item={item} />)}</div><div className="mt-7 flex items-center justify-between"><span className="text-sm text-[#778395]">Page {result.data.page} of {Math.max(1, Math.ceil(result.data.total / result.data.pageSize))}</span><div className="flex gap-2"><button className="button button-outline min-h-10 px-3" disabled={page <= 1} onClick={() => setPage((n) => Math.max(1, n - 1))} data-testid="button-previous-page"><ArrowLeft size={15} />Previous</button><button className="button button-outline min-h-10 px-3" disabled={page * result.data.pageSize >= result.data.total} onClick={() => setPage((n) => n + 1)} data-testid="button-next-page">Next<ArrowRight size={15} /></button></div></div></> : <div className="empty-state"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f4eadb] text-[#ba7940]"><Search size={21} /></div><h3 className="section-title mt-4 text-lg">No matches, yet</h3><p className="mt-1 text-sm text-[#6b788a]">Try a broader search or clear one of your filters.</p><button className="button button-outline mt-4" onClick={() => { setQuery(''); setCity(''); setField(''); setDegreeLevel(''); setMinFee(''); setMaxFee(''); setDeadlineBefore(''); setScholarshipOnly(false); setPage(1); }} data-testid="button-clear-filters"><X size={15} />Clear filters</button></div>}
  </main>;
}

function ProgramRow({ program, saved }: { program: Program; saved: boolean }) {
  const client = useQueryClient();
  const { isLoaded, isSignedIn } = useAuth();
  const [, setLocation] = useLocation();
  const add = useAddProgramToShortlist({ mutation: { onSuccess: () => client.invalidateQueries({ queryKey: getListShortlistQueryKey() }) } });
  const remove = useRemoveProgramFromShortlist({ mutation: { onSuccess: () => client.invalidateQueries({ queryKey: getListShortlistQueryKey() }) } });
  const toggle = () => {
    if (!isSignedIn) {
      setLocation('/sign-in');
      return;
    }
    if (saved) remove.mutate({ programId: program.id });
    else add.mutate({ programId: program.id });
  };
  return <article className="flex flex-col gap-4 border-t border-[#eee8dd] py-5 sm:flex-row sm:items-center sm:justify-between" data-testid={`program-row-${program.id}`}>
    <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="section-title text-lg">{program.name}</h3>{program.scholarshipAvailable && <span className="pill">Scholarship available</span>}</div><p className="mt-1 text-sm text-[#748094]">{program.degreeLevel} · {program.field} · {program.durationYears} years</p><div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#647286]"><span className="inline-flex items-center gap-1"><WalletCards size={14} />{money(program.annualFeePkr)}</span><span className="inline-flex items-center gap-1"><Clock3 size={14} />Deadline {dateLabel(program.applicationDeadline)}</span></div>{program.requirements.length > 0 && <p className="mt-3 text-xs text-[#7a8492]">Typical requirements: {program.requirements.join(' · ')}</p>}</div>
     <button onClick={toggle} disabled={!isLoaded || add.isPending || remove.isPending} className={`button shrink-0 ${saved ? 'button-soft' : 'button-outline'}`} data-testid={`button-save-program-${program.id}`}>{saved ? <><Check size={15} />Saved</> : isSignedIn ? <><Plus size={15} />Add to shortlist</> : 'Sign in to save'}</button>
  </article>;
}

export function UniversityDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { isLoaded, isSignedIn } = useAuth();
  const detail = useGetUniversity(slug);
  const shortlist = useListShortlist({
    query: {
      enabled: isLoaded && Boolean(isSignedIn),
      queryKey: getListShortlistQueryKey(),
    },
  });
  if (detail.isLoading) return <main className="content-area"><LoadingRows count={4} /></main>;
  if (detail.isError || !detail.data) return <main className="content-area"><ErrorPanel retry={() => void detail.refetch()} message="We couldn't open this university." /><Link href="/universities" className="button button-outline mt-4"><ArrowLeft size={15} />Back to universities</Link></main>;
  const item = detail.data;
  const savedIds = new Set(shortlist.data?.map((entry) => entry.programId) ?? []);
  return <main className="content-area">
    <Link href="/universities" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#536c88]"><ArrowLeft size={16} />All universities</Link>
    <div className="mb-5 rounded-xl border border-[#ead8bf] bg-[#fff8ed] px-4 py-3 text-sm leading-6 text-[#725b40]" role="note"><strong>Sample catalogue:</strong> fees, requirements, and deadlines are illustrative. Confirm current details directly with the university.</div>
    <section className="subtle-card mb-7 overflow-hidden"><div className="h-2 bg-[#eab77b]" /><div className="flex flex-col gap-5 p-6 md:flex-row md:items-start md:p-8"><UniversityMark name={item.shortName || item.name} gold /><div className="flex-1"><div className="eyebrow">{item.city}, Pakistan</div><h1 className="section-title mt-2 text-3xl md:text-[40px]">{item.name}</h1><p className="mt-2 max-w-3xl text-sm leading-7 text-[#657286]">{item.about || item.description}</p><div className="mt-5 flex flex-wrap gap-2">{item.fields.map((field) => <span className="pill" key={field}>{field}</span>)}</div><div className="mt-6 flex flex-wrap gap-6 text-sm text-[#667489]"><span><strong className="text-[#243c5a]">{item.programCount}</strong> programs</span><span>{money(item.minAnnualFeePkr)}</span>{item.website && <a className="font-bold text-[#a56430] underline underline-offset-4" href={item.website} target="_blank" rel="noreferrer">Visit university website</a>}</div></div></div></section>
    <div className="mb-4 flex items-end justify-between"><div><div className="eyebrow">Find your fit</div><h2 className="section-title mt-1 text-2xl">Programs at {item.shortName || item.name}</h2></div><span className="pill">{item.programs.length} listed</span></div>
    <section className="subtle-card px-5 md:px-7">{item.programs.length ? item.programs.map((program) => <ProgramRow key={program.id} program={program} saved={savedIds.has(program.id)} />) : <div className="empty-state my-5"><h3 className="section-title text-lg">Program listings are on their way</h3><p className="mt-1 text-sm text-[#718094]">Check back as our catalogue grows.</p></div>}</section>
  </main>;
}

export function ShortlistPage() {
  const shortlist = useListShortlist();
  const client = useQueryClient();
  const remove = useRemoveProgramFromShortlist({ mutation: { onSuccess: () => client.invalidateQueries({ queryKey: getListShortlistQueryKey() }) } });
  return <main className="content-area">
    <div className="mb-7"><div className="eyebrow">Your saved programs</div><h1 className="section-title mt-2 text-3xl md:text-[38px]">My shortlist</h1><p className="mt-2 text-[#6b788a]">Keep possibilities close. Compare them at your own pace.</p></div>
    {shortlist.isLoading ? <LoadingRows count={4} /> : shortlist.isError ? <ErrorPanel retry={() => void shortlist.refetch()} /> : shortlist.data?.length ? <div className="grid gap-3">{shortlist.data.map((item) => <article key={item.programId} className="subtle-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between" data-testid={`shortlist-item-${item.programId}`}><div className="flex min-w-0 items-center gap-4"><UniversityMark name={item.universityName} /><div className="min-w-0"><Link href={`/universities/${item.universitySlug}`} className="section-title block truncate text-lg hover:underline">{item.programName}</Link><p className="mt-1 text-sm text-[#728094]">{item.universityName} · {item.city}</p><div className="mt-2 flex flex-wrap gap-2"><span className="pill">{item.degreeLevel}</span><span className="pill">{item.field}</span>{item.scholarshipAvailable && <span className="pill">Scholarship available</span>}</div></div></div><div className="flex items-center justify-between gap-4 sm:justify-end"><div className="text-right"><div className="text-sm font-bold text-[#334b68]">{money(item.annualFeePkr)}</div><div className="mt-1 text-xs text-[#7b8795]">Deadline {dateLabel(item.applicationDeadline)}</div></div><button onClick={() => remove.mutate({ programId: item.programId })} disabled={remove.isPending} aria-label={`Remove ${item.programName}`} className="grid h-10 w-10 place-items-center rounded-xl text-[#9a6b5b] hover:bg-[#f8eae4]" data-testid={`button-remove-${item.programId}`}><Trash2 size={17} /></button></div></article>)}</div> : <div className="empty-state"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f4eadb] text-[#ba7940]"><Bookmark size={21} /></div><h3 className="section-title mt-4 text-lg">Nothing saved just yet</h3><p className="mx-auto mt-1 max-w-md text-sm text-[#6b788a]">When a program catches your eye, save it here to make comparing easier.</p><Link href="/universities" className="button button-primary mt-4">Explore programs <ArrowRight size={15} /></Link></div>}
  </main>;
}

const blankInput: StudentProfileInput = { legalName: '', nationality: 'Pakistani', education: [], testScores: [] };
const toInputDate = (value?: string | null) => value ? value.slice(0, 10) : null;
function blankEducation(): EducationRecord { return { level: '', qualification: '', institution: '', board: '', completionYear: null, marksObtained: null, marksTotal: null }; }
function blankScore(): TestScore { return { testName: '', score: '', testDate: '' }; }

export function ProfilePage() {
  const profile = useGetStudentProfile();
  const save = useSaveStudentProfile();
  const client = useQueryClient();
  const [form, setForm] = useState<StudentProfileInput>(blankInput);
  const [initialized, setInitialized] = useState(false);
  const [notice, setNotice] = useState('');
  const lastSavedFingerprint = useRef('');
  useEffect(() => {
    if (profile.data && !initialized) {
      const { completionPercent: _pct, updatedAt: _updated, ...editable } = profile.data;
      const initial: StudentProfileInput = {
        ...blankInput,
        ...editable,
        dateOfBirth: toInputDate(editable.dateOfBirth),
        education: editable.education ?? [],
        testScores: (editable.testScores ?? []).map((score) => ({
          ...score,
          testDate: toInputDate(score.testDate),
        })),
      };
      setForm(initial);
      lastSavedFingerprint.current = JSON.stringify(initial);
      setInitialized(true);
    } else if (profile.isError && !initialized) {
      setInitialized(true);
    }
  }, [profile.data, profile.isError, initialized]);
  useEffect(() => {
    if (!initialized || profile.isLoading || save.isPending || !form.legalName.trim()) {
      return;
    }
    const fingerprint = JSON.stringify(form);
    if (fingerprint === lastSavedFingerprint.current) return;

    const timer = window.setTimeout(() => {
      setNotice('Saving your draft…');
      save.mutate(
        { data: form },
        {
          onSuccess: () => {
            lastSavedFingerprint.current = fingerprint;
            setNotice('Draft saved automatically.');
            void client.invalidateQueries({ queryKey: getGetStudentProfileQueryKey() });
          },
          onError: () => setNotice('Draft not saved. Check your connection and try again.'),
        },
      );
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [form, initialized, profile.isLoading, save.isPending, save.mutate, client]);
  const update = <K extends keyof StudentProfileInput>(key: K, value: StudentProfileInput[K]) => setForm((prev) => ({ ...prev, [key]: value }));
  const setEducation = (index: number, key: keyof EducationRecord, value: string) => update('education', form.education.map((entry, i) => i === index ? { ...entry, [key]: ['completionYear','marksObtained','marksTotal'].includes(key) ? (value === '' ? null : Number(value)) : value } : entry));
  const setScore = (index: number, key: keyof TestScore, value: string) => update('testScores', form.testScores.map((entry, i) => i === index ? { ...entry, [key]: value || null } : entry));
  const fieldInput = (label: string, key: keyof StudentProfileInput, placeholder = '', type = 'text') => <label className="block"><span className="field-label">{label}</span><input className="field" type={type} value={(form[key] as string | null | undefined) ?? ''} onChange={(e) => update(key, e.target.value)} placeholder={placeholder} data-testid={`input-profile-${String(key)}`} /></label>;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setNotice('');
    const fingerprint = JSON.stringify(form);
    save.mutate({ data: form }, { onSuccess: () => { lastSavedFingerprint.current = fingerprint; setNotice('Your profile is saved.'); void client.invalidateQueries({ queryKey: getGetStudentProfileQueryKey() }); }, onError: () => setNotice('We could not save your changes. Please try again.') });
  };
  if (profile.isLoading) return <main className="content-area"><LoadingRows count={5} /></main>;
  return <main className="content-area">
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><div className="eyebrow">Reusable admissions profile</div><h1 className="section-title mt-2 text-3xl md:text-[38px]">Your profile</h1><p className="mt-2 text-[#6b788a]">A few details now can make every next step feel lighter.</p></div>{profile.data && <span className="pill"><CheckCircle2 size={14} />{profile.data.completionPercent}% complete</span>}</div>
    {profile.isError && <div className="mb-5 rounded-xl border border-[#e8dccb] bg-[#fff8ed] p-4 text-sm text-[#77644c]" role="status">We could not retrieve your saved profile. You can still enter your details below and save them.</div>}
    <form onSubmit={submit} className="grid gap-5">
      <section className="subtle-card p-5 md:p-7"><div className="mb-5 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5eadb] text-[#bd7a3b]"><UserRound size={18} /></div><div><h2 className="section-title text-xl">Personal details</h2><p className="text-xs text-[#758094]">How institutions can identify and contact you</p></div></div><div className="grid gap-4 md:grid-cols-2">{fieldInput('Legal name', 'legalName', 'As shown on official documents')}{fieldInput('Nationality', 'nationality', 'Pakistani')}<label><span className="field-label">Date of birth</span><input className="field" type="date" value={form.dateOfBirth ?? ''} onChange={(e) => update('dateOfBirth', e.target.value || null)} data-testid="input-profile-dateOfBirth" /></label><label><span className="field-label">Gender (optional)</span><select className="field" value={form.gender ?? ''} onChange={(e) => update('gender', e.target.value || null)} data-testid="select-profile-gender"><option value="">Prefer not to say</option><option>Female</option><option>Male</option><option>Other</option></select></label>{fieldInput('Phone number', 'phone', '+92 300 0000000', 'tel')}{fieldInput('City', 'city', 'Lahore')}{fieldInput('Province / territory', 'province', 'Punjab')}</div></section>
      <section className="subtle-card p-5 md:p-7"><div className="mb-5 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e9efea] text-[#557c67]"><UserRound size={18} /></div><div><h2 className="section-title text-xl">Parent or guardian</h2><p className="text-xs text-[#758094]">A trusted contact, if required</p></div></div><div className="grid gap-4 md:grid-cols-2">{fieldInput('Guardian name', 'guardianName', 'Full name')}{fieldInput('Guardian phone', 'guardianPhone', '+92 300 0000000', 'tel')}</div></section>
      <section className="subtle-card p-5 md:p-7"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e9edf4] text-[#466483]"><GraduationCap size={19} /></div><div><h2 className="section-title text-xl">Education</h2><p className="text-xs text-[#758094]">Add your latest qualifications</p></div></div><button type="button" onClick={() => update('education', [...form.education, blankEducation()])} className="button button-outline min-h-9 px-3 text-sm" data-testid="button-add-education"><Plus size={15} />Add education</button></div>
        {form.education.length ? form.education.map((entry, index) => <div key={index} className="relative mb-4 rounded-xl border border-[#eee8dd] bg-[#fbf9f4] p-4"><button type="button" onClick={() => update('education', form.education.filter((_, i) => i !== index))} aria-label="Remove education record" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-[#9a6b5b] hover:bg-[#f8eae4]" data-testid={`button-remove-education-${index}`}><X size={15} /></button><div className="grid gap-3 pr-8 md:grid-cols-3"><label><span className="field-label">Level</span><select className="field" value={entry.level} onChange={(e) => setEducation(index,'level',e.target.value)}><option value="">Choose level</option>{['Secondary','Higher Secondary','Undergraduate','Graduate','Other'].map((x)=><option key={x}>{x}</option>)}</select></label><label><span className="field-label">Qualification</span><input className="field" value={entry.qualification} onChange={(e)=>setEducation(index,'qualification',e.target.value)} placeholder="e.g. FSc Pre-Engineering" /></label><label><span className="field-label">Institution</span><input className="field" value={entry.institution ?? ''} onChange={(e)=>setEducation(index,'institution',e.target.value)} placeholder="School or college" /></label><label><span className="field-label">Board</span><input className="field" value={entry.board ?? ''} onChange={(e)=>setEducation(index,'board',e.target.value)} placeholder="e.g. BISE Lahore" /></label><label><span className="field-label">Completion year</span><input className="field" type="number" min="1950" max="2100" value={entry.completionYear ?? ''} onChange={(e)=>setEducation(index,'completionYear',e.target.value)} /></label><div className="grid grid-cols-2 gap-2"><label><span className="field-label">Marks obtained</span><input className="field" type="number" value={entry.marksObtained ?? ''} onChange={(e)=>setEducation(index,'marksObtained',e.target.value)} /></label><label><span className="field-label">Total marks</span><input className="field" type="number" value={entry.marksTotal ?? ''} onChange={(e)=>setEducation(index,'marksTotal',e.target.value)} /></label></div></div></div>) : <div className="rounded-xl border border-dashed border-[#d9d2c4] p-5 text-center text-sm text-[#7a8593]">Your education history will appear here as you add it.</div>}
      </section>
      <section className="subtle-card p-5 md:p-7"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f4ead9] text-[#b8793f]"><CheckCircle2 size={18} /></div><div><h2 className="section-title text-xl">Test scores</h2><p className="text-xs text-[#758094]">Include tests you have taken, if any</p></div></div><button type="button" onClick={() => update('testScores', [...form.testScores, blankScore()])} className="button button-outline min-h-9 px-3 text-sm" data-testid="button-add-test"><Plus size={15} />Add a test</button></div>
        {form.testScores.length ? form.testScores.map((entry,index)=><div key={index} className="relative mb-3 grid gap-3 rounded-xl border border-[#eee8dd] bg-[#fbf9f4] p-4 pr-14 md:grid-cols-3"><label><span className="field-label">Test name</span><input className="field" value={entry.testName} onChange={(e)=>setScore(index,'testName',e.target.value)} placeholder="e.g. MDCAT" /></label><label><span className="field-label">Score</span><input className="field" value={entry.score ?? ''} onChange={(e)=>setScore(index,'score',e.target.value)} placeholder="Score or band" /></label><label><span className="field-label">Test date</span><input className="field" type="date" value={entry.testDate ?? ''} onChange={(e)=>setScore(index,'testDate',e.target.value)} /></label><button type="button" onClick={()=>update('testScores',form.testScores.filter((_,i)=>i!==index))} aria-label="Remove test score" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-[#9a6b5b] hover:bg-[#f8eae4]" data-testid={`button-remove-test-${index}`}><X size={15}/></button></div>) : <div className="rounded-xl border border-dashed border-[#d9d2c4] p-5 text-center text-sm text-[#7a8593]">No test scores added. You can always add them later.</div>}
      </section>
      <div className="sticky bottom-4 z-[5] flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e6dfd3] bg-[#fffdf8]/95 p-3 shadow-[0_12px_35px_rgba(41,52,65,.12)] backdrop-blur"><span role="status" className={`px-2 text-sm ${notice.includes('could not') ? 'text-[#9c493c]' : 'text-[#557760]'}`}>{save.isPending ? 'Saving your profile…' : notice || 'Only you can see your admissions profile.'}</span><button type="submit" disabled={save.isPending || !form.legalName.trim() || !form.nationality.trim()} className="button button-primary" data-testid="button-save-profile">{save.isPending ? 'Saving…' : 'Save profile'}<Check size={16}/></button></div>
    </form>
  </main>;
}
