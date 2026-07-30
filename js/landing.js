// The public landing page (the root domain "/"). Shows a hero, an about
// section, an Instagram link, and every catalogue that has items in it.
// Nothing here links to /admin - that stays unlisted on purpose.
//
// Reveal, GrainOverlay and prefersReducedMotion come from js/public-view.js,
// which loads first. THREE and gsap are UMD globals from index.html; if
// either is missing the page still renders, just without the motion.

// ---------------------------------------------------------------------------
// Hero background: a full-bleed WebGL paint wash
// ---------------------------------------------------------------------------

// Fullscreen triangle-ish quad - PlaneGeometry(2, 2) already spans clip space,
// so the vertex shader can skip the projection matrices entirely.
const HERO_VERTEX_SHADER = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
    }
`;

// Two passes of domain-warped fbm, coloured cream -> sand -> clay -> sage,
// then washed back out to paper away from a focal point that drifts toward
// the cursor. The wash sits behind the headline, so it has to stay pale.
const HERO_FRAGMENT_SHADER = `
    precision highp float;

    varying vec2 vUv;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uAspect;

    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float valueNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    float fbm(vec2 p) {
        float total = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 5; i++) {
            total += amplitude * valueNoise(p);
            p = p * 2.02;
            amplitude *= 0.5;
        }
        return total;
    }

    void main() {
        vec2 uv = vUv;
        vec2 p = vec2(uv.x * uAspect, uv.y) * 1.7;
        float t = uTime * 0.045;

        vec2 q = vec2(fbm(p + t), fbm(p + vec2(3.7, 1.3) - t));
        vec2 r = vec2(fbm(p + 2.4 * q + vec2(1.7, 9.2) + t * 1.1),
                      fbm(p + 2.4 * q + vec2(8.3, 2.8) - t * 0.8));
        float f = fbm(p + 2.0 * r);

        vec3 paper = vec3(0.965, 0.945, 0.910);
        vec3 sand  = vec3(0.914, 0.851, 0.749);
        vec3 clay  = vec3(0.769, 0.443, 0.243);
        vec3 sage  = vec3(0.545, 0.616, 0.506);
        vec3 rose  = vec3(0.851, 0.639, 0.573);

        vec3 col = mix(paper, sand, smoothstep(0.28, 0.86, f));
        col = mix(col, clay, smoothstep(0.40, 0.98, r.x + f * 0.35) * 0.90);
        col = mix(col, sage, smoothstep(0.52, 1.10, q.y + f * 0.30) * 0.60);
        col = mix(col, rose, smoothstep(0.55, 1.00, r.y + q.x * 0.40) * 0.45);

        vec2 focus = vec2(0.70, 0.44) + (uMouse - vec2(0.5)) * 0.14;
        float d = distance(vec2(uv.x * uAspect, uv.y), vec2(focus.x * uAspect, focus.y));
        float bloom = 1.0 - smoothstep(0.05, 0.80, d);

        col = mix(paper, col, 0.10 + 0.90 * bloom);
        col = mix(col, paper, 0.16);

        gl_FragColor = vec4(col, 1.0);
    }
