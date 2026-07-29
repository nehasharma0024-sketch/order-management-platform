// Public-facing catalogue viewer (what a customer sees via the shared link).
//
// This file also holds the two animation primitives shared by both public
// pages (GrainOverlay + Reveal). It loads before js/landing.js, which uses
// them. GSAP arrives as a UMD global from index.html; every animation here
// degrades to plain static content if it failed to load or the visitor has
// asked for reduced motion.

        if (window.gsap && window.ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);
        }

        const prefersReducedMotion = () =>
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Fixed film-grain wash. Public pages only - the admin stays clean.
        const GrainOverlay = () => <div className="grain-overlay" aria-hidden="true" />;

        // Slides its children up as they scroll into view.
        const Reveal = ({ children, className = '', delay = 0, y = 28 }) => {
            const ref = React.useRef(null);

            React.useEffect(() => {
                const el = ref.current;
                if (!el) return;

                if (!window.gsap || prefersReducedMotion()) {
                    el.style.opacity = '1';
                    el.style.transform = 'none';
                    return;
                }

                const tween = gsap.fromTo(el,
                    { opacity: 0, y },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1.1,
                        ease: 'power3.out',
                        delay: delay / 1000,
                        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
                    }
                );

                return () => {
                    if (tween.scrollTrigger) tween.scrollTrigger.kill();
                    tween.kill();
                };
            }, [delay, y]);

            return (
                <div ref={ref} className={className} style={{ opacity: 0 }}>
                    {children}
                </div>
            );
        };

        const PublicItemCard = ({ item, onClick }) => {
            const [currentIdx, setCurrentIdx] = React.useState(0);
            const hasImages = item.images && item.images.length > 0;

            const handlePrev = (e) => {
                e.stopPropagation();
                if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
                else setCurrentIdx(item.images.length - 1);
            };

            const handleNext = (e) => {
                e.stopPropagation();
                if (currentIdx < item.images.length - 1) setCurrentIdx(currentIdx + 1);
                else setCurrentIdx(0);
            };

            return (
                <article onClick={onClick} className="group cursor-pointer">
                    <div className="relative overflow-hidden bg-[#EDE6D9] aspect-[4/5]">
                        {hasImages ? (
                            <>
                                <img
                                    src={item.images[currentIdx]}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
                                />
                                {item.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={handlePrev}
                                            aria-label="Previous image"
                                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#F6F1E8]/90 text-[#1A1613] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        >
                                            <ArrowLeftIcon className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            aria-label="Next image"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#F6F1E8]/90 text-[#1A1613] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        >
                                            <ArrowRightIcon className="w-3.5 h-3.5" />
                                        </button>
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5">
                                            {item.images.map((_, idx) => (
                                                <span
                                                    key={idx}
                                                    className={`block h-[3px] rounded-full transition-all duration-300 ${idx === currentIdx ? 'w-5 bg-[#F6F1E8]' : 'w-1.5 bg-[#F6F1E8]/50'}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-[#C6BCAA]">
                                <PhotoIcon className="w-10 h-10 stroke-[1]" />
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex items-baseline justify-between gap-4">
                        <h3 className="font-display text-lg sm:text-xl text-[#1A1613] leading-snug line-clamp-1">
                            <span className="bg-[linear-gradient(#C0703F,#C0703F)] bg-[length:0%_1px] bg-no-repeat bg-[position:0_95%] group-hover:bg-[length:100%_1px] transition-[background-size] duration-500">
                                {item.title}
                            </span>
                        </h3>
                        <span className="shrink-0 text-sm text-[#C0703F] tracking-tight">
                            Rs.{parseFloat(item.price || 0).toLocaleString()}
                        </span>
                    </div>

                    {item.description && (
                        <p className="mt-1.5 text-[13px] leading-relaxed text-[#8A8078] line-clamp-2">
                            {item.description}
                        </p>
                    )}
                </article>
            );
        };

        // Item detail overlay in the public catalogue viewer
        const PublicItemDetailModal = ({ isOpen, item, catalogue, onClose }) => {
            const [activeIdx, setActiveIdx] = React.useState(0);
            const panelRef = React.useRef(null);

            // Every new item opens on its first image.
            React.useEffect(() => {
                setActiveIdx(0);
            }, [item]);

            // Lock the page behind the overlay and wire up Escape-to-close.
            React.useEffect(() => {
                if (!isOpen) return;
                const onKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
                const previousOverflow = document.body.style.overflow;
                document.body.style.overflow = 'hidden';
                window.addEventListener('keydown', onKeyDown);
                return () => {
                    document.body.style.overflow = previousOverflow;
                    window.removeEventListener('keydown', onKeyDown);
                };
            }, [isOpen, onClose]);

            React.useEffect(() => {
                const el = panelRef.current;
                if (!el || !isOpen || !window.gsap || prefersReducedMotion()) return;
                const tween = gsap.fromTo(el,
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
                );
                return () => tween.kill();
            }, [isOpen]);

            if (!isOpen || !item) return null;

            const hasImages = item.images && item.images.length > 0;

            const handleWhatsAppInquiry = () => {
                const text = `Hi! I'm interested in "${item.title}" (Rs. ${parseFloat(item.price || 0).toLocaleString()}) from your catalogue "${catalogue.title}". Can you share more details?`;
                const phone = catalogue.whatsApp ? catalogue.whatsApp.replace(/[^0-9]/g, '') : '';
                const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
                window.open(url, '_blank');
            };

            return (
                <div
                    className="fixed inset-0 z-[80] bg-[#1A1613]/45 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
                    onClick={onClose}
                >
                    <div
                        ref={panelRef}
                        onClick={(e) => e.stopPropagation()}
                        className="relative bg-[#F6F1E8] w-full max-w-5xl my-auto flex flex-col md:flex-row"
                    >
                        <button
                            onClick={onClose}
                            aria-label="Close"
                            className="absolute right-4 top-4 z-20 p-2 text-[#1A1613] bg-[#F6F1E8]/80 hover:bg-[#EDE6D9] transition-colors"
                        >
                            <CloseIcon className="w-5 h-5" />
                        </button>

                        {/* Left: imagery */}
                        <div className="w-full md:w-[55%] bg-[#EDE6D9] p-5 sm:p-8 flex flex-col justify-center">
                            <div className="relative w-full aspect-square bg-[#F6F1E8] flex items-center justify-center overflow-hidden">
                                {hasImages ? (
                                    <img src={item.images[activeIdx]} alt={item.title} className="w-full h-full object-contain" />
                                ) : (
                                    <PhotoIcon className="w-16 h-16 text-[#C6BCAA] stroke-[1]" />
                                )}

                                {hasImages && item.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setActiveIdx(activeIdx > 0 ? activeIdx - 1 : item.images.length - 1)}
                                            aria-label="Previous image"
                                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-[#F6F1E8]/90 hover:bg-[#F6F1E8] text-[#1A1613] transition-colors"
                                        >
                                            <ArrowLeftIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setActiveIdx(activeIdx < item.images.length - 1 ? activeIdx + 1 : 0)}
                                            aria-label="Next image"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-[#F6F1E8]/90 hover:bg-[#F6F1E8] text-[#1A1613] transition-colors"
                                        >
                                            <ArrowRightIcon className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>

                            {hasImages && item.images.length > 1 && (
                                <div className="flex space-x-2 mt-4 overflow-x-auto pb-1 justify-center">
                                    {item.images.map((imgUrl, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveIdx(idx)}
                                            className={`w-14 h-14 overflow-hidden flex-shrink-0 transition-opacity duration-300 ${idx === activeIdx ? 'opacity-100 ring-1 ring-[#1A1613]' : 'opacity-50 hover:opacity-90'}`}
                                        >
                                            <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: details */}
                        <div className="w-full md:w-[45%] p-7 sm:p-10 md:p-12 flex flex-col justify-between">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.25em] text-[#A79B8C]">
                                    {catalogue.title}
                                </p>
                                <h2 className="font-display text-3xl md:text-4xl text-[#1A1613] leading-[1.1] mt-4">
                                    {item.title}
                                </h2>
                                <p className="text-xl text-[#C0703F] mt-4">
                                    Rs. {parseFloat(item.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>

                                <div className="mt-8 pt-8 border-t border-[#E2DACB]">
                                    <p className="text-[11px] uppercase tracking-[0.25em] text-[#A79B8C] mb-3">Description</p>
                                    <p className="text-sm text-[#5F574F] leading-loose whitespace-pre-line">
                                        {item.description || 'No description provided.'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-10 space-y-3">
                                <button
                                    onClick={handleWhatsAppInquiry}
                                    className="w-full py-4 bg-[#1A1613] hover:bg-[#C0703F] text-[#F6F1E8] text-sm tracking-[0.12em] uppercase transition-colors duration-500 flex items-center justify-center space-x-2.5"
                                >
                                    <WhatsAppIcon className="w-4 h-4" />
                                    <span>Inquire</span>
                                </button>
                                {catalogue.whatsApp && (
                                    <p className="text-[11px] text-[#A79B8C] text-center">
                                        Direct inquiries to <span className="text-[#5F574F]">{catalogue.whatsApp}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        // Shareable public catalogue page (/catalogue/<id>)
        const PublicCatalogueViewer = ({ catalogueId }) => {
            const [catalogue, setCatalogue] = React.useState(null);
            const [loading, setLoading] = React.useState(true);
            const [searchQuery, setSearchQuery] = React.useState('');
            const [sortBy, setSortBy] = React.useState('default');
            const [selectedItem, setSelectedItem] = React.useState(null);
            const headerRef = React.useRef(null);

            React.useEffect(() => {
                const catalogueRef = doc(db, 'artifacts', appId, 'public', 'data', 'catalogues', catalogueId);
                const unsubscribe = onSnapshot(catalogueRef, (snap) => {
                    if (snap.exists()) {
                        setCatalogue({ ...snap.data(), id: snap.id });
                    } else {
                        setCatalogue(null);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Error subscribing to public catalogue:", error);
                    setLoading(false);
                });

                return () => unsubscribe();
            }, [catalogueId]);

            React.useEffect(() => {
                if (catalogue && catalogue.title) {
                    document.title = `${catalogue.title} - Manvi Art`;
                } else if (!loading) {
                    document.title = "Catalogue Not Found - Manvi Art";
                }
            }, [catalogue, loading]);

            // Header intro, once the catalogue has actually arrived.
            React.useLayoutEffect(() => {
                if (!headerRef.current || !catalogue || !window.gsap) return;
                if (prefersReducedMotion()) return;
                const ctx = gsap.context(() => {
                    gsap.timeline({ defaults: { ease: 'expo.out' } })
                        .from('[data-cat-label]', { opacity: 0, y: 14, duration: 0.9 })
                        .from('[data-cat-title] > span', { yPercent: 115, duration: 1.3, stagger: 0.08 }, '-=0.6')
                        .from('[data-cat-sub]', { opacity: 0, y: 14, duration: 0.9 }, '-=0.9');
                }, headerRef);
                return () => ctx.revert();
            }, [catalogue]);

            // Images settling changes the page height - let ScrollTrigger recompute.
            React.useEffect(() => {
                if (!window.ScrollTrigger) return;
                const id = requestAnimationFrame(() => ScrollTrigger.refresh());
                return () => cancelAnimationFrame(id);
            }, [catalogue, searchQuery, sortBy]);

            if (loading) {
                return (
                    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F1E8]">
                        <div className="w-8 h-8 border border-[#E2DACB] border-t-[#1A1613] rounded-full animate-spin" />
                        <p className="mt-5 text-[11px] uppercase tracking-[0.3em] text-[#A79B8C]">Loading</p>
                        <GrainOverlay />
                    </div>
                );
            }

            if (!catalogue) {
                return (
                    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F1E8] text-center px-6">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-[#A79B8C]">Error 404</p>
                        <h2 className="font-display text-4xl sm:text-5xl text-[#1A1613] mt-5">Nothing here</h2>
                        <p className="text-sm text-[#8A8078] mt-4 max-w-sm leading-relaxed">
                            This catalogue link may be incorrect, or the collection has since been taken down.
                        </p>
                        <button
                            onClick={() => window.navigateTo('/')}
                            className="mt-9 px-8 py-3.5 bg-[#1A1613] hover:bg-[#C0703F] text-[#F6F1E8] text-xs tracking-[0.15em] uppercase transition-colors duration-500"
                        >
                            Back to home
                        </button>
                        <GrainOverlay />
                    </div>
                );
            }

            const filteredItems = (catalogue.items || [])
                .filter(item => (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()))
                .sort((a, b) => {
                    if (sortBy === 'price-low-to-high') return a.price - b.price;
                    if (sortBy === 'price-high-to-low') return b.price - a.price;
                    return 0; // Default ordering
                });

            const totalItems = (catalogue.items || []).length;

            return (
                <div className="min-h-screen bg-[#F6F1E8] text-[#1A1613] overflow-x-hidden">
                    {/* Slim top nav */}
                    <nav className="fixed top-0 inset-x-0 z-50 bg-[#F6F1E8]/85 backdrop-blur-md border-b border-[#E2DACB]">
                        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
                            <button
                                onClick={() => window.navigateTo('/')}
                                className="group flex items-center text-xs uppercase tracking-[0.2em] text-[#5F574F] hover:text-[#1A1613] transition-colors"
                            >
                                <ArrowLeftIcon className="w-3.5 h-3.5 mr-2.5 transition-transform group-hover:-translate-x-1" />
                                Manvi Art
                            </button>
                            <a
                                href="https://www.instagram.com/withlovemanvi/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#5F574F] hover:text-[#C0703F] transition-colors"
                                aria-label="Instagram"
                            >
                                <InstagramIcon className="w-4 h-4" />
                            </a>
                        </div>
                    </nav>

                    {/* Header */}
                    <header ref={headerRef} className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-36 sm:pt-44 pb-14 sm:pb-20">
                        <div className="flex items-center gap-4" data-cat-label>
                            <span className="h-px w-10 bg-[#C0703F]" />
                            <span className="text-[11px] uppercase tracking-[0.3em] text-[#A79B8C]">
                                {totalItems} {totalItems === 1 ? 'Work' : 'Works'}
                            </span>
                        </div>

                        <h1
                            className="font-display text-[#1A1613] leading-[0.95] tracking-[-0.02em] mt-7 max-w-4xl"
                            style={{ fontSize: 'clamp(2.75rem, 8vw, 6.5rem)' }}
                            data-cat-title
                        >
                            <span className="line-mask"><span className="block">{catalogue.title}</span></span>
                        </h1>

                        {catalogue.description && (
                            <p className="text-[#7A7169] text-base sm:text-lg leading-relaxed max-w-xl mt-8" data-cat-sub>
                                {catalogue.description}
                            </p>
                        )}
                    </header>

                    {/* Search + sort */}
                    <div className="sticky top-16 z-40 bg-[#F6F1E8]/90 backdrop-blur-md border-y border-[#E2DACB]">
                        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-4 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                            <div className="relative flex-1 max-w-sm">
                                <SearchIcon className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A79B8C]" />
                                <input
                                    type="text"
                                    placeholder="Search works"
                                    className="w-full bg-transparent border-b border-[#E2DACB] focus:border-[#1A1613] pl-7 pr-3 py-2 text-sm placeholder:text-[#A79B8C] focus:outline-none transition-colors"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-[11px] uppercase tracking-[0.2em] text-[#A79B8C] whitespace-nowrap">Sort</span>
                                <select
                                    className="appearance-none bg-transparent border-b border-[#E2DACB] focus:border-[#1A1613] py-2 pr-6 text-sm cursor-pointer focus:outline-none transition-colors"
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                >
                                    <option value="default">Featured</option>
                                    <option value="price-low-to-high">Price ascending</option>
                                    <option value="price-high-to-low">Price descending</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
                        {filteredItems.length === 0 ? (
                            <div className="py-24 text-center">
                                <p className="font-display text-3xl text-[#1A1613]">No matches</p>
                                <p className="text-sm text-[#8A8078] mt-3">
                                    Nothing here fits &ldquo;{searchQuery}&rdquo;. Try another word.
                                </p>
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="mt-7 text-xs uppercase tracking-[0.2em] text-[#C0703F] border-b border-[#C0703F]/40 hover:border-[#C0703F] pb-1 transition-colors"
                                >
                                    Clear search
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 sm:gap-x-8 gap-y-14 sm:gap-y-20">
                                {filteredItems.map((item, idx) => (
                                    <Reveal key={item.id} delay={Math.min(idx, 6) * 70}>
                                        <PublicItemCard
                                            item={item}
                                            onClick={() => setSelectedItem(item)}
                                        />
                                    </Reveal>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <footer className="border-t border-[#E2DACB]">
                        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-14 flex flex-col sm:flex-row items-center justify-between gap-5">
                            <button
                                onClick={() => window.navigateTo('/')}
                                className="font-display italic text-2xl text-[#1A1613] hover:text-[#C0703F] transition-colors"
                            >
                                Manvi Art
                            </button>
                            <a
                                href="https://www.instagram.com/withlovemanvi/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-xs uppercase tracking-[0.2em] text-[#7A7169] hover:text-[#C0703F] transition-colors"
                            >
                                <InstagramIcon className="w-4 h-4 mr-2.5" />
                                @withlovemanvi
                            </a>
                        </div>
                    </footer>

                    <PublicItemDetailModal
                        isOpen={selectedItem !== null}
                        item={selectedItem}
                        catalogue={catalogue}
                        onClose={() => setSelectedItem(null)}
                    />

                    <GrainOverlay />
                </div>
            );
        };
