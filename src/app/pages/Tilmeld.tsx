import { motion } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Send, CheckCircle, Car, RefreshCw, Clock, Heart, ChevronDown, Check } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';

const holdOptions = [
  { value: 'korekort', label: 'Kørekort til bil', icon: Car },
  { value: 'generhvervelse', label: 'Generhvervelse', icon: RefreshCw },
  { value: 'rutinetimer', label: 'Rutinetimer', icon: Clock },
  { value: 'forstehjaelp', label: 'Førstehjælp', icon: Heart },
];

const holdstartOptions: Record<string, { value: string; label: string }[]> = {
  dragor: [
    { value: '2026-07-09', label: '9. jul. 2026' },
    { value: '2026-08-24', label: '24. aug. 2026' },
  ],
  frederiksberg: [
    { value: '2026-08-24', label: '24. aug. 2026' },
    { value: '2026-09-06', label: '6. sep. 2026' },
  ],
};

const gearkasseOptions = [
  { value: 'automatgear', label: 'Automatgear' },
  { value: 'manuel', label: 'Manuel gear' },
];

const hvordanOptions = [
  { value: 'anbefaling', label: 'Anbefaling' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'google', label: 'Google' },
  { value: 'andet', label: 'Andet' },
];

function CustomSelect({
  options,
  value,
  onChange,
  placeholder,
  required,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border bg-input-background transition-all text-left ${
          open ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
        }`}
      >
        <span className={selected ? 'text-foreground font-medium' : 'text-muted-foreground'}>
          {selected ? selected.label : placeholder ?? 'Vælg...'}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.span>
      </button>

      {open && (
        <motion.ul
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.15 }}
          className="absolute z-50 mt-2 w-full bg-card border border-border rounded-xl shadow-xl overflow-hidden"
        >
          {options.map(opt => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-primary/5 ${
                  value === opt.value ? 'text-primary bg-primary/5 font-medium' : 'text-foreground'
                }`}
              >
                {opt.label}
                {value === opt.value && <Check className="w-4 h-4 text-primary shrink-0" />}
              </button>
            </li>
          ))}
        </motion.ul>
      )}

      {/* hidden native select for form validation */}
      <select
        className="sr-only"
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        tabIndex={-1}
        aria-hidden
      >
        <option value="" />
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export default function Tilmeld() {
  const { selectedLocation } = useLocation();
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    hold: searchParams.get('hold') ?? '',
    holdstart: searchParams.get('holdstart') ?? '',
    navn: '',
    foedselsdato: '',
    email: '',
    telefon: '',
    adresse: '',
    postnrBy: '',
    gearkasse: '',
    hvordan: '',
    besked: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/send-mail.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'tilmeld', location: selectedLocation, ...formData }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError('Der opstod en fejl. Prøv igen eller ring til os.');
      }
    } catch {
      setError('Der opstod en fejl. Prøv igen eller ring til os.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block bg-primary/10 text-primary font-semibold text-sm px-4 py-1.5 rounded-full mb-5 tracking-wide">
              {selectedLocation === 'dragor' ? 'Dragør' : 'Frederiksberg'}
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Tilmeld dig</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Udfyld formularen nedenfor, og vi vender tilbage hurtigst muligt med en bekræftelse.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center bg-card rounded-2xl shadow-md border border-border p-14"
            >
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-5" />
              <h2 className="text-2xl font-bold text-foreground mb-3">Tak for din tilmelding!</h2>
              <p className="text-muted-foreground">
                Vi har modtaget din tilmelding og vender tilbage til dig hurtigst muligt.
              </p>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onSubmit={handleSubmit}
              className="bg-card rounded-2xl shadow-md border border-border p-8 sm:p-10 space-y-7"
            >
              {/* Hold */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Hold <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {holdOptions.map(({ value, label, icon: Icon }) => (
                    <label
                      key={value}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        formData.hold === value
                          ? 'border-primary bg-primary/8 text-primary'
                          : 'border-border bg-background hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="hold"
                        value={value}
                        checked={formData.hold === value}
                        onChange={() => setFormData({ ...formData, hold: value })}
                        className="sr-only"
                        required
                      />
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-sm font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Holdstart */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Holdstart <span className="text-destructive">*</span>
                </label>
                <CustomSelect
                  options={holdstartOptions[selectedLocation] ?? holdstartOptions.dragor}
                  value={formData.holdstart}
                  onChange={val => setFormData({ ...formData, holdstart: val })}
                  placeholder="Vælg dato"
                  required
                />
              </div>

              <div className="border-t border-border" />

              {/* Name + Birthday */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="navn" className="block text-sm font-semibold text-foreground mb-2">
                    Navn <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="navn"
                    type="text"
                    name="navn"
                    value={formData.navn}
                    onChange={handleChange}
                    required
                    placeholder="Dit fulde navn"
                    className="w-full border border-border rounded-xl px-4 py-3 bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                </div>
                <div>
                  <label htmlFor="foedselsdato" className="block text-sm font-semibold text-foreground mb-2">
                    Fødselsdato <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="foedselsdato"
                    type="date"
                    name="foedselsdato"
                    value={formData.foedselsdato}
                    onChange={handleChange}
                    required
                    className="w-full border border-border rounded-xl px-4 py-3 bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                    E-mail <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="din@email.dk"
                    className="w-full border border-border rounded-xl px-4 py-3 bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                </div>
                <div>
                  <label htmlFor="telefon" className="block text-sm font-semibold text-foreground mb-2">
                    Telefon <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="telefon"
                    type="tel"
                    name="telefon"
                    value={formData.telefon}
                    onChange={handleChange}
                    required
                    placeholder="+45 00 00 00 00"
                    className="w-full border border-border rounded-xl px-4 py-3 bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="adresse" className="block text-sm font-semibold text-foreground mb-2">
                  Adresse <span className="text-destructive">*</span>
                </label>
                <input
                  id="adresse"
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  required
                  placeholder="Gadenavn og husnummer"
                  className="w-full border border-border rounded-xl px-4 py-3 bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>

              <div>
                <label htmlFor="postnrBy" className="block text-sm font-semibold text-foreground mb-2">
                  Postnr. & By <span className="text-destructive">*</span>
                </label>
                <input
                  id="postnrBy"
                  type="text"
                  name="postnrBy"
                  value={formData.postnrBy}
                  onChange={handleChange}
                  required
                  placeholder="2791 Dragør"
                  className="w-full border border-border rounded-xl px-4 py-3 bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>

              {/* Gear type */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Gearkasse type <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-3">
                  {gearkasseOptions.map(({ value, label }) => (
                    <label
                      key={value}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border cursor-pointer transition-all font-medium text-sm ${
                        formData.gearkasse === value
                          ? 'border-primary bg-primary/8 text-primary'
                          : 'border-border bg-background hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gearkasse"
                        value={value}
                        checked={formData.gearkasse === value}
                        onChange={() => setFormData({ ...formData, gearkasse: value })}
                        className="sr-only"
                        required
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-border" />

              {/* Hvordan */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Hvordan fandt du os?
                </label>
                <CustomSelect
                  options={hvordanOptions}
                  value={formData.hvordan}
                  onChange={val => setFormData({ ...formData, hvordan: val })}
                  placeholder="Vælg en mulighed"
                />
              </div>

              {/* Besked */}
              <div>
                <label htmlFor="besked" className="block text-sm font-semibold text-foreground mb-2">
                  Besked
                </label>
                <textarea
                  id="besked"
                  name="besked"
                  value={formData.besked}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Evt. spørgsmål eller kommentarer..."
                  className="w-full border border-border rounded-xl px-4 py-3 bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
              )}
              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-accent text-primary-foreground font-semibold py-4 rounded-xl transition-colors shadow-sm text-base disabled:opacity-60"
              >
                <Send className="w-5 h-5" />
                {sending ? 'Sender...' : 'Send tilmelding'}
              </button>
            </motion.form>
          )}
        </div>
      </section>
    </div>
  );
}
