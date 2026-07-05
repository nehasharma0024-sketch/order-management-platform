// The public landing page (the root domain "/"). Shows a hero, an about
// section, an Instagram link, and every catalogue that has items in it.
// Nothing here links to /admin - that stays unlisted on purpose.

// Small helper that fades/slides its children in once they scroll into view.
const Reveal = ({ children, className = '', delay = 0 }) => {
    const ref = React.useRef(null);
    const [visible, setVisible] = React.useState(false);

    React.useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            });
        }, { threshold: 0.15 });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
            {children}
        </div>
    );
};

// One catalogue's preview strip on the landing page: title, description,
// a handful of its items, and a link through to the catalogue's own page.
const CatalogueSection = ({ catalogue, index }) => {
    const items = (catalogue.items || []).slice(0, 4);
    if (items.length === 0) return null;

    const goToCatalogue = () => window.navigateTo(`/catalogue/${catalogue.id}`);

    return (
        <Reveal delay={(index % 3) * 60}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">{catalogue.title}</h2>
                        {catalogue.description && (
                            <p className="text-stone-500 text-sm mt-1.5 max-w-xl leading-relaxed">{catalogue.description}</p>
                        )}
                    </div>
                    <button
                        onClick={goToCatalogue}
                        className="hidden sm:flex items-center text-sm font-semibold text-stone-700 hover:text-stone-900 group whitespace-nowrap shrink-0"
                    >
                        View All
                        <ArrowUpRightIcon className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    {items.map((item) => (
                        <PublicItemCard key={item.id} item={item} onClick={goToCatalogue} />
                    ))}
                </div>

                <button
                    onClick={goToCatalogue}
                    className="sm:hidden mt-5 w-full text-center py-2.5 border border-stone-200 rounded-xl text-sm font-semibold text-stone-700 bg-white"
                >
                    View Full Catalogue
                </button>
            </div>
        </Reveal>
    );
};

const LandingPage = () => {
    const [catalogues, setCatalogues] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        document.title = "Catalogue - Manvi Art";
    }, []);

    React.useEffect(() => {
        const cataloguesRef = collection(db, 'artifacts', appId, 'public', 'data', 'catalogues');
        const unsubscribe = onSnapshot(cataloguesRef, (snapshot) => {
            const fetched = [];
            snapshot.forEach((doc) => fetched.push({ ...doc.data(), id: doc.id }));
            fetched.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            setCatalogues(fetched);
            setLoading(false);
        }, (error) => {
            console.error("Error loading catalogues:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const cataloguesWithItems = catalogues.filter((c) => c.items && c.items.length > 0);

    const scrollToCollection = () => {
        document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#Fdfbf7] overflow-x-hidden">
            {/* Hero */}
            <section className="relative pt-28 pb-20 px-4 text-center overflow-hidden">
                {/* Soft decorative blobs */}
                <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 bg-emerald-100/60 rounded-full blur-3xl animate-float" />
                <div className="pointer-events-none absolute top-10 -right-20 w-80 h-80 bg-amber-100/60 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

                <div className="relative max-w-3xl mx-auto fade-in-up">
                    <span className="inline-block px-3.5 py-1 bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-wider rounded-full border border-stone-200 mb-5">
                        Handmade &amp; Original Art
                    </span>
                    <h1 className="text-4xl sm:text-6xl font-extrabold text-stone-900 tracking-tight leading-tight">
                        Manvi Art
                    </h1>
                    <p className="text-stone-500 text-base sm:text-lg mt-4 max-w-xl mx-auto leading-relaxed">
                        Original paintings, prints, and handmade pieces &mdash; made slowly, shipped with care.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        <button
                            onClick={scrollToCollection}
                            className="px-6 py-3 bg-stone-800 text-white rounded-xl font-semibold text-sm hover:bg-stone-900 transition-all shadow-lg shadow-stone-800/20 hover:scale-105 active:scale-95"
                        >
                            Explore the Collection
                        </button>
                        <a
                            href="https://www.instagram.com/withlovemanvi/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 border border-stone-200 rounded-xl font-semibold text-sm text-stone-700 hover:bg-white hover:-translate-y-0.5 transition-all flex items-center bg-white/60"
                        >
                            <InstagramIcon className="w-4 h-4 mr-2" />
                            @withlovemanvi
                        </a>
                    </div>
                </div>
            </section>

            {/* About */}
            <Reveal className="px-4 py-16 sm:py-20 bg-white border-y border-stone-100">
                <div className="max-w-2xl mx-auto text-center space-y-5">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">About the Artist</h2>
                    {/*
                        Placeholder bio - swap this paragraph for Manvi's own words
                        whenever you're ready. Everything else on the page will
                        keep working exactly the same.
                    */}
                    <p className="text-lg sm:text-2xl text-stone-800 leading-relaxed font-medium">
                        Hi, I'm Manvi &mdash; I paint and make things by hand, one small batch at a time.
                        Every piece here started as a sketch, a color test, or a happy accident on my desk,
                        and I try to keep that same warmth in how it reaches you.
                    </p>
                    <p className="text-stone-500 text-sm sm:text-base leading-relaxed">
                        Thank you for stopping by &mdash; I hope something here makes you smile.
                    </p>
                    <a
                        href="https://www.instagram.com/withlovemanvi/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-semibold text-stone-700 hover:text-stone-900 pt-2"
                    >
                        <InstagramIcon className="w-4 h-4 mr-2" />
                        Follow along on Instagram
                        <ArrowUpRightIcon className="w-3.5 h-3.5 ml-1" />
                    </a>
                </div>
            </Reveal>

            {/* Collections */}
            <div id="collection" className="py-16 sm:py-20 space-y-16 sm:space-y-20">
                {loading ? (
                    <div className="max-w-7xl mx-auto px-4 text-center py-10">
                        <div className="inline-block animate-spin h-8 w-8 border-4 border-stone-200 border-t-stone-800 rounded-full mb-4"></div>
                        <p className="text-stone-500 text-sm font-medium">Loading the collection...</p>
                    </div>
                ) : cataloguesWithItems.length === 0 ? (
                    <div className="max-w-md mx-auto px-4 text-center py-10">
                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                            <PhotoIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-stone-800">New pieces coming soon</h3>
                        <p className="text-sm text-stone-400 mt-1">Check back shortly, or follow along on Instagram for previews.</p>
                    </div>
                ) : (
                    cataloguesWithItems.map((catalogue, idx) => (
                        <CatalogueSection key={catalogue.id} catalogue={catalogue} index={idx} />
                    ))
                )}
            </div>

            {/* Footer */}
            <footer className="border-t border-stone-200 py-10 px-4 text-center bg-white">
                <a
                    href="https://www.instagram.com/withlovemanvi/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-semibold text-stone-600 hover:text-stone-900 mb-3"
                >
                    <InstagramIcon className="w-4 h-4 mr-2" />
                    @withlovemanvi
                </a>
                <p className="text-xs text-stone-400">&copy; {new Date().getFullYear()} Manvi Art. All rights reserved.</p>
            </footer>
        </div>
    );
};