`;

const HeroCanvas = () => {
    const mountRef = React.useRef(null);

    React.useEffect(() => {
        const mount = mountRef.current;
        if (!mount || !window.THREE) return;

        const THREE = window.THREE;
        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power' });
        } catch (error) {
            // No WebGL (old browser, blocked context) - the flat paper
            // background underneath is a perfectly fine fallback.
            console.warn('Hero canvas disabled, WebGL unavailable:', error);
            return;
        }

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        const canvas = renderer.domElement;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        mount.appendChild(canvas);

        const uniforms = {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0.5, 0.5) },
            uAspect: { value: 1 }
        };

        const scene = new THREE.Scene();
        const camera = new THREE.Camera();
        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader: HERO_VERTEX_SHADER,
            fragmentShader: HERO_FRAGMENT_SHADER
        });
        scene.add(new THREE.Mesh(geometry, material));

        const resize = () => {
            const width = mount.clientWidth;
            const height = mount.clientHeight;
            if (!width || !height) return;
            renderer.setSize(width, height, false);
            uniforms.uAspect.value = width / height;
        };
        resize();

        // Cursor nudges the focal point; the render loop eases toward it.
        const pointerTarget = { x: 0.5, y: 0.5 };
        const onPointerMove = (event) => {
            const rect = mount.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            pointerTarget.x = (event.clientX - rect.left) / rect.width;
            pointerTarget.y = 1 - (event.clientY - rect.top) / rect.height;
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('resize', resize);

        const clock = new THREE.Clock();
        let frame;

        const render = () => {
            uniforms.uTime.value = clock.getElapsedTime();
            uniforms.uMouse.value.x += (pointerTarget.x - uniforms.uMouse.value.x) * 0.045;
            uniforms.uMouse.value.y += (pointerTarget.y - uniforms.uMouse.value.y) * 0.045;
            renderer.render(scene, camera);
            frame = requestAnimationFrame(render);
        };

        if (prefersReducedMotion()) {
            renderer.render(scene, camera);
        } else {
            frame = requestAnimationFrame(render);
        }

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('resize', resize);
            geometry.dispose();
            material.dispose();
            renderer.dispose();
            if (renderer.forceContextLoss) renderer.forceContextLoss();
            if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        };
    }, []);

    return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
};

// ---------------------------------------------------------------------------
// Page sections
// ---------------------------------------------------------------------------

const MARQUEE_WORDS = ['Handmade', 'One of a kind', 'Small batch', 'Original', 'Made slowly', 'With love'];

// The track holds the same list twice and slides exactly half its width, so
// the loop is seamless (see .marquee-track in index.html).
const Marquee = () => (
    <div className="bg-[#1A1613] text-[#F6F1E8] py-5 sm:py-6 overflow-hidden">
        <div className="marquee-track">
            {[0, 1].map((half) => (
                <div key={half} className="flex items-center shrink-0" aria-hidden={half === 1}>
                    {MARQUEE_WORDS.map((word) => (
                        <span key={word} className="flex items-center">
                            <span className="font-display italic text-2xl sm:text-4xl px-8 sm:px-12 whitespace-nowrap">{word}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C0703F] shrink-0" />
                        </span>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

const ABOUT_LEAD = "Hi, I'm Manvi. I paint and make things by hand, one small batch at a time. Every piece here started as a sketch, a colour test, or a happy accident on my desk, and I try to keep that same warmth in how it reaches you.";

const AboutSection = () => {
    const sectionRef = React.useRef(null);
    const quoteRef = React.useRef(null);

    // Word-by-word rise. GSAP's SplitText is a paid plugin, so the words are
    // already separate spans in the markup and we just animate them.
    React.useEffect(() => {
        const el = quoteRef.current;
        if (!el || !window.gsap || prefersReducedMotion()) return;
        const ctx = gsap.context(() => {
            gsap.from('[data-word]', {
                yPercent: 70,
                opacity: 0,
                duration: 0.9,
                ease: 'power3.out',
                stagger: 0.018,
                scrollTrigger: { trigger: el, start: 'top 82%', once: true }
            });
        }, el);
        return () => ctx.revert();
    }, []);

    // The portrait drifts a little slower than the page, so the text seems to
    // rise past it. Scoped to md+ where the two actually sit side by side.
    React.useEffect(() => {
        const section = sectionRef.current;
        if (!section || !window.gsap || prefersReducedMotion()) return;
        const mm = gsap.matchMedia();
        mm.add('(min-width: 768px)', () => {
            gsap.to(section.querySelector('[data-portrait]'), {
                yPercent: -9,
                ease: 'none',
                scrollTrigger: {
                    trigger: section,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.8
                }
            });
        });
        return () => mm.revert();
    }, []);

    return (
        <section ref={sectionRef} className="max-w-[1400px] mx-auto px-6 sm:px-10 py-28 sm:py-40">
            <Reveal>
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#A79B8C]">About the artist</p>
            </Reveal>

            <div className="grid md:grid-cols-12 gap-10 md:gap-14 mt-12 sm:mt-16">
                {/* Portrait */}
                <div className="md:col-span-5 lg:col-span-4">
                    <Reveal>
                        <figure data-portrait className="relative">
                            <div className="overflow-hidden bg-[#EFE7DA]">
                                <img
                                    src="images/manvi-portrait.webp"
                                    alt="Illustrated portrait of Manvi holding two pink lilies"
                                    loading="lazy"
                                    className="w-full h-auto"
                                />
                            </div>
                            <figcaption className="mt-4 text-[11px] uppercase tracking-[0.25em] text-[#A79B8C]">
                                Manvi &mdash; the studio
                            </figcaption>
                        </figure>
                    </Reveal>
                </div>

                {/* Words */}
                <div className="md:col-span-7 lg:col-span-8 md:pt-6">
                    <p
                        ref={quoteRef}
                        className="font-display text-[#1A1613] leading-[1.28] tracking-[-0.01em]"
                        style={{ fontSize: 'clamp(1.45rem, 3vw, 2.6rem)' }}
                    >
                        {ABOUT_LEAD.split(' ').map((word, idx) => (
                            <React.Fragment key={idx}>
                                <span className="inline-block" data-word>{word}</span>{' '}
                            </React.Fragment>
                        ))}
                    </p>

                    <Reveal delay={120}>
                        <p className="text-[#7A7169] text-sm sm:text-base leading-relaxed max-w-lg mt-10">
                            Thank you for stopping by &mdash; I hope something here makes you smile.
                        </p>
                        <a
                            href="https://www.instagram.com/withlovemanvi/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center text-xs uppercase tracking-[0.2em] text-[#1A1613] mt-8"
                        >
                            <InstagramIcon className="w-4 h-4 mr-3 text-[#C0703F]" />
                            Follow along
                            <span className="ml-3 w-8 h-8 rounded-full border border-[#1A1613]/20 flex items-center justify-center transition-colors duration-300 group-hover:bg-[#1A1613] group-hover:text-[#F6F1E8]">
                                <ArrowUpRightIcon className="w-3.5 h-3.5" />
                            </span>
                        </a>
                    </Reveal>
                </div>
            </div>
        </section>
    );
};

// One catalogue's preview row on the landing page: an index number, title,
// description, a handful of its items, and a link through to its own page.
const CatalogueSection = ({ catalogue, index }) => {
    const sectionRef = React.useRef(null);
    const items = (catalogue.items || []).slice(0, 4);

    // Alternate columns drift at slightly different rates as the row passes -
    // just enough to stop the grid reading as a flat block.
    React.useEffect(() => {
        const section = sectionRef.current;
        if (!section || !window.gsap || prefersReducedMotion()) return;
        const ctx = gsap.context(() => {
            const cards = gsap.utils.toArray('[data-card]');
            if (!cards.length) return;
            gsap.to(cards, {
                yPercent: (i) => (i % 2 === 0 ? -5 : 4),
                ease: 'none',
                scrollTrigger: {
                    trigger: section,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.8
                }
            });
        }, section);
        return () => ctx.revert();
    }, [catalogue.id, items.length]);

    if (items.length === 0) return null;

    const goToCatalogue = () => window.navigateTo(`/catalogue/${catalogue.id}`);

    return (
        <section ref={sectionRef} className="max-w-[1400px] mx-auto px-6 sm:px-10">
            <Reveal>
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 pb-10 border-b border-[#E2DACB]">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-[11px] tracking-[0.3em] text-[#C0703F]">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <span className="h-px w-12 bg-[#E2DACB]" />
                        </div>
                        <h2
                            className="font-display text-[#1A1613] leading-[0.98] tracking-[-0.02em]"
                            style={{ fontSize: 'clamp(2.1rem, 5.5vw, 4.5rem)' }}
                        >
                            {catalogue.title}
                        </h2>
                        {catalogue.description && (
                            <p className="text-[#7A7169] text-sm sm:text-base leading-relaxed max-w-lg mt-5">
                                {catalogue.description}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={goToCatalogue}
                        className="group hidden md:flex items-center text-xs uppercase tracking-[0.2em] text-[#1A1613] shrink-0"
                    >
                        View all
                        <span className="ml-3 w-9 h-9 rounded-full border border-[#1A1613]/20 flex items-center justify-center transition-colors duration-300 group-hover:bg-[#1A1613] group-hover:text-[#F6F1E8]">
                            <ArrowUpRightIcon className="w-3.5 h-3.5" />
                        </span>
                    </button>
                </div>
            </Reveal>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 sm:gap-x-8 gap-y-14 mt-12 sm:mt-16">
                {items.map((item, i) => (
                    <div key={item.id} data-card>
                        <Reveal delay={i * 90}>
                            <PublicItemCard item={item} onClick={goToCatalogue} />
                        </Reveal>
                    </div>
                ))}
            </div>

            <button
                onClick={goToCatalogue}
                className="md:hidden mt-12 w-full border border-[#E2DACB] py-4 text-xs uppercase tracking-[0.2em] text-[#1A1613]"
            >
                View full catalogue
            </button>
        </section>
    );
};

// ---------------------------------------------------------------------------

const LandingPage = () => {
    const [catalogues, setCatalogues] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [scrolled, setScrolled] = React.useState(false);
    const heroRef = React.useRef(null);

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

    React.useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // useLayoutEffect so the timeline's start state is in place before the
    // first paint - otherwise the headline flashes in fully formed.
    React.useLayoutEffect(() => {
        if (!heroRef.current || !window.gsap || prefersReducedMotion()) return;
        const ctx = gsap.context(() => {
            gsap.timeline({ defaults: { ease: 'expo.out' } })
                .from('[data-hero-eyebrow]', { opacity: 0, y: 18, duration: 1 })
                .from('[data-hero-line] > span', { yPercent: 118, duration: 1.5, stagger: 0.09 }, '-=0.7')
                .from('[data-hero-sub]', { opacity: 0, y: 18, duration: 1 }, '-=1.0')
                .from('[data-hero-cta]', { opacity: 0, y: 18, duration: 0.9, stagger: 0.09 }, '-=0.9')
                .from('[data-hero-cue]', { opacity: 0, duration: 0.9 }, '-=0.6');
        }, heroRef);
        return () => ctx.revert();
    }, []);

    // Catalogue rows mount after Firestore answers, and images settle later
    // still - both change the page height, so recompute trigger positions.
    React.useEffect(() => {
        if (!window.ScrollTrigger) return;
        const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
        return () => cancelAnimationFrame(frame);
    }, [catalogues, loading]);

    const cataloguesWithItems = catalogues.filter((c) => c.items && c.items.length > 0);

    const scrollToCollection = () => {
        document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#F6F1E8] text-[#1A1613] overflow-x-hidden">
            {/* Nav */}
            <nav className={`fixed top-0 inset-x-0 z-50 transition-colors duration-500 border-b ${scrolled ? 'bg-[#F6F1E8]/85 backdrop-blur-md border-[#E2DACB]' : 'border-transparent'}`}>
                <div className="max-w-[1400px] mx-auto px-6 sm:px-10 h-16 sm:h-20 flex items-center justify-between">
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="font-display italic text-xl sm:text-2xl text-[#1A1613]"
                    >
                        Manvi Art
                    </button>
                    <div className="flex items-center gap-7 sm:gap-9">
                        <button
                            onClick={scrollToCollection}
                            className="hidden sm:block text-[11px] uppercase tracking-[0.2em] text-[#5F574F] hover:text-[#1A1613] transition-colors"
                        >
                            Collection
                        </button>
                        <a
                            href="https://www.instagram.com/withlovemanvi/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-[11px] uppercase tracking-[0.2em] text-[#5F574F] hover:text-[#C0703F] transition-colors"
                        >
                            <InstagramIcon className="w-4 h-4 sm:mr-2.5" />
                            <span className="hidden sm:inline">@withlovemanvi</span>
                        </a>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section ref={heroRef} className="relative min-h-screen min-h-[100svh] flex flex-col justify-center overflow-hidden">
                <HeroCanvas />

                <div className="relative max-w-[1400px] w-full mx-auto px-6 sm:px-10 pt-32 pb-28">
                    <div className="flex items-center gap-4" data-hero-eyebrow>
                        <span className="h-px w-10 bg-[#C0703F]" />
                        <span className="text-[11px] uppercase tracking-[0.3em] text-[#7A7169]">
                            Handmade &amp; original art
                        </span>
                    </div>

                    <h1
                        className="font-display text-[#1A1613] leading-[0.92] tracking-[-0.025em] mt-8"
                        style={{ fontSize: 'clamp(3rem, 11.5vw, 9.5rem)' }}
                    >
                        <span className="line-mask" data-hero-line><span className="block">Made slowly,</span></span>
                        <span className="line-mask" data-hero-line>
                            <span className="block">with <em className="italic text-[#C0703F]">love</em>.</span>
                        </span>
                    </h1>

                    <div className="mt-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
                        <p className="text-[#5F574F] text-base sm:text-lg leading-relaxed max-w-md" data-hero-sub>
                            Original paintings, prints and handmade pieces &mdash; each one made by hand
                            in small batches, and shipped with care.
                        </p>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={scrollToCollection}
                                data-hero-cta
                                className="px-8 py-4 bg-[#1A1613] hover:bg-[#C0703F] text-[#F6F1E8] text-xs uppercase tracking-[0.15em] transition-colors duration-500"
                            >
                                Explore the collection
                            </button>
                            <a
                                href="https://www.instagram.com/withlovemanvi/"
                                target="_blank"
                                rel="noopener noreferrer"
                                data-hero-cta
                                className="px-8 py-4 border border-[#1A1613]/20 hover:border-[#1A1613] text-[#1A1613] text-xs uppercase tracking-[0.15em] transition-colors duration-500 flex items-center"
                            >
                                <InstagramIcon className="w-4 h-4 mr-2.5" />
                                @withlovemanvi
                            </a>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3" data-hero-cue>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#A79B8C]">Scroll</span>
                    <span className="block w-px h-12 bg-gradient-to-b from-[#C0703F] to-transparent" />
                </div>
            </section>

            <Marquee />

            <AboutSection />

            {/* Collections */}
            <div id="collection" className="scroll-mt-24 pt-10 sm:pt-16 pb-28 sm:pb-40">
                <div className="max-w-[1400px] mx-auto px-6 sm:px-10 mb-16 sm:mb-24">
                    <Reveal>
                        <div className="flex items-center gap-4">
                            <span className="h-px w-10 bg-[#C0703F]" />
                            <span className="text-[11px] uppercase tracking-[0.3em] text-[#A79B8C]">The collection</span>
                        </div>
                    </Reveal>
                </div>

                {loading ? (
                    <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-16 flex flex-col items-center">
                        <div className="w-8 h-8 border border-[#E2DACB] border-t-[#1A1613] rounded-full animate-spin" />
                        <p className="mt-5 text-[11px] uppercase tracking-[0.3em] text-[#A79B8C]">Loading</p>
                    </div>
                ) : cataloguesWithItems.length === 0 ? (
                    <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-16 text-center">
                        <p className="font-display text-3xl sm:text-4xl text-[#1A1613]">New pieces, coming soon</p>
                        <p className="text-sm text-[#8A8078] mt-4 max-w-sm mx-auto leading-relaxed">
                            Nothing is listed just yet. Follow along on Instagram for previews of what&rsquo;s on the desk.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-28 sm:space-y-44">
                        {cataloguesWithItems.map((catalogue, idx) => (
                            <CatalogueSection key={catalogue.id} catalogue={catalogue} index={idx} />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-[#1A1613] text-[#F6F1E8]">
                <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-20 sm:py-28">
                    <Reveal>
                        <p className="font-display italic leading-[0.95] tracking-[-0.02em]" style={{ fontSize: 'clamp(2.5rem, 9vw, 7rem)' }}>
                            With love,<br />Manvi
                        </p>
                    </Reveal>

                    <div className="mt-16 sm:mt-20 pt-8 border-t border-[#F6F1E8]/15 flex flex-col sm:flex-row items-center justify-between gap-5">
                        <a
                            href="https://www.instagram.com/withlovemanvi/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-xs uppercase tracking-[0.2em] text-[#F6F1E8]/70 hover:text-[#F6F1E8] transition-colors"
                        >
                            <InstagramIcon className="w-4 h-4 mr-3" />
                            @withlovemanvi
                        </a>
                        <p className="text-[11px] tracking-wide text-[#F6F1E8]/40">
                            &copy; {new Date().getFullYear()} Manvi Art
                        </p>
                    </div>
                </div>
            </footer>

            <GrainOverlay />
        </div>
    );
};
