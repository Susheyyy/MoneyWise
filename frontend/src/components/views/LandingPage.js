import React from 'react';
import { useNavigate } from 'react-router-dom'; 

const LandingPage = () => {
  const navigate = useNavigate(); 

  const colors = {
    tealGradient: 'linear-gradient(90deg, #384C4F 0%, #648B91 100%)',
    darkGradient: 'linear-gradient(135deg, #2B4448 0%, #4A6E74 100%)',
    bgInput: '#F2F5F5',
    bgLight: '#F7FAFA',
    textPrimary: '#364C4F',
    textMuted: '#6B8B8E',
    textLight: '#A7A7A9',
    tealAccent: '#648B91',
    green: '#0F6E56',
    greenBg: '#E1F5EE',
    amber: '#BA7517',
    amberBg: '#FFF3E0',
    red: '#A32D2D',
    redBg: '#FCEBEB',
    blue: '#185FA5',
    blueBg: '#E6F1FB',
    border: 'rgba(54,76,79,0.12)',
    white: '#FFFFFF',
  };

  const btn = (variant = 'primary') => ({
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 600,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    borderRadius: '25px',
    fontSize: '0.8rem',
    padding: '8px 22px',
    ...(variant === 'primary'
      ? { background: colors.tealGradient, color: colors.white, border: 'none' }
      : { background: 'transparent', color: colors.textPrimary, border: `1.5px solid ${colors.textPrimary}` }),
  });

  const sectionTag = {
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '2px',
    color: colors.tealAccent,
    marginBottom: '12px',
  };

  const sectionTitle = {
    fontFamily: "'Oswald', sans-serif",
    fontSize: '2.2rem',
    color: colors.textPrimary,
    fontWeight: 500,
    marginBottom: '12px',
    letterSpacing: '0.5px',
  };

  const ProgressBar = ({ label, spent, total, color }) => {
    const pct = Math.round((spent / total) * 100);
    return (
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: colors.textMuted, marginBottom: '4px' }}>
          <span>{label}</span>
          <span>₹{spent.toLocaleString()} / ₹{total.toLocaleString()}</span>
        </div>
        <div style={{ height: '6px', background: '#E8ECEC', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '4px' }} />
        </div>
      </div>
    );
  };

  const MiniCard = ({ label, value, color }) => (
    <div style={{ background: colors.bgInput, borderRadius: '10px', padding: '12px' }}>
      <div style={{ fontSize: '0.72rem', color: colors.textLight, fontWeight: 500, marginBottom: '4px' }}>{label}</div>
      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.2rem', fontWeight: 500, color: color || colors.textPrimary }}>{value}</div>
    </div>
  );

  const DashboardCard = () => (
    <div style={{
      background: colors.white,
      border: `0.5px solid ${colors.border}`,
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 2px 12px rgba(54,76,79,0.08)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: colors.textLight }}>Total spent · June</div>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '2rem', fontWeight: 600, color: colors.textPrimary }}>₹14,280</div>
          <div style={{ fontSize: '0.78rem', color: colors.textLight, marginTop: '2px' }}>₹5,720 remaining of ₹20,000</div>
        </div>
        <div style={{ background: colors.greenBg, color: colors.green, fontSize: '0.72rem', fontWeight: 600, padding: '4px 10px', borderRadius: '12px' }}>↓ 12% vs May</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
        <MiniCard label="Income" value="₹22,000" color={colors.green} />
        <MiniCard label="Savings" value="₹7,720" />
        <MiniCard label="Subscriptions" value="₹1,249" color={colors.amber} />
        <MiniCard label="Split pending" value="₹340" />
      </div>

      <ProgressBar label="Food & mess" spent={4200} total={5000} color={colors.amber} />
      <ProgressBar label="Transport" spent={1100} total={2000} color={colors.green} />
      <ProgressBar label="Shopping" spent={3800} total={4000} color={colors.red} />
    </div>
  );

  const features = [
    { icon: 'ti-wallet', bg: colors.greenBg, iconColor: colors.green, title: 'Expense & income tracker', desc: 'Log every rupee in seconds. Categorise by food, transport, rent, and more. Upload bill photos with one tap.' },
    { icon: 'ti-chart-pie', bg: colors.amberBg, iconColor: colors.amber, title: 'Visual budget tracker', desc: 'Set monthly limits per category. Get colour-coded alerts at 50%, 80%, and 100% of your budget.' },
    { icon: 'ti-users', bg: colors.blueBg, iconColor: colors.blue, title: 'Roommate bill splitting', desc: 'Create groups for flatmates or trip squads. Split equally or by custom ratios. Always know who owes whom.' },
    { icon: 'ti-refresh', bg: colors.redBg, iconColor: colors.red, title: 'Subscriptions manager', desc: 'Track Netflix, Spotify, gym, and every other recurring charge. Get reminded before each renewal date.' },
    { icon: 'ti-target', bg: colors.greenBg, iconColor: colors.green, title: 'Savings goals', desc: 'Planning a trip or saving for a laptop? Set a target, track your progress, and get suggested monthly contributions.' },
    { icon: 'ti-school', bg: '#FAEEDA', iconColor: '#854F0B', title: 'College-specific tracker', desc: 'Dedicated tracker for mess fees, hostel rent, and utilities — the expenses every student forgets to log.' },
  ];

  const steps = [
    { num: '01', icon: 'ti-user-plus', title: 'Create your account', desc: 'Sign up with email. No credit card, no bank link required.' },
    { num: '02', icon: 'ti-settings', title: 'Set your budgets', desc: 'Define monthly limits for food, rent, transport, and any category you choose.' },
    { num: '03', icon: 'ti-plus', title: 'Log your spending', desc: 'Add expenses in seconds. Smart auto-categorisation handles the tagging for you.' },
    { num: '04', icon: 'ti-chart-bar', title: 'Watch it all make sense', desc: 'Charts, insights, and alerts give you a clear picture every single month.' },
  ];

  const stats = [
    { num: '9+', label: 'Core finance modules' },
    { num: '4', label: 'Wallet types supported' },
    { num: '∞', label: 'Savings goals you can set' },
    { num: '₀', label: 'Bank access required' },
  ];

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif", background: colors.white, color: colors.textPrimary }}>

      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 48px',
        borderBottom: `0.5px solid ${colors.border}`,
        background: colors.white,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.5rem', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase' }}>
          MoneyWise
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button style={btn('ghost')} onClick={() => navigate('/login')}>Log in</button>
          <button style={btn('primary')} onClick={() => navigate('/signup')}>Get started</button>
        </div>
      </nav>

      <section style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '80px 48px 60px', gap: '48px' }}>
        <div style={{ flex: 1, maxWidth: '560px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: colors.greenBg, color: colors.green, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '6px 14px', borderRadius: '20px', marginBottom: '24px' }}>
            <i className="ti ti-sparkles" aria-hidden="true" />
            Built for students &amp; young adults
          </div>

          <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '3.4rem', fontWeight: 600, lineHeight: 1.1, color: colors.textPrimary, marginBottom: '20px', letterSpacing: '1px' }}>
            Your money,<br />
            <span style={{ background: colors.tealGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              finally under control
            </span>
          </h1>

          <p style={{ fontSize: '1rem', color: colors.textMuted, lineHeight: 1.7, marginBottom: '36px', fontWeight: 400 }}>
            Track expenses, split bills with roommates, manage subscriptions, and hit your savings goals — all in one clean dashboard designed for the way you actually spend.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button
              style={{ background: colors.tealGradient, color: colors.white, border: 'none', padding: '14px 36px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: "'Montserrat', sans-serif" }}
              onClick={() => navigate('/signup')}
            >
              Start for free
            </button>
            <button style={{ background: 'transparent', color: colors.textPrimary, border: `1.5px solid ${colors.textPrimary}`, padding: '14px 36px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: "'Montserrat', sans-serif" }}>
              See how it works
            </button>
          </div>
        </div>

        <div style={{ flex: '0 0 340px' }}>
          <DashboardCard />
        </div>
      </section>

      <section style={{ padding: '64px 48px' }}>
        <div style={sectionTag}>What you get</div>
        <h2 style={sectionTitle}>Everything a student's wallet needs</h2>
        <p style={{ fontSize: '0.95rem', color: colors.textMuted, lineHeight: 1.7, maxWidth: '540px' }}>
          No bloat, no bank integrations required. Just the tools that matter for hostel life, college trips, and tight budgets.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '40px' }}>
          {features.map((f, i) => (
            <div key={i} style={{ border: `0.5px solid ${colors.border}`, borderRadius: '14px', padding: '24px' }}>
              <div style={{ width: '42px', height: '42px', background: f.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <i className={`ti ${f.icon}`} style={{ color: f.iconColor, fontSize: '20px' }} aria-hidden="true" />
              </div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.1rem', color: colors.textPrimary, fontWeight: 500, marginBottom: '8px', letterSpacing: '0.5px' }}>{f.title}</div>
              <div style={{ fontSize: '0.85rem', color: colors.textMuted, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: colors.bgLight, padding: '64px 48px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ ...sectionTag, display: 'inline-block' }}>How it works</div>
          <h2 style={sectionTitle}>Up and running in minutes</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '0 12px' }}>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '2.5rem', color: 'rgba(54,76,79,0.1)', fontWeight: 600, lineHeight: 1, marginBottom: '8px' }}>{s.num}</div>
              <div style={{ width: '48px', height: '48px', background: colors.tealGradient, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: colors.white }}>
                <i className={`ti ${s.icon}`} style={{ fontSize: '22px' }} aria-hidden="true" />
              </div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1rem', color: colors.textPrimary, fontWeight: 500, marginBottom: '6px', letterSpacing: '0.5px' }}>{s.title}</div>
              <div style={{ fontSize: '0.82rem', color: colors.textMuted, lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '64px 48px', borderTop: `0.5px solid rgba(54,76,79,0.08)` }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ ...sectionTag, display: 'inline-block' }}>Why MoneyWise</div>
          <h2 style={sectionTitle}>Built lean, designed smart</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '2.8rem', color: colors.textPrimary, fontWeight: 600, letterSpacing: '1px' }}>{s.num}</div>
              <div style={{ fontSize: '0.85rem', color: colors.textLight, marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: colors.darkGradient, padding: '80px 48px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '2.8rem', color: colors.white, fontWeight: 500, marginBottom: '16px', letterSpacing: '1px' }}>
          Take control of your money today
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', marginBottom: '36px', lineHeight: 1.6 }}>
          No setup fees. No bank integrations. Just a smarter way to manage<br />your money through college and beyond.
        </p>
        <button
          style={{ background: colors.white, color: colors.textPrimary, border: 'none', padding: '14px 40px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: "'Montserrat', sans-serif" }}
          onClick={() => navigate('/signup')}
        >
          Get started — it's free
        </button>
      </section>  

      <footer style={{ padding: '32px 48px', borderTop: `0.5px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.1rem', fontWeight: 600, letterSpacing: '3px', color: colors.textPrimary }}>MoneyWise</div>
        <div style={{ fontSize: '0.8rem', color: colors.textLight }}>© 2026 MoneyWise · Smart finance for students</div>
      </footer>

    </div>
  );
};

export default LandingPage;