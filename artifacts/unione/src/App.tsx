import { useEffect, useRef, type ReactNode } from 'react';
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { ShieldCheck } from 'lucide-react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { AppShell, DashboardPage, ProfilePage, ShortlistPage, UniversityDetailPage, UniversitiesPage } from '@/pages/app-pages';
import { LandingPage } from '@/pages/landing';
import { Link, Route, Switch, useLocation, Redirect, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#203b61',
    colorForeground: '#263b58',
    colorMutedForeground: '#68778c',
    colorDanger: '#a84438',
    colorBackground: '#fffdf8',
    colorInput: '#fffdf8',
    colorInputForeground: '#263b58',
    colorNeutral: '#d8d2c6',
    fontFamily: 'DM Sans',
    borderRadius: '0.9rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'cl-cardBox bg-[#fffdf8] rounded-2xl w-[440px] max-w-full overflow-hidden border border-[#e7e0d3]',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#243a58] font-bold',
    headerSubtitle: 'text-[#647187]',
    socialButtonsBlockButtonText: 'text-[#243a58] font-semibold',
    formFieldLabel: 'text-[#46566d] font-semibold',
    footerActionLink: 'text-[#a96832] font-semibold',
    footerActionText: 'text-[#65748a]',
    dividerText: 'text-[#65748a]',
    identityPreviewEditButton: 'text-[#a96832]',
    formFieldSuccessText: 'text-[#4f7a61]',
    alertText: 'text-[#75423a]',
    logoBox: 'rounded-xl overflow-hidden',
    logoImage: 'rounded-xl',
    socialButtonsBlockButton: 'border border-[#e5dfd4] bg-[#fffdf8] rounded-xl',
    formButtonPrimary: 'bg-[#203b61] !text-white rounded-xl font-bold',
    formFieldInput: 'rounded-xl border-[#ded9ce] bg-[#fffdf8] text-[#263b58]',
    footerAction: 'text-[#65748a]',
    dividerLine: 'bg-[#e6e0d6]',
    alert: 'rounded-xl',
    otpCodeFieldInput: 'rounded-xl border-[#ded9ce]',
    formFieldRow: 'gap-2',
    main: 'gap-5',
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const client = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) client.clear();
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, client]);
  return null;
}

function HomeRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <div className="min-h-[100dvh] bg-[#f8f6f0]" />;
  return isSignedIn ? <Redirect to="/dashboard" /> : <LandingPage />;
}

function Protected({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <div className="min-h-[100dvh] bg-[#f6f4ee]" />;
  if (!isSignedIn) return <Redirect to="/" />;
  return <AppShell>{children}</AppShell>;
}

function DiscoveryRoute({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <div className="min-h-[100dvh] bg-[#f8f6f0]" />;
  if (isSignedIn) return <AppShell>{children}</AppShell>;

  return <div className="min-h-[100dvh] bg-[#f8f6f0]">
    <header className="page-wrap public-header">
      <Link href="/" className="brand text-[#203b61]"><span className="brand-mark">U</span>UniOne</Link>
      <nav className="flex items-center gap-3">
        <Link href="/" className="hidden px-3 py-2 text-sm font-bold text-[#52647a] sm:inline">Home</Link>
        <Link href="/sign-in" className="button button-outline min-h-10 px-4 text-sm">Sign in</Link>
        <Link href="/sign-up" className="button button-primary min-h-10 px-4 text-sm">Get started</Link>
      </nav>
    </header>
    {children}
  </div>;
}

function DashboardRoute() { return <Protected><DashboardPage /></Protected>; }
function UniversitiesRoute() { return <DiscoveryRoute><UniversitiesPage /></DiscoveryRoute>; }
function UniversityRoute() { return <DiscoveryRoute><UniversityDetailPage /></DiscoveryRoute>; }
function ProfileRoute() { return <Protected><ProfilePage /></Protected>; }
function ShortlistRoute() { return <Protected><ShortlistPage /></Protected>; }

function SignInPage() {
  return <div className="grid min-h-[100dvh] items-center justify-items-center bg-[#f3f0e8] px-4 py-10 md:grid-cols-[minmax(300px,1fr)_minmax(400px,500px)] md:gap-12 md:px-[max(5vw,40px)]">
    <section className="hidden max-w-xl md:block"><Link className="brand text-[#203b61]" href="/"><span className="brand-mark">U</span>UniOne</Link><div className="eyebrow mt-14">Your next chapter</div><h1 className="font-display mt-4 text-[52px] font-extrabold leading-[1.02] tracking-[-.06em] text-[#203b61]">Admissions feel clearer when you start together.</h1><p className="mt-5 max-w-md text-[16px] leading-7 text-[#69788b]">Sign in to pick up where you left off — your profile and saved opportunities are right where you need them.</p><div className="mt-8 flex items-center gap-3 text-sm font-semibold text-[#59735f]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e5ede3]"><ShieldCheck size={17}/></span>One profile, ready to reuse</div></section>
    <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
  </div>;
}

function SignUpPage() {
  return <div className="grid min-h-[100dvh] items-center justify-items-center bg-[#f3f0e8] px-4 py-10 md:grid-cols-[minmax(300px,1fr)_minmax(400px,500px)] md:gap-12 md:px-[max(5vw,40px)]">
    <section className="hidden max-w-xl md:block"><Link className="brand text-[#203b61]" href="/"><span className="brand-mark">U</span>UniOne</Link><div className="eyebrow mt-14">A clearer beginning</div><h1 className="font-display mt-4 text-[52px] font-extrabold leading-[1.02] tracking-[-.06em] text-[#203b61]">Build the profile that moves with you.</h1><p className="mt-5 max-w-md text-[16px] leading-7 text-[#69788b]">Create your UniOne account and start mapping the possibilities, one manageable step at a time.</p><div className="mt-8 flex items-center gap-3 text-sm font-semibold text-[#59735f]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e5ede3]"><ShieldCheck size={17}/></span>Private, editable and yours</div></section>
    <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
  </div>;
}

function ClerkRoutes() {
  const [, setLocation] = useLocation();
  return <ClerkProvider
    publishableKey={clerkPubKey}
    proxyUrl={clerkProxyUrl}
    appearance={clerkAppearance}
    signInUrl={`${basePath}/sign-in`}
    signUpUrl={`${basePath}/sign-up`}
    localization={{
      signIn: { start: { title: 'Welcome back', subtitle: 'Sign in to continue your admissions journey.' } },
      signUp: { start: { title: 'Start your UniOne profile', subtitle: 'Create an account to keep your options together.' } },
    }}
    routerPush={(to) => setLocation(stripBase(to))}
    routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
  >
    <ClerkQueryClientCacheInvalidator />
    <Switch>
      <Route path="/" component={HomeRoute} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/dashboard" component={DashboardRoute} />
      <Route path="/universities" component={UniversitiesRoute} />
      <Route path="/universities/:slug" component={UniversityRoute} />
      <Route path="/profile" component={ProfileRoute} />
      <Route path="/shortlist" component={ShortlistRoute} />
      <Route component={NotFound} />
    </Switch>
  </ClerkProvider>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WouterRouter base={basePath}>
        <RoutedErrorBoundary><ClerkRoutes /></RoutedErrorBoundary>
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  </QueryClientProvider>;
}

export default App;
