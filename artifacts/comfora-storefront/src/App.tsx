import { type FormEvent, type KeyboardEvent, type ReactNode, type TouchEvent, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowLeft,
  Banknote,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  HeartHandshake,
  House,
  Instagram,
  Leaf,
  LoaderCircle,
  MapPin,
  Menu,
  PackageCheck,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Stethoscope,
  Trash2,
  Truck,
  UserRound,
  X,
} from 'lucide-react';
import { Link, Route, Switch, useLocation, useRoute, Router as WouterRouter } from 'wouter';
import { getGetOrderQueryKey, type Order, type OrderInput, useCreateOrder, useGetOrder } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import productImage from '@assets/WhatsApp_Image_2026-09-28_at_12.18.08_PM_1790588186378.jpeg';
import carouselImageTwo from '@assets/image_1790591166141.png';
import carouselImageThree from '@assets/image_1790591279187.png';
import carouselImageFour from '@assets/image_1790673121878.png';
import logoImage from '@assets/image_1790672508564.png';
import storyImage from '@assets/image_1790673582024.png';

const queryClient = new QueryClient();

type TierId = 1 | 2 | 3;
type Tier = {
  id: TierId;
  title: string;
  price: string;
  oldPrice: string;
  badge: string;
  popular?: boolean;
};

const tiers: Tier[] = [
  { id: 1, title: 'زوج واحد', price: '14.99', oldPrice: '30.00', badge: 'وفر 50%' },
  { id: 2, title: 'زوجين', price: '19.99', oldPrice: '40.00', badge: 'وفر 50% | 10 دنانير للزوج', popular: true },
  { id: 3, title: 'ثلاث أزواج', price: '24.99', oldPrice: '50.00', badge: 'وفر 50% | 8.33 دينار للزوج' },
];

type PairSelection = { color: string; size: string };
type PairSelectionField = keyof PairSelection;

const DELIVERY_ESTIMATE_DAYS = 3;
const DELIVERY_DAYS = '1-3';
const DELIVERY_TAGLINE = 'توصيل مجاني لجميع محافظات المملكة 🇯🇴';
const DELIVERY_NOTE = '';
const DISCOUNT_CODES: Record<string, number> = {};
const GOVERNORATES = ['عمّان', 'إربد', 'الزرقاء', 'البلقاء', 'الكرك', 'معان', 'المفرق', 'الطفيلة', 'مادبا', 'جرش', 'عجلون', 'العقبة'];
const COLOR_OPTIONS = ['أبيض', 'أسود', 'برتقالي'];
const SIZE_OPTIONS = ['35-36', '37-38', '39-40', '41-42', '43-44', '45-46'];

function createPairSelections(): PairSelection[] {
  return Array.from({ length: 3 }, () => ({ color: 'برتقالي', size: '41-42' }));
}

function getDeliveryDateLabel() {
  const date = new Date();
  date.setDate(date.getDate() + DELIVERY_ESTIMATE_DAYS);
  const weekdays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const months = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'];
  return `${weekdays[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function Brand() {
  return (
    <Link href="/" className="brand" data-testid="link-brand" aria-label="comfystep الصفحة الرئيسية">
      <img className="brand-logo" src={logoImage} alt="" />
      <span>comfystep</span>
    </Link>
  );
}

function Header({ cartCount, onOpenCart }: { cartCount: number; onOpenCart: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigateTo = (id: string) => {
    setMenuOpen(false);
    scrollToSection(id);
  };
  return (
    <>
      <div className="announcement" data-testid="banner-delivery">
        {DELIVERY_TAGLINE}
      </div>
      <header className="nav-shell">
        <div className="container-wide nav-inner">
          <Brand />
          <div className="nav-actions">
            <button className="icon-button" aria-label={`فتح السلة، ${cartCount} منتجات`} data-testid="button-open-cart" onClick={onOpenCart}>
              <ShoppingBag size={19} strokeWidth={1.8} />
              {cartCount > 0 && <span className="cart-count" data-testid="text-cart-count">{cartCount}</span>}
            </button>
            <button className="icon-button menu-button" aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'} aria-expanded={menuOpen} data-testid="button-menu" onClick={() => setMenuOpen((open) => !open)}>
              {menuOpen ? <X size={21} strokeWidth={1.8} /> : <Menu size={21} strokeWidth={1.8} />}
            </button>
          </div>
        </div>
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`} aria-label="التنقل الرئيسي">
          <button className="nav-link" onClick={() => navigateTo('pricing')} data-testid="link-shop">تسوّق</button>
          <button className="nav-link" onClick={() => navigateTo('story')} data-testid="link-about">لماذا comfystep؟</button>
          <button className="nav-link" onClick={() => navigateTo('contact')} data-testid="link-contact">تواصل معنا</button>
          <button className="nav-link" onClick={() => navigateTo('faq')} data-testid="link-faq">الأسئلة الشائعة</button>
        </nav>
      </header>
    </>
  );
}

