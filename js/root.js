// Client-side router - the only file that calls ReactDOM.createRoot/render.
//
// Routes:
//   /admin              -> AdminApp        (the dashboard - never linked to
//                                            from any public page, only
//                                            reachable by typing the URL)
//   /catalogue/<id>      -> PublicCatalogueViewer for that one catalogue
//   anything else        -> LandingPage
//
// Old share links using ?catalogueId=<id> or ?c=<id> still work - they get
// silently upgraded to the clean /catalogue/<id> URL.
//
// Note: since this app is served as a set of static files, your host needs
// to rewrite unknown paths (like /admin and /catalogue/xyz) to index.html,
// otherwise a hard refresh or a directly-typed URL will 404. On Firebase
// Hosting that's a "rewrites" rule in firebase.json pointing "**" at
// "/index.html".

window.navigateTo = (path) => {
    const current = window.location.pathname + window.location.search;
    if (path !== current) {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new Event('locationchange'));
    }
    window.scrollTo(0, 0);
};

const Root = () => {
    const [location, setLocation] = React.useState(() => ({
        pathname: window.location.pathname,
        search: window.location.search
    }));

    React.useEffect(() => {
        const onLocationChange = () => setLocation({
            pathname: window.location.pathname,
            search: window.location.search
        });
        window.addEventListener('popstate', onLocationChange);
        window.addEventListener('locationchange', onLocationChange);
        return () => {
            window.removeEventListener('popstate', onLocationChange);
            window.removeEventListener('locationchange', onLocationChange);
        };
    }, []);

    const { pathname, search } = location;

    // Hidden admin dashboard
    if (pathname === '/admin' || pathname === '/admin/') {
        return <AdminApp />;
    }

    // New-style catalogue URLs: /catalogue/<id>
    const catalogueMatch = pathname.match(/^\/catalogue\/([^/]+)\/?$/);
    if (catalogueMatch) {
        return <PublicCatalogueViewer catalogueId={catalogueMatch[1]} />;
    }

    // Legacy share links (?catalogueId=<id> or ?c=<id>) - upgrade the URL
    // in place so refreshes/copies from here on use the clean path.
    const params = new URLSearchParams(search);
    const legacyId = params.get('catalogueId') || params.get('c');
    if (legacyId) {
        window.history.replaceState({}, '', `/catalogue/${legacyId}`);
        return <PublicCatalogueViewer catalogueId={legacyId} />;
    }

    return <LandingPage />;
};

// firebase-init.js runs as a real ES module (needed for its CDN imports),
// which loads asynchronously - so window.db/collection/etc. may not exist
// yet at the moment this classic script runs. Wait for it before mounting,
// since AdminApp/PublicCatalogueViewer/LandingPage all touch those globals
// from effects that fire right after mount.
function mountApp() {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<Root />);
}

if (window.db) {
    mountApp();
} else {
    window.addEventListener('firebase-ready', mountApp, { once: true });
}