function Hero({ onBuy }: { onBuy: () => void }) {
  const slides = [
    { src: carouselImageFour, alt: 'حذاء comfystep مع النعل البرتقالي وميزات الراحة' },
    { src: productImage, alt: 'نعال comfystep البرتقالية فوق صندوق برتقالي' },
    { src: carouselImageTwo, alt: 'نعال comfystep البرتقالية متقاطعة فوق منصة دائرية' },
    { src: carouselImageThree, alt: 'نعال comfystep البرتقالية على منصة دائرية مضيئة' },
  ];
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const resumeAutoplayTimer = useRef<number | null>(null);
  const [autoplayPaused, setAutoplayPaused] = useState(false);

  useEffect(() => {
    slides.forEach(({ src }) => {
      const image = new Image();
      image.src = src;
    });
  }, []);

  useEffect(() => {
    if (autoplayPaused) return;
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 3500);
    return () => window.clearInterval(interval);
  }, [autoplayPaused]);

  useEffect(() => () => {
    if (resumeAutoplayTimer.current) window.clearTimeout(resumeAutoplayTimer.current);
  }, []);

  const goToSlide = (index: number, pauseAfterInteraction = false) => {
    setActiveSlide((index + slides.length) % slides.length);
    if (!pauseAfterInteraction) return;
    setAutoplayPaused(true);
    if (resumeAutoplayTimer.current) window.clearTimeout(resumeAutoplayTimer.current);
    resumeAutoplayTimer.current = window.setTimeout(() => setAutoplayPaused(false), 5000);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const endX = event.changedTouches[0]?.clientX;
    if (touchStartX.current === null || endX === undefined) return;
    const distance = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) < 40) return;
    const direction = distance < 0 ? 1 : -1;
    goToSlide(activeSlide + direction, true);
  };

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container-wide hero-grid">
        <div className="hero-visual">
          <div
            className="hero-image-wrap hero-carousel"
            role="region"
            aria-roledescription="carousel"
            aria-label="صور نعال comfystep"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {slides.map((slide, index) => (
              <img
                className={`hero-image hero-slide ${activeSlide === index ? 'active' : ''}`}
                key={slide.src}
                src={slide.src}
                alt={slide.alt}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                data-testid={index === 0 ? 'img-product-hero' : `img-product-hero-${index + 1}`}
              />
            ))}
            <div className="hero-overlay-actions">
              <button className="button-primary" onClick={onBuy} data-testid="button-hero-buy">
                اشتريها الآن <ArrowLeft size={18} />
              </button>
            </div>
            <div className="carousel-dots" aria-label="اختيار صورة المنتج">
              {slides.map((slide, index) => (
                <button
                  className={`carousel-dot ${activeSlide === index ? 'active' : ''}`}
                  key={slide.src}
                  type="button"
                  aria-label={`الصورة ${index + 1}`}
                  aria-current={activeSlide === index ? 'true' : undefined}
                  onClick={() => goToSlide(index, true)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="hero-copy">
          <h1 id="hero-title">دعم أفضل للقدم وراحة أكبر في المشي.</h1>
          <p>
            صُمم ضبان ComfyStep الطبي لدعم قوس القدم وتوزيع الضغط بشكل أفضل، لتكون كل خطوة أكثر راحة — من أول اليوم إلى آخر مشوار.
          </p>
          <div className="proof-row" aria-label="معلومات موثوقية المنتج">
            <span className="proof-item"><PackageCheck size={17} /> شحن من الأردن</span>
            <span className="proof-item"><Banknote size={17} /> الدفع عند الاستلام</span>
            <span className="proof-item"><HeartHandshake size={17} /> ضمان استرجاع</span>
            <span className="proof-item"><Stethoscope size={17} /> جودة طبية</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing({
  selected,
  onSelect,
  onAdd,
  pairSelections,
  onPairChange,
  mode = 'full',
}: {
  selected: Tier;
  onSelect: (tier: Tier) => void;
  onAdd: () => void;
  pairSelections: PairSelection[];
  onPairChange: (index: number, field: PairSelectionField, value: string) => void;
  mode?: 'full' | 'checkout';
}) {
  const deliveryDate = getDeliveryDateLabel();
  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>, tier: Tier) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(tier);
    }
  };

  return (
    <section className={`section pricing-section ${mode === 'checkout' ? 'checkout-pricing' : ''}`} id={mode === 'full' ? 'pricing' : undefined} aria-labelledby={mode === 'full' ? 'pricing-title' : undefined}>
      <div className="container-wide pricing-layout">
        {mode === 'full' && <div className="pricing-header">
          <span className="kicker">اختَر راحتك</span>
          <h2 id="pricing-title">ضبان التدليك الطبي</h2>
          <ul className="product-bullets">
            <li><Check size={15} /> راحة فورية من أول خطوة</li>
            <li><Check size={15} /> مختبر طبياً</li>
            <li><Check size={15} /> مصمم لدعم القدم وتخفيف الضغط</li>
          </ul>
          <div className="delivery-strip">
            <div className="delivery-line"><span className="jordan-flag" aria-hidden="true">🇯🇴</span> {DELIVERY_TAGLINE}</div>
            <div className="delivery-date"><span className="delivery-dot" aria-hidden="true" /> بوصلك مجانًا {deliveryDate}</div>
          </div>
        </div>}
        <div className="pricing-options">
          <div className="tier-list" role="radiogroup" aria-label="خيارات الكمية">
            {tiers.map((tier) => (
              <div
                className={`tier-card ${selected.id === tier.id ? 'selected' : ''}`}
                key={tier.id}
                role="radio"
                aria-checked={selected.id === tier.id}
                tabIndex={0}
                onClick={() => onSelect(tier)}
                onKeyDown={(event) => handleCardKeyDown(event, tier)}
                data-testid={`button-tier-${tier.id}`}
              >
                <span className="tier-badge">{tier.badge}</span>
                {tier.popular && <span className="popular-tag">الأكثر مبيعاً</span>}
                <div className="tier-card-header">
                  <span className="tier-radio" aria-hidden="true" />
                  <span className="tier-copy">
                    <span className="tier-name">{tier.title}</span>
                  </span>
                  <span className="tier-price">
                    <del>{tier.oldPrice} د.أ</del>
                    <strong>{tier.price}</strong>
                    <small>د.أ</small>
                  </span>
                </div>
                {selected.id === tier.id && (
                  <div className="pair-selector-list" onClick={(event) => event.stopPropagation()}>
                    {pairSelections.slice(0, tier.id).map((pair, index) => (
                      <div className="pair-selector-row" key={index}>
                        <strong>#{index + 1}</strong>
                        <label>
                          <span>اللون</span>
                          <select value={pair.color} onChange={(event) => onPairChange(index, 'color', event.target.value)} aria-label={`لون الزوج ${index + 1}`}>
                            {COLOR_OPTIONS.map((color) => <option key={color} value={color}>{color}</option>)}
                          </select>
                        </label>
                        <label>
                          <span>مقاس الحذاء</span>
                          <select value={pair.size} onChange={(event) => onPairChange(index, 'size', event.target.value)} aria-label={`مقاس الزوج ${index + 1}`}>
                            {SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
                          </select>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {mode === 'full' && <>
            <button className="button-primary buy-button" onClick={onAdd} data-testid="button-add-selected">
              اطلب الآن <ShoppingBag size={19} />
            </button>
          </>}
        </div>
        {mode === 'full' && <div className="pricing-trust" aria-label="مزايا الطلب">
           <div><Truck size={21} /><strong>توصيل مجاني لكل المحافظات</strong></div>
          <div><Search size={21} /><strong>معاينة قبل الاستلام</strong></div>
          <div><PackageCheck size={21} /><strong>الدفع عند الاستلام</strong></div>
        </div>}
      </div>
    </section>
  );
}

function Story() {
  return (
    <section className="section section-tint" id="story" aria-labelledby="story-title">
      <div className="container-wide story-grid">
        <div className="story-visual">
          <img className="story-image" src={storyImage} alt="نعال comfystep البرتقالية والبيضاء مع تفاصيل التهوية والدعم" />
        </div>
        <div className="story-copy">
          <span className="kicker">مصممة للحياة الحقيقية</span>
          <h2 id="story-title">صُممت لتمنح قدميك دعمًا أفضل.</h2>
          <p>صمّمنا comfystep لتكون جزءًا من يومك، لا شيئًا تفكر به. طبقة مريحة تمتص الصدمات، ودعم ثابت لقوس القدم، وتهوية تساعدك أن تكمل مشوارك براحة.</p>
          <div className="feature-lines">
            <div className="feature-line"><Leaf size={17} color="hsl(var(--primary))" /> امتصاص ضغط محسوب <span>من أول خطوة</span></div>
            <div className="feature-line"><Sparkles size={17} color="hsl(var(--primary))" /> خامة مرنة وخفيفة <span>تقصّ على مقاسك</span></div>
            <div className="feature-line"><ShieldCheck size={17} color="hsl(var(--primary))" /> ثبات داخل الحذاء <span>بدون انزلاق مزعج</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section className="section" id="faq" aria-labelledby="faq-title">
      <div className="container-wide">
        <div className="section-heading center">
          <span className="kicker">قبل أن تطلب</span>
          <h2 id="faq-title">أسئلة بسيطة.<br />إجابة واضحة.</h2>
        </div>
        <div className="feature-lines" style={{ maxWidth: 680, marginInline: 'auto' }}>
          <div className="feature-line"><CircleHelp size={17} color="hsl(var(--primary))" /> هل تناسب جميع الأحذية؟ <span>نعم، تُقص حسب المقاس</span></div>
          <div className="feature-line"><Clock3 size={17} color="hsl(var(--primary))" /> متى يصل الطلب؟ <span>توصيل مجاني خلال 1–3 أيام عمل</span></div>
          <div className="feature-line"><HeartHandshake size={17} color="hsl(var(--primary))" /> هل يمكن الاسترجاع؟ <span>نعم، بضمان واضح</span></div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container-wide">
        <div className="footer-grid">
          <div>
            <Brand />
            <p className="footer-intro">راحة يومية مصممة حولك. comfystep — علامة تؤمن أن كل خطوة تستحق دعمًا أفضل.</p>
          </div>
          <div>
            <h3>روابط سريعة</h3>
            <div className="footer-links">
              <button className="footer-link" onClick={() => scrollToSection('pricing')} data-testid="footer-shop">تسوّق النعال</button>
              <button className="footer-link" onClick={() => scrollToSection('story')} data-testid="footer-about">عن comfystep</button>
              <button className="footer-link" onClick={() => scrollToSection('faq')} data-testid="footer-faq">الأسئلة الشائعة</button>
            </div>
          </div>
          <div>
            <h3>تواصل معنا</h3>
            <div className="contact-links">
              <a className="contact-link" href="mailto:comfystep0@gmail.com">
                <span className="contact-link-icon">@</span>
                <span>comfystep0@gmail.com</span>
              </a>
              <a className="contact-link" href="https://www.instagram.com/comfystep_" target="_blank" rel="noreferrer">
                <Instagram size={18} />
                <span>comfystep_</span>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 comfystep — جميع الحقوق محفوظة</span>
          <a href="mailto:comfystep0@gmail.com">comfystep0@gmail.com</a>
        </div>
      </div>
    </footer>
  );
}

function CartDrawer({ tier, pairSelections, open, onClose, onRemove, onCheckout }: { tier: Tier | null; pairSelections: PairSelection[]; open: boolean; onClose: () => void; onRemove: () => void; onCheckout: () => void }) {
  const [checkoutMessage, setCheckoutMessage] = useState('');
  return (
    <>
      <div className={`drawer-backdrop ${open ? 'open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`cart-drawer ${open ? 'open' : ''}`} aria-label="سلة التسوق" aria-hidden={!open}>
        <div className="drawer-head">
          <h2>سلة التسوق</h2>
          <button className="icon-button" onClick={onClose} aria-label="إغلاق السلة" data-testid="button-close-cart"><X size={19} /></button>
        </div>
        <div className="drawer-body">
          {!tier ? (
            <div className="empty-cart">
              <div>
                <div className="empty-cart-icon"><ShoppingBag size={25} /></div>
                <h3>سلتك فارغة</h3>
                <p>الراحة التي تبحث عنها على بُعد خطوة.</p>
                <button className="button-primary" onClick={() => { onClose(); scrollToSection('pricing'); }} data-testid="button-empty-shop">متابعة التسوق <ArrowLeft size={16} /></button>
              </div>
            </div>
          ) : (
            <div className="cart-item" data-testid="cart-item-selected">
              <img className="cart-thumb" src={productImage} alt="" />
              <div className="cart-item-copy">
                <h3>نعال comfystep الطبية</h3>
               <p>{tier.title} · {DELIVERY_TAGLINE}</p>
                <div className="cart-variants">
                  {pairSelections.map((pair, index) => <span key={index}>#{index + 1} · {pair.color} · {pair.size}</span>)}
                </div>
              </div>
              <div className="cart-item-price">{tier.price} د.أ</div>
              <button className="remove-item" onClick={onRemove} aria-label="حذف المنتج من السلة" data-testid="button-remove-cart-item"><Trash2 size={16} /></button>
            </div>
          )}
          <div className="login-prompt">
            <UserRound size={16} />
            <span>عندك حساب؟ <button type="button" onClick={() => setCheckoutMessage('تسجيل الدخول سيكون متاحًا عند إطلاق الدفع الإلكتروني.')}>سجّل دخول</button> لإتمام الشراء بسرعة أكبر.</span>
          </div>
        </div>
        {tier && (
          <div className="checkout-box">
            <div className="order-summary">
              <h3>ملخص الطلب</h3>
              {pairSelections.map((pair, index) => <div key={index}>#{index + 1} · {pair.color} · {pair.size}</div>)}
            </div>
            <div className="subtotal"><span>المجموع الفرعي</span><strong>{tier.price} د.أ</strong></div>
             <button className="button-primary buy-button" onClick={() => { setCheckoutMessage(''); onCheckout(); }} data-testid="button-checkout">إتمام الشراء <ShoppingBag size={18} /></button>
             <div className="checkout-note">الدفع نقدًا عند الاستلام · {DELIVERY_TAGLINE}</div>
            {checkoutMessage && <div className="form-feedback" data-testid="status-checkout">{checkoutMessage}</div>}
          </div>
        )}
      </aside>
    </>
  );
}

type CheckoutForm = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  discountCode: string;
  honeypot: string;
};

type CheckoutErrors = Partial<Record<keyof CheckoutForm | 'form', string>>;

const emptyCheckoutForm: CheckoutForm = {
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  city: '',
  discountCode: '',
  honeypot: '',
};

function CheckoutField({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="checkout-field">
      <span className="checkout-field-label">{label}</span>
      <span className={`checkout-control ${error ? 'has-error' : ''}`}>
        <span className="checkout-field-icon" aria-hidden="true">{icon}</span>
        {children}
      </span>
      {error && <span className="checkout-error">{error}</span>}
    </label>
  );
}

function CheckoutSheet({
  open,
  tier,
  pairSelections,
  onClose,
  onSelect,
  onPairChange,
  onSuccess,
}: {
  open: boolean;
  tier: Tier | null;
  pairSelections: PairSelection[];
  onClose: () => void;
  onSelect: (tier: Tier) => void;
  onPairChange: (index: number, field: PairSelectionField, value: string) => void;
  onSuccess: (order: Order) => void;
}) {
  const [form, setForm] = useState<CheckoutForm>(emptyCheckoutForm);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [discountFeedback, setDiscountFeedback] = useState('');
  const createOrderMutation = useCreateOrder();

  if (!tier) return null;

  const offerPrice = Number(tier.price);
  const originalPrice = Number(tier.oldPrice);
  const quantityDiscount = originalPrice - offerPrice;
  const codeValue = DISCOUNT_CODES[form.discountCode.trim().toUpperCase()] ?? 0;
  const total = Math.max(0, offerPrice - codeValue);

  const updateField = (field: keyof CheckoutForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const applyDiscount = () => {
    const code = form.discountCode.trim().toUpperCase();
    if (!code) {
      setDiscountFeedback('');
      return;
    }
    if (!(code in DISCOUNT_CODES)) {
      setDiscountFeedback('رمز الخصم غير صالح.');
      return;
    }
    setDiscountFeedback('تم تطبيق رمز الخصم.');
  };

  const validate = () => {
    const nextErrors: CheckoutErrors = {};
    if (!form.firstName.trim()) nextErrors.firstName = 'اكتب الاسم الأول.';
    if (!form.lastName.trim()) nextErrors.lastName = 'اكتب اسم العائلة.';
    if (!/^(07[789]\d{7}|\+9627[789]\d{7})$/.test(form.phone.trim())) {
      nextErrors.phone = 'أدخل رقمًا أردنيًا يبدأ بـ 07 أو +9627.';
    }
    if (form.address.trim().length < 3) nextErrors.address = 'اكتب عنوانًا واضحًا.';
    if (!form.city) nextErrors.city = 'اختر المحافظة.';
    if (form.discountCode.trim() && !(form.discountCode.trim().toUpperCase() in DISCOUNT_CODES)) {
      nextErrors.discountCode = 'رمز الخصم غير صالح.';
    }
    return nextErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const data: OrderInput = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city as OrderInput['city'],
      pairs: pairSelections.slice(0, tier.id) as OrderInput['pairs'],
      paymentMethod: 'cash_on_delivery',
      honeypot: form.honeypot,
      ...(form.discountCode.trim() ? { discountCode: form.discountCode.trim() } : {}),
    };

    setErrors({});
    createOrderMutation.mutate(
      { data },
      {
        onSuccess,
        onError: () => setErrors({ form: 'تعذر إرسال الطلب الآن. حاول مرة أخرى.' }),
      },
    );
  };

  return (
    <>
      <div className={`checkout-backdrop ${open ? 'open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`checkout-sheet ${open ? 'open' : ''}`} aria-label="إتمام الطلب" aria-hidden={!open}>
        <div className="checkout-sheet-head">
          <div>
            <span className="kicker">comfystep</span>
            <h2>يرجى تعبئة المعلومات للطلب</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="إغلاق صفحة الطلب" data-testid="button-close-checkout"><X size={20} /></button>
        </div>
        <div className="checkout-sheet-scroll">
          <div className="checkout-delivery-note"><Truck size={16} /> {DELIVERY_TAGLINE}</div>
          <Pricing
            mode="checkout"
            selected={tier}
            onSelect={onSelect}
            onAdd={() => undefined}
            pairSelections={pairSelections}
            onPairChange={onPairChange}
          />
          <section className="checkout-summary-card" aria-labelledby="checkout-summary-title">
            <h3 id="checkout-summary-title">ملخص الطلب</h3>
            <div className="summary-row"><span>القيمة</span><strong>{formatJod(originalPrice)}</strong></div>
            <div className="summary-row discount-row"><span>الخصم</span><strong>-{formatJod(quantityDiscount)}</strong></div>
            {codeValue > 0 && <div className="summary-row discount-row"><span>خصم الرمز</span><strong>-{formatJod(codeValue)}</strong></div>}
            <div className="summary-row delivery-summary"><span>التوصيل</span><strong>{DELIVERY_TAGLINE}</strong></div>
            <div className="summary-total"><span>المجموع</span><strong>{formatJod(total)}</strong></div>
          </section>

          <div className="discount-code-block">
            <label htmlFor="discount-code">عندك رمز خصم؟</label>
            <div className="discount-code-row">
              <span className="inline-input"><Tag size={17} /><input id="discount-code" value={form.discountCode} onChange={(event) => updateField('discountCode', event.target.value)} placeholder="أدخل الرمز" /></span>
              <button type="button" className="outline-button" onClick={applyDiscount}>تطبيق</button>
            </div>
            {discountFeedback && <span className={`discount-feedback ${discountFeedback.includes('غير') ? 'error' : ''}`}>{discountFeedback}</span>}
            {errors.discountCode && <span className="checkout-error">{errors.discountCode}</span>}
          </div>

          <div className="checkout-choice-card">
            <h3>طريقة التوصيل</h3>
            <label className="choice-row">
              <input type="radio" checked readOnly />
              <span><strong>توصيل</strong><small>{DELIVERY_TAGLINE}</small>{DELIVERY_NOTE && <em>{DELIVERY_NOTE}</em>}</span>
              <CheckCircle2 size={19} />
            </label>
          </div>

          <div className="checkout-choice-card">
            <h3>طريقة الدفع</h3>
            <label className="choice-row">
              <input type="radio" checked readOnly />
              <span><strong>الدفع عند الاستلام</strong><small>ادفع للمندوب عند وصول طلبك</small></span>
              <Banknote size={19} />
            </label>
          </div>

          <form className="checkout-form" onSubmit={handleSubmit} noValidate>
            <div className="checkout-form-heading">
              <h3>معلومات الاستلام</h3>
              <span>الحقول التي عليها * مطلوبة</span>
            </div>
            <CheckoutField label="الاسم الأول *" icon={<UserRound size={17} />} error={errors.firstName}>
              <input value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} autoComplete="given-name" />
            </CheckoutField>
            <CheckoutField label="اسم العائلة *" icon={<UserRound size={17} />} error={errors.lastName}>
              <input value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} autoComplete="family-name" />
            </CheckoutField>
            <CheckoutField label="رقم الهاتف *" icon={<Phone size={17} />} error={errors.phone}>
              <input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} inputMode="tel" placeholder="0791234567" autoComplete="tel" dir="ltr" />
            </CheckoutField>
            <CheckoutField label="العنوان *" icon={<House size={17} />} error={errors.address}>
              <input value={form.address} onChange={(event) => updateField('address', event.target.value)} autoComplete="street-address" />
            </CheckoutField>
            <CheckoutField label="المدينة / المحافظة *" icon={<Building2 size={17} />} error={errors.city}>
              <select value={form.city} onChange={(event) => updateField('city', event.target.value)}>
                <option value="">اختر المحافظة</option>
                {GOVERNORATES.map((governorate) => <option key={governorate} value={governorate}>{governorate}</option>)}
              </select>
            </CheckoutField>
            <input className="honeypot" tabIndex={-1} autoComplete="off" value={form.honeypot} onChange={(event) => updateField('honeypot', event.target.value)} aria-hidden="true" />
            {errors.form && <div className="checkout-form-error" role="alert">{errors.form}</div>}
            <button className="button-primary submit-order-button" type="submit" disabled={createOrderMutation.isPending}>
              {createOrderMutation.isPending ? <><LoaderCircle className="spin" size={19} /> جاري إرسال الطلب...</> : <>اشتري الآن <ShoppingBag size={19} /></>}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

function formatJod(value: number) {
  return `${value.toFixed(2)} د.أ`;
}

function formatArabicOrderDate(value: string) {
  const date = new Date(value);
  const weekdays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const months = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'];
  return `${weekdays[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}

function tierForPairCount(count: number) {
  return tiers[Math.max(0, Math.min(2, count - 1))];
}

function OrderConfirmation() {
  const [, params] = useRoute('/order/:orderToken');
  const [, navigate] = useLocation();
  const token = params?.orderToken ?? '';
  const orderQuery = useGetOrder(token, { query: { enabled: Boolean(token), queryKey: getGetOrderQueryKey(token) } });
  const order = orderQuery.data;

  if (orderQuery.isLoading) {
    return <div className="order-page" dir="rtl"><div className="order-loading"><LoaderCircle className="spin" size={26} /> جاري تحميل تفاصيل الطلب...</div></div>;
  }
  if (orderQuery.isError || !order) {
    return <div className="order-page" dir="rtl"><div className="order-error"><h1>تعذر العثور على الطلب</h1><p>تأكد من الرابط وحاول مرة أخرى.</p><button className="button-primary" onClick={() => navigate('/')}>العودة للرئيسية <ArrowLeft size={17} /></button></div></div>;
  }

  const tier = tierForPairCount(order.pairs.length);
  const quantityDiscount = Number(order.subtotal) - Number(tier.price);
  return (
    <div className="order-page" dir="rtl">
      <div className="order-page-inner">
        <header className="order-page-head">
          <button className="back-button" onClick={() => navigate('/')} aria-label="العودة للرئيسية"><ChevronRight size={20} /></button>
          <div><span>طلب رقم <strong>#{order.orderNumber}</strong></span><small>تم التأكيد بتاريخ {formatArabicOrderDate(order.createdAt)}</small></div>
          <Brand />
        </header>
        <main className="order-content">
          <section className="order-total-card">
            <span className="order-eyebrow">تم استلام طلبك</span>
            <strong>{formatJod(Number(order.total))}</strong>
            <p>المندوب رح يتواصل معك بأقرب وقت، متحمسين توصلك منتجات comfystep!</p>
          </section>
          <section className="order-status-card">
            <div className="status-icon"><CheckCircle2 size={25} /></div>
              <div><h2>تم تأكيد طلبك، شكراً الك!</h2><p>التوصيل مجاني خلال {DELIVERY_DAYS} أيام</p><small>عم نجهز طلبك للشحن · {order.deliveryDate}</small></div>
          </section>
          <section className="order-details-card">
            <div className="order-product-head">
              <img src={productImage} alt="" />
              <span className="order-quantity-badge">{order.pairs.length}</span>
              <div><h2>نعال comfystep الطبية</h2><p>{tier.title}</p></div>
            </div>
            <div className="order-pair-lines">
              {order.pairs.map((pair, index) => <div key={`${pair.color}-${pair.size}-${index}`}><span>زوج {index + 1}</span><strong>{pair.color} · {pair.size}</strong></div>)}
            </div>
            <div className="order-price-lines">
              <div><span>المجموع الفرعي</span><strong>{formatJod(Number(order.subtotal))}</strong></div>
              <div className="negative"><span>خصم الكمية</span><strong>-{formatJod(quantityDiscount)}</strong></div>
              <div><span>التوصيل</span><strong>توصيل مجاني لجميع محافظات المملكة</strong></div>
              <div className="order-grand-total"><span>المجموع</span><strong>{formatJod(Number(order.total))}</strong></div>
            </div>
            <div className="saving-note"><Tag size={16} /> إجمالي التوفير {formatJod(Number(order.discount))}</div>
          </section>
          <section className="order-contact-card">
            <h2>معلومات التواصل</h2>
            <div className="contact-detail"><Phone size={17} /><span>رقم الهاتف</span><strong dir="ltr">{order.phone}</strong></div>
            <div className="contact-detail"><MapPin size={17} /><span>عنوان الشحن</span><strong>{order.firstName} {order.lastName} · {order.address} · {order.city} · الأردن</strong></div>
            <div className="contact-detail"><Banknote size={17} /><span>طريقة الدفع</span><strong>الدفع عند الاستلام</strong></div>
          </section>
          <div className="order-delivery-footer"><Truck size={17} /> {DELIVERY_TAGLINE}</div>
        </main>
      </div>
    </div>
  );
}

function MobileBuyBar({ selected, onAdd }: { selected: Tier; onAdd: () => void }) {
  return (
    <div className="mobile-buy">
      <div className="mobile-buy-price"><span>{selected.title}</span><strong>{selected.price} د.أ</strong></div>
      <div className="mobile-buy-action">
        <button className="button-primary" onClick={onAdd} data-testid="button-mobile-buy">اطلب الآن <ShoppingBag size={17} /></button>
      </div>
    </div>
  );
}

function Home() {
  const [selectedTier, setSelectedTier] = useState<Tier>(tiers[1]);
  const [pairSelections, setPairSelections] = useState<PairSelection[]>(createPairSelections);
  const [cartTier, setCartTier] = useState<Tier | null>(null);
  const [cartPairSelections, setCartPairSelections] = useState<PairSelection[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [, navigate] = useLocation();
  const updatePairSelection = (index: number, field: PairSelectionField, value: string) => {
    setPairSelections((current) => current.map((pair, pairIndex) => pairIndex === index ? { ...pair, [field]: value } : pair));
    setCartPairSelections((current) => current.map((pair, pairIndex) => pairIndex === index ? { ...pair, [field]: value } : pair));
  };
  const selectTier = (tier: Tier) => {
    setSelectedTier(tier);
    if (cartTier || checkoutOpen) {
      setCartTier(tier);
      setCartPairSelections(pairSelections.slice(0, tier.id));
    }
  };
  const addToCart = () => {
    setCartTier(selectedTier);
    setCartPairSelections(pairSelections.slice(0, selectedTier.id));
    setCartOpen(false);
    setCheckoutOpen(true);
  };
  const removeFromCart = () => {
    setCartTier(null);
    setCartPairSelections([]);
  };
  const completeOrder = (order: Order) => {
    removeFromCart();
    setCheckoutOpen(false);
    navigate(`/order/${order.orderToken}`);
  };
  return (
    <div className="page-shell" dir="rtl">
      <Header cartCount={cartTier ? 1 : 0} onOpenCart={() => setCartOpen(true)} />
      <main>
        <Hero onBuy={() => scrollToSection('pricing')} />
        <Pricing selected={selectedTier} onSelect={selectTier} onAdd={addToCart} pairSelections={pairSelections} onPairChange={updatePairSelection} />
        <Story />
        <FAQ />
      </main>
      <Footer />
      <CartDrawer tier={cartTier} pairSelections={cartPairSelections} open={cartOpen} onClose={() => setCartOpen(false)} onRemove={removeFromCart} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />
      <CheckoutSheet open={checkoutOpen} tier={cartTier} pairSelections={cartPairSelections} onClose={() => setCheckoutOpen(false)} onSelect={selectTier} onPairChange={updatePairSelection} onSuccess={completeOrder} />
      <MobileBuyBar selected={selectedTier} onAdd={addToCart} />
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/order/:orderToken" component={OrderConfirmation} />
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;