import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ClickSpark from './ClickSpark';
import RotatingText from './RotatingText';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600&family=Montserrat:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink:      #1E3336;
    --ink-mid:  #364C4F;
    --ink-soft: #6B8B8E;
    --ink-pale: #9BB5B8;
    --mint:     #1D9E75;
    --mint-dim: #0F6E56;
    --mint-bg:  #E1F5EE;
    --border:   rgba(54,76,79,0.09);
    --FD: 'Oswald', sans-serif;
    --FB: 'Montserrat', sans-serif;
  }
  html { scroll-behavior: smooth; }

  @keyframes fadeUp    { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes barFill   { from{width:0} }
  @keyframes cardFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
  @keyframes marqScroll{ 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes spinRing  { from{transform:translate(-50%,-50%) rotate(0deg)} to{transform:translate(-50%,-50%) rotate(360deg)} }
  @keyframes glowPulse { 0%,100%{box-shadow:0 0 0 0 rgba(29,158,117,0)} 50%{box-shadow:0 0 0 12px rgba(29,158,117,0.1)} }
  @keyframes chipFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes revealUp  { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
  @keyframes lineGrow  { from{transform:scaleX(0);transform-origin:left} to{transform:scaleX(1);transform-origin:left} }
  @keyframes numberCount { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  .afu { animation: fadeUp  0.72s cubic-bezier(0.22,1,0.36,1) both }
  .afi { animation: fadeIn  0.6s ease both }
  .d1{animation-delay:.05s}.d2{animation-delay:.18s}.d3{animation-delay:.3s}
  .d4{animation-delay:.42s}.d5{animation-delay:.54s}.d6{animation-delay:.8s}.d7{animation-delay:1.1s}

  /* ── NAV ────────────────────────────────── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 60px; height: 64px;
    background: rgba(255,255,255,0.94);
    backdrop-filter: blur(20px);
    border-bottom: 0.5px solid var(--border);
    transition: box-shadow .3s;
  }
  .nav.scrolled { box-shadow: 0 2px 24px rgba(30,51,54,.06); }
  .nav-brand {
    font-family: var(--FD); font-size: 1.3rem; font-weight: 600;
    letter-spacing: 4px; text-transform: uppercase; color: var(--ink);
    cursor: pointer;
  }
  .nav-links { display: flex; gap: 40px; }
  .nav-link {
    font-family: var(--FB); font-size: .82rem; font-weight: 500;
    color: var(--ink-soft); cursor: pointer; transition: color .2s;
    letter-spacing: .3px; background: none; border: none; padding: 0;
    position: relative;
  }
  .nav-link::after {
    content: ''; position: absolute; bottom: -3px; left: 0; right: 0;
    height: 1px; background: var(--mint); transform: scaleX(0);
    transform-origin: left; transition: transform .25s cubic-bezier(0.22,1,0.36,1);
  }
  .nav-link:hover { color: var(--ink); }
  .nav-link:hover::after { transform: scaleX(1); }
  .nav-right { display: flex; gap: 10px; align-items: center; }
  .btn-ghost {
    font-family: var(--FB); font-size: .82rem; font-weight: 600;
    color: var(--ink); background: transparent; border: 0.5px solid var(--border);
    padding: 8px 20px; border-radius: 6px; cursor: pointer;
    transition: border-color .2s, background .2s;
  }
  .btn-ghost:hover { border-color: var(--ink-mid); background: rgba(30,51,54,.03); }
  .btn-solid {
    font-family: var(--FB); font-size: .82rem; font-weight: 600;
    color: #fff; background: var(--ink); border: none;
    padding: 9px 22px; border-radius: 6px; cursor: pointer;
    transition: background .2s, transform .15s;
  }
  .btn-solid:hover { background: #152729; transform: translateY(-1px); }

  /* ── HERO ───────────────────────────────── */
  .hero {
    min-height: 100vh;
    display: grid; grid-template-columns: 1fr 1fr;
    align-items: center;
    max-width: 1320px; margin: 0 auto;
    padding: 100px 60px 72px; gap: 64px;
  }
  .hero-h1 {
    font-family: var(--FD);
    font-size: clamp(3.2rem, 4.8vw, 5.2rem);
    font-weight: 600; line-height: 1; color: var(--ink);
    margin-bottom: 24px; letter-spacing: 1px; text-transform: uppercase;
  }
  .rw {
    display: inline-block; background: var(--mint-bg); color: var(--mint);
    padding: 2px 14px 3px; border-radius: 5px;
    font-family: var(--FD); font-size: inherit; font-weight: 500;
    letter-spacing: 2px; overflow: hidden; vertical-align: baseline;
    line-height: inherit; text-transform: uppercase;
  }
  .hero-sub {
    font-family: var(--FB); font-size: .92rem; color: var(--ink-soft);
    line-height: 1.85; margin-bottom: 40px; max-width: 380px;
  }
  .hero-cta { display: flex; gap: 14px; align-items: center; }
  .cta-primary {
    font-family: var(--FB); background: var(--mint); color: #fff;
    border: none; padding: 13px 36px; border-radius: 6px;
    font-size: .88rem; font-weight: 600; cursor: pointer; letter-spacing: .5px;
    transition: background .2s, transform .15s, box-shadow .2s;
    animation: glowPulse 3.5s 1.4s infinite;
  }
  .cta-primary:hover { background: var(--mint-dim); transform: translateY(-2px); box-shadow: 0 10px 28px rgba(29,158,117,.28); }
  .cta-link {
    font-family: var(--FB); font-size: .88rem; font-weight: 500;
    color: var(--ink-soft); cursor: pointer; display: flex; align-items: center;
    gap: 6px; transition: color .2s; background: none; border: none;
  }
  .cta-link:hover { color: var(--ink); }
  .cta-arrow { transition: transform .2s; display: inline-flex; }
  .cta-link:hover .cta-arrow { transform: translateX(4px); }

  /* hero card */
  .hero-right { position: relative; z-index: 1; }
  .hcard {
    background: var(--ink); border-radius: 20px; padding: 28px;
    position: relative; overflow: hidden;
    animation: cardFloat 7s ease-in-out infinite;
    box-shadow: 0 40px 80px rgba(30,51,54,.24), 0 6px 20px rgba(30,51,54,.10);
  }
  .hc-circle {
    position: absolute; border-radius: 50%;
    background: rgba(29,158,117,.07); pointer-events: none;
  }
  .hc-lbl { font-family: var(--FB); font-size: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: rgba(93,202,165,.75); margin-bottom: 8px; }
  .hc-amt { font-family: var(--FD); font-size: 2.9rem; font-weight: 600; color: #fff; letter-spacing: -1px; line-height: 1; }
  .hc-sub { font-family: var(--FB); font-size: 11px; color: rgba(255,255,255,.3); margin-top: 5px; }
  .hc-badge { background: rgba(29,158,117,.2); border: 0.5px solid rgba(29,158,117,.4); border-radius: 20px; padding: 5px 12px; font-family: var(--FB); font-size: 11px; color: #5DCAA5; font-weight: 600; white-space: nowrap; }
  .hc-div { height: 0.5px; background: rgba(255,255,255,.07); margin: 18px 0; }
  .hc-blbl { display: flex; justify-content: space-between; font-family: var(--FB); font-size: 11px; color: rgba(255,255,255,.35); margin-bottom: 6px; }
  .hc-bt { height: 4px; background: rgba(255,255,255,.06); border-radius: 2px; overflow: hidden; margin-bottom: 12px; }
  .hc-bf { height: 100%; border-radius: 2px; animation: barFill 1.4s cubic-bezier(0.22,1,0.36,1) both; }
  .hc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-top: 16px; }
  .hc-mini { background: rgba(255,255,255,.05); border: 0.5px solid rgba(255,255,255,.07); border-radius: 9px; padding: 11px; }
  .hc-mini-l { font-family: var(--FB); font-size: 10px; color: rgba(93,202,165,.65); margin-bottom: 4px; }
  .hc-mini-v { font-family: var(--FD); font-size: 1.1rem; font-weight: 600; color: #fff; }
  .hchip {
    position: absolute; background: #fff; border: 0.5px solid var(--border);
    border-radius: 10px; padding: 9px 14px;
    box-shadow: 0 8px 28px rgba(30,51,54,.10);
    display: flex; align-items: center; gap: 8px;
    font-family: var(--FB); font-size: 11.5px; font-weight: 500; color: var(--ink);
    white-space: nowrap; animation: chipFloat 5s ease-in-out infinite;
  }
  .hchip-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

  /* ── TRUST BAND ─────────────────────────── */
  .trust-band {
    background: #fff; border-top: 0.5px solid var(--border);
    border-bottom: 0.5px solid var(--border);
    overflow: hidden; height: 50px; display: flex; align-items: center;
    position: relative;
  }
  .trust-band::before,.trust-band::after {
    content: ''; position: absolute; top: 0; bottom: 0; width: 100px; z-index: 2; pointer-events: none;
  }
  .trust-band::before { left: 0; background: linear-gradient(to right, #fff, transparent); }
  .trust-band::after  { right: 0; background: linear-gradient(to left,  #fff, transparent); }
  .trust-track {
    display: flex; animation: marqScroll 20s linear infinite;
    white-space: nowrap; align-items: center;
  }
  .trust-item {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 0 36px; font-family: var(--FB); font-size: 12px;
    font-weight: 500; color: var(--ink-soft); letter-spacing: .2px;
  }
  .trust-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--mint); flex-shrink: 0; }

  /* ── FEATURES — ONE CARD AT A TIME ─────── */
  .feat-section {
    background: #fff; border-top: 0.5px solid var(--border);
    padding: 100px 60px;
  }
  .feat-inner { max-width: 1240px; margin: 0 auto; }
  .feat-top {
    display: grid; grid-template-columns: 1fr 1fr;
    align-items: end; gap: 48px; margin-bottom: 56px;
  }
  .feat-eyebrow {
    font-family: var(--FB); font-size: 10px; font-weight: 600;
    letter-spacing: 2.5px; text-transform: uppercase; color: var(--ink-pale); margin-bottom: 14px;
  }
  .feat-heading {
    font-family: var(--FD); font-size: clamp(2.2rem,3vw,3.2rem); font-weight: 600;
    text-transform: uppercase; letter-spacing: 1px; color: var(--ink);
    line-height: 1.05;
  }
  .feat-heading em { font-style: normal; color: var(--mint); }
  .feat-sub {
    font-family: var(--FB); font-size: .87rem; color: var(--ink-soft);
    line-height: 1.78; max-width: 340px;
  }
  /* tab nav */
  .feat-tabs {
    display: flex; gap: 6px; margin-bottom: 32px; flex-wrap: wrap;
  }
  .feat-tab {
    font-family: var(--FB); font-size: 12px; font-weight: 600;
    padding: 7px 18px; border-radius: 20px; cursor: pointer; border: none;
    background: #F2F5F5; color: var(--ink-soft);
    transition: background .2s, color .2s, transform .15s;
    letter-spacing: .2px;
  }
  .feat-tab:hover { background: #E8EDEE; color: var(--ink); }
  .feat-tab.on { background: var(--ink); color: #fff; transform: translateY(-1px); }
  /* card display area */
  .feat-display {
    display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: stretch;
  }
  .feat-card-main {
    background: #fff; border: 0.5px solid var(--border); border-radius: 16px;
    padding: 36px; position: relative; overflow: hidden;
    animation: fadeUp .45s cubic-bezier(0.22,1,0.36,1);
  }
  .feat-card-main::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    border-radius: 16px 16px 0 0;
    animation: lineGrow .6s cubic-bezier(0.22,1,0.36,1) both;
  }
  .feat-card-number {
    font-family: var(--FD); font-size: .75rem; letter-spacing: 1.5px;
    color: var(--ink-pale); margin-bottom: 22px;
  }
  .feat-card-icon {
    width: 46px; height: 46px; border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
  }
  .feat-card-title {
    font-family: var(--FD); font-size: 1.3rem; font-weight: 500;
    text-transform: uppercase; letter-spacing: .8px; color: var(--ink);
    margin-bottom: 12px; line-height: 1.15;
  }
  .feat-card-desc {
    font-family: var(--FB); font-size: .86rem; color: var(--ink-soft);
    line-height: 1.75; margin-bottom: 22px;
  }
  .feat-card-tags { display: flex; gap: 7px; flex-wrap: wrap; }
  .feat-tag {
    font-family: var(--FB); font-size: 10px; font-weight: 600;
    padding: 3px 10px; border-radius: 5px; letter-spacing: .3px;
  }
  /* mini preview on the right */
  .feat-preview {
    background: var(--ink); border-radius: 16px; padding: 24px;
    display: flex; flex-direction: column; justify-content: center;
    animation: fadeUp .5s .08s cubic-bezier(0.22,1,0.36,1) both;
    overflow: hidden; position: relative; min-height: 300px;
  }
  .fp-circle {
    position: absolute; border-radius: 50%;
    background: rgba(29,158,117,.07); pointer-events: none;
  }
  .fp-lbl { font-family: var(--FB); font-size: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: rgba(93,202,165,.7); margin-bottom: 14px; position: relative; z-index: 1; }
  .fp-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: rgba(255,255,255,.05); border: 0.5px solid rgba(255,255,255,.07); border-radius: 8px; margin-bottom: 8px; position: relative; z-index: 1; }
  .fp-name { font-family: var(--FB); font-size: 12px; font-weight: 500; color: rgba(255,255,255,.7); }
  .fp-val  { font-family: var(--FD); font-size: .95rem; font-weight: 600; color: #fff; }
  .fp-bar-wrap { margin-bottom: 10px; position: relative; z-index: 1; }
  .fp-blbl { display: flex; justify-content: space-between; font-family: var(--FB); font-size: 11px; color: rgba(255,255,255,.3); margin-bottom: 5px; }
  .fp-bt { height: 4px; background: rgba(255,255,255,.06); border-radius: 2px; overflow: hidden; }
  .fp-bf { height: 100%; border-radius: 2px; animation: barFill 1.2s cubic-bezier(0.22,1,0.36,1) both; }
  .fp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; position: relative; z-index: 1; }
  .fp-mini { background: rgba(255,255,255,.05); border: 0.5px solid rgba(255,255,255,.06); border-radius: 8px; padding: 10px; }
  .fp-mini-l { font-family: var(--FB); font-size: 10px; color: rgba(93,202,165,.6); margin-bottom: 3px; }
  .fp-mini-v { font-family: var(--FD); font-size: 1rem; font-weight: 600; color: #fff; }
  .fp-goal { padding: 10px 12px; background: rgba(255,255,255,.05); border: 0.5px solid rgba(255,255,255,.07); border-radius: 8px; margin-bottom: 8px; position: relative; z-index: 1; }
  .fp-goal-top { display: flex; justify-content: space-between; font-family: var(--FB); font-size: 12px; color: rgba(255,255,255,.65); margin-bottom: 7px; }
  .fp-goal-pct { font-family: var(--FD); font-size: .9rem; font-weight: 600; }
  .fp-sub-row { display: flex; gap: 8px; position: relative; z-index: 1; margin-bottom: 8px; }
  .fp-sub-item { flex: 1; background: rgba(255,255,255,.05); border: 0.5px solid rgba(255,255,255,.07); border-radius: 8px; padding: 10px; }
  .fp-sub-name { font-family: var(--FB); font-size: 11px; color: rgba(255,255,255,.5); margin-bottom: 4px; }
  .fp-sub-price { font-family: var(--FD); font-size: .9rem; font-weight: 600; color: #fff; }
  .fp-member { display: flex; align-items: center; gap: 8px; padding: 9px 12px; background: rgba(255,255,255,.05); border: 0.5px solid rgba(255,255,255,.07); border-radius: 8px; margin-bottom: 8px; position: relative; z-index: 1; }
  .fp-avatar { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--FD); font-size: .7rem; font-weight: 600; flex-shrink: 0; }
  .fp-member-name { font-family: var(--FB); font-size: 12px; color: rgba(255,255,255,.65); flex: 1; }
  .fp-member-amt { font-family: var(--FD); font-size: .88rem; font-weight: 600; }
  .fp-insight { background: rgba(29,158,117,.12); border: 0.5px solid rgba(29,158,117,.25); border-radius: 8px; padding: 10px 12px; font-family: var(--FB); font-size: 11.5px; color: rgba(93,202,165,.9); line-height: 1.5; position: relative; z-index: 1; margin-top: 4px; }

  /* ── HOW IT WORKS ──────────────────────── */
  .how-sec {
    background: #FAFCFC; border-top: 0.5px solid var(--border);
    padding: 100px 60px;
  }
  .how-inner { max-width: 1200px; margin: 0 auto; }
  .how-head { text-align: center; margin-bottom: 72px; }
  .how-steps {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
    position: relative;
  }
  .how-connector {
    position: absolute; top: 27px; left: calc(12.5% + 27px);
    right: calc(12.5% + 27px); height: 0.5px;
    background: var(--border);
  }
  .how-step { padding: 0 28px; text-align: center; position: relative; }
  .how-dot {
    width: 54px; height: 54px; border-radius: 50%; background: #fff;
    border: 0.5px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 24px; transition: border-color .3s, box-shadow .3s, background .3s;
    position: relative; z-index: 1;
  }
  .how-step:hover .how-dot { border-color: var(--mint); box-shadow: 0 0 0 8px var(--mint-bg); background: #fff; }
  .how-step-n { font-family: var(--FD); font-size: .88rem; font-weight: 600; color: var(--ink); }
  .how-title { font-family: var(--FD); font-size: .95rem; font-weight: 500; text-transform: uppercase; letter-spacing: .5px; color: var(--ink); margin-bottom: 10px; }
  .how-desc  { font-family: var(--FB); font-size: .82rem; color: var(--ink-soft); line-height: 1.7; }

  /* ── SHARED HEADING UTILS ──────────────── */
  .eyebrow {
    font-family: var(--FB); font-size: 10px; font-weight: 600;
    letter-spacing: 2.5px; text-transform: uppercase; color: var(--ink-pale); margin-bottom: 14px;
  }
  .eyebrow.ctr { text-align: center; }
  .eyebrow.lt  { color: rgba(255,255,255,.35); }
  .s2 {
    font-family: var(--FD); font-size: clamp(2rem, 2.8vw, 2.9rem);
    font-weight: 600; text-transform: uppercase; letter-spacing: 1px;
    color: var(--ink); line-height: 1.1;
  }
  .s2 em   { font-style: normal; color: var(--mint); }
  .s2.lt   { color: #fff; }
  .s2.ctr  { text-align: center; }

  /* ── LIVE PREVIEW ──────────────────────── */
  .prev-sec { background: #fff; border-top: 0.5px solid var(--border); padding: 100px 60px; }
  .prev-wrap { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1.1fr; gap: 80px; align-items: start; }
  .prev-sticky { position: sticky; top: 100px; }
  .prev-tabs { display: flex; gap: 4px; margin-bottom: 22px; }
  .prev-tab {
    font-family: var(--FB); font-size: 12px; font-weight: 600;
    padding: 8px 18px; border-radius: 6px; cursor: pointer; border: none;
    transition: background .2s, color .2s;
    background: transparent; color: var(--ink-pale);
  }
  .prev-tab.on { background: var(--ink); color: #fff; }
  .prev-tab:not(.on):hover { background: #F2F5F5; color: var(--ink); }
  .prev-panel { background: #fff; border: 0.5px solid var(--border); border-radius: 14px; padding: 22px; box-shadow: 0 4px 28px rgba(30,51,54,.06); animation: fadeUp .35s cubic-bezier(0.22,1,0.36,1); }
  .pp-lbl { font-family: var(--FB); font-size: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--ink-pale); margin-bottom: 14px; }
  .pp-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 13px; border-radius: 8px; background: #F7FAFA; margin-bottom: 7px; }
  .pp-rn  { font-family: var(--FB); font-size: 12px; font-weight: 500; color: var(--ink); }
  .pp-rv  { font-family: var(--FD); font-size: .95rem; font-weight: 600; color: var(--ink); }
  .pp-chips { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .pp-chip  { border-radius: 7px; padding: 10px; text-align: center; font-family: var(--FB); font-size: 11px; font-weight: 600; }
  .pp-gbar  { height: 5px; background: #E8ECEC; border-radius: 3px; overflow: hidden; margin: 10px 0 7px; }
  .pp-gfill { height: 100%; border-radius: 3px; animation: barFill 1s cubic-bezier(0.22,1,0.36,1) both; }
  .pp-brow  { margin-bottom: 13px; }
  .pp-blbl  { display: flex; justify-content: space-between; font-family: var(--FB); font-size: 12px; color: var(--ink-soft); margin-bottom: 6px; }
  .pp-btrack{ height: 5px; background: #E8ECEC; border-radius: 3px; overflow: hidden; }
  .pp-bfill { height: 100%; border-radius: 3px; animation: barFill 1s ease both; }
  .pp-stat-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
  .pp-stat   { background: #F7FAFA; border-radius: 8px; padding: 12px; }
  .pp-stat-l { font-family: var(--FB); font-size: 10px; color: var(--ink-pale); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px; }
  .pp-stat-v { font-family: var(--FD); font-size: 1.05rem; font-weight: 600; color: var(--ink); }
  .pp-stat-v.green { color: var(--mint); }
  .pp-goal-row { padding: 12px; border: 0.5px solid var(--border); border-radius: 9px; margin-bottom: 9px; }
  .pp-goal-row:last-child { margin-bottom: 0; }
  .pp-goal-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .pp-goal-name { font-family: var(--FB); font-size: 12px; font-weight: 600; color: var(--ink); }
  .pp-budget-tag { display: inline-block; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 4px; font-family: var(--FB); }

  /* ── PLANS ─────────────────────────────── */
  .plan-sec { background: var(--ink); padding: 100px 60px; position: relative; overflow: hidden; }
  .plan-ring { position: absolute; border-radius: 50%; border: 0.5px solid rgba(29,158,117,.09); pointer-events: none; top: 50%; left: 50%; transform: translate(-50%,-50%); animation: spinRing 45s linear infinite; }
  .plan-inner { max-width: 1200px; margin: 0 auto; position: relative; z-index: 2; }
  .plan-head  { text-align: center; margin-bottom: 52px; }
  .plan-sub   { font-family: var(--FB); font-size: .88rem; color: rgba(255,255,255,.35); margin-top: 10px; }
  .plan-soon  { display: inline-flex; align-items: center; background: rgba(29,158,117,.1); border: 0.5px solid rgba(29,158,117,.22); border-radius: 4px; padding: 4px 12px; font-family: var(--FB); font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(93,202,165,.8); margin-top: 12px; }
  .plan-grid  { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .plan-card  { border: 0.5px solid rgba(255,255,255,.07); border-radius: 16px; padding: 34px 30px; background: rgba(255,255,255,.025); transition: border-color .25s, transform .25s; position: relative; }
  .plan-card:hover { border-color: rgba(29,158,117,.3); transform: translateY(-5px); }
  .plan-card.feat { border-color: rgba(29,158,117,.4); background: rgba(29,158,117,.06); }
  .plan-badge { position: absolute; top: 18px; right: 18px; font-family: var(--FB); font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 3px 10px; border-radius: 4px; background: var(--mint); color: #fff; }
  .plan-name  { font-family: var(--FD); font-size: 1.05rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #fff; margin-bottom: 5px; }
  .plan-tag   { font-family: var(--FB); font-size: 11px; color: rgba(255,255,255,.3); margin-bottom: 26px; }
  .plan-price { font-family: var(--FD); font-size: 2.3rem; font-weight: 600; color: #fff; line-height: 1; margin-bottom: 3px; }
  .plan-price span { font-family: var(--FB); font-size: .82rem; font-weight: 400; color: rgba(255,255,255,.3); margin-left: 3px; }
  .plan-div   { height: 0.5px; background: rgba(255,255,255,.06); margin: 22px 0; }
  .plan-feat  { display: flex; align-items: flex-start; gap: 9px; font-family: var(--FB); font-size: 12.5px; color: rgba(255,255,255,.55); margin-bottom: 10px; line-height: 1.4; }
  .plan-chk   { width: 15px; height: 15px; border-radius: 50%; background: rgba(29,158,117,.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
  .plan-btn   { font-family: var(--FB); font-size: 12px; font-weight: 600; width: 100%; padding: 11px; border-radius: 7px; cursor: pointer; letter-spacing: .3px; margin-top: 26px; transition: all .2s; border: 0.5px solid; }
  .plan-btn.ghost { background: transparent; border-color: rgba(255,255,255,.12); color: rgba(255,255,255,.55); }
  .plan-btn.ghost:hover { border-color: rgba(255,255,255,.35); color: #fff; }
  .plan-btn.solid { background: var(--mint); border-color: var(--mint); color: #fff; }
  .plan-btn.solid:hover { background: var(--mint-dim); border-color: var(--mint-dim); }

  /* ── CTA ────────────────────────────────── */
  .cta-sec {
    background: #fff; border-top: 0.5px solid var(--border);
    padding: 120px 60px; text-align: center; position: relative; overflow: hidden;
  }
  .cta-ring { position: absolute; border-radius: 50%; border: 0.5px solid var(--border); pointer-events: none; top: 50%; left: 50%; transform: translate(-50%,-50%); animation: spinRing 40s linear infinite; }
  .cta-h2 { font-family: var(--FD); font-size: clamp(2.5rem,4vw,4.2rem); font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--ink); line-height: 1.1; margin-bottom: 18px; position: relative; z-index: 2; }
  .cta-h2 em { font-style: normal; color: var(--mint); }
  .cta-sub { font-family: var(--FB); font-size: .9rem; color: var(--ink-soft); line-height: 1.78; margin-bottom: 38px; max-width: 420px; margin-left: auto; margin-right: auto; position: relative; z-index: 2; }
  .cta-btns { display: flex; gap: 12px; justify-content: center; position: relative; z-index: 2; }
  .cta-btn-p { font-family: var(--FB); background: var(--ink); color: #fff; border: none; padding: 14px 44px; border-radius: 6px; font-size: .88rem; font-weight: 600; cursor: pointer; letter-spacing: .5px; transition: background .2s, transform .15s, box-shadow .2s; }
  .cta-btn-p:hover { background: #152729; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(30,51,54,.16); }
  .cta-btn-s { font-family: var(--FB); background: transparent; color: var(--ink); border: 0.5px solid var(--border); padding: 14px 36px; border-radius: 6px; font-size: .88rem; font-weight: 500; cursor: pointer; transition: border-color .2s; }
  .cta-btn-s:hover { border-color: var(--ink-mid); }

  /* ── FOOTER ─────────────────────────────── */
  .footer { border-top: 0.5px solid var(--border); padding: 22px 60px; display: flex; align-items: center; justify-content: center; background: #fff; }
  .foot-copy { font-family: var(--FB); font-size: 11px; color: var(--ink-pale); letter-spacing: .3px; }
`;

/* ─── Small inline icons ─────────────────────── */
const IW  = ({c}) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
const IU  = ({c}) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.85"/></svg>;
const IT  = ({c}) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IB  = ({c}) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IC  = ({c}) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IS  = ({c}) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const Chk = () => <svg style={{width:8,height:8}} viewBox="0 0 12 12" fill="none" stroke="#1D9E75" strokeWidth="2.2" strokeLinecap="round"><polyline points="2,6 5,9 10,3"/></svg>;
const ChkW = () => <svg style={{width:8,height:8}} viewBox="0 0 12 12" fill="none" stroke="#1D9E75" strokeWidth="2.2" strokeLinecap="round"><polyline points="2,6 5,9 10,3"/></svg>;
const ArrowRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;

/* ─── Feature data ───────────────────────────── */
const FEATURES = [
  {
    id: 0, num: '01', label: 'Expenses',
    icon: <IW c="#1D9E75"/>, iconBg: '#E1F5EE', accentColor: '#1D9E75',
    title: 'Expense & income tracking',
    desc: 'Log every rupee in seconds. Categorise by food, transport, hostel rent. Auto-tagging handles Swiggy, Uber, Amazon — no manual work.',
    tags: ['Smart auto-tag', 'Bill upload', 'CSV export'],
    tagStyle: { background: '#E1F5EE', color: '#0F6E56' },
    preview: 'expenses',
  },
  {
    id: 1, num: '02', label: 'Split bills',
    icon: <IU c="#185FA5"/>, iconBg: '#E6F1FB', accentColor: '#185FA5',
    title: 'Roommate bill splitting',
    desc: 'Create shared groups for flatmates, trips, or events. Split equally or by custom ratios. Balance tracker tells you exactly who owes whom.',
    tags: ['Equal split', 'Custom ratios', 'Settlement'],
    tagStyle: { background: '#E6F1FB', color: '#0C447C' },
    preview: 'split',
  },
  {
    id: 2, num: '03', label: 'Analytics',
    icon: <IC c="#fff"/>, iconBg: 'rgba(29,158,117,.25)', accentColor: '#1D9E75',
    title: 'AI-powered spend analysis',
    desc: 'Financial health score updated monthly. Spike anomaly detection flags unusual spending. Category trend analysis shows exactly where money goes.',
    tags: ['Health score', 'Anomaly alerts', 'Trends'],
    tagStyle: { background: '#E1F5EE', color: '#0F6E56' },
    preview: 'analytics',
  },
  {
    id: 3, num: '04', label: 'Goals',
    icon: <IT c="#BA7517"/>, iconBg: '#FFF3E0', accentColor: '#BA7517',
    title: 'Savings goals',
    desc: 'MacBook, Goa trip, emergency fund. Set targets, contribute regularly, celebrate milestones. Auto-suggests monthly contribution to hit your date.',
    tags: ['Progress rings', 'Milestones', 'Forecasts'],
    tagStyle: { background: '#FFF3E0', color: '#7A4F0A' },
    preview: 'goals',
  },
  {
    id: 4, num: '05', label: 'Subscriptions',
    icon: <IB c="#A32D2D"/>, iconBg: '#FCEBEB', accentColor: '#A32D2D',
    title: 'Subscription manager',
    desc: 'Every recurring charge mapped — Netflix, Spotify, gym, iCloud. Renewal alerts 2 days before each charge. Pause to track savings.',
    tags: ['Renewal alerts', 'Pause & track', 'Annual view'],
    tagStyle: { background: '#FCEBEB', color: '#791F1F' },
    preview: 'subscriptions',
  },
  {
    id: 5, num: '06', label: 'Privacy',
    icon: <IS c="#1D9E75"/>, iconBg: '#E1F5EE', accentColor: '#1D9E75',
    title: 'Fully private, zero bank access',
    desc: 'No OAuth, no Plaid, no third-party bank connections. Your data lives with you. No setup fees, no credit card, no hidden charges.',
    tags: ['Zero bank access', 'No tracking', 'Free forever'],
    tagStyle: { background: '#E1F5EE', color: '#0F6E56' },
    preview: 'privacy',
  },
];

/* ─── Feature mini-previews ──────────────────── */
const FeaturePreview = ({ type }) => {
  const circles = (
    <>
      <div className="fp-circle" style={{width:200,height:200,top:-60,right:-60}}/>
      <div className="fp-circle" style={{width:120,height:120,bottom:-30,left:20}}/>
    </>
  );

  if (type === 'expenses') return (
    <div className="feat-preview">
      {circles}
      <div className="fp-lbl">June 2025 · Transactions</div>
      {[
        {n:'Amazon — earphones',v:'₹1,299',c:'#A32D2D'},
        {n:'Swiggy — dinner',   v:'₹340', c:'#BA7517'},
        {n:'Stipend received',  v:'+₹18,000',c:'#1D9E75'},
        {n:'Uber — campus',    v:'₹180', c:'#BA7517'},
      ].map((r,i)=>(
        <div key={i} className="fp-row" style={{animationDelay:`${i*.07}s`}}>
          <span className="fp-name">{r.n}</span>
          <span className="fp-val" style={{color:r.c}}>{r.v}</span>
        </div>
      ))}
    </div>
  );

  if (type === 'split') return (
    <div className="feat-preview">
      {circles}
      <div className="fp-lbl">Room 204 Squad · Balance</div>
      {[
        {initials:'AR',name:'You',amt:'+₹340',c:'#5DCAA5',bg:'rgba(29,158,117,.25)'},
        {initials:'PK',name:'Priya K',amt:'-₹460',c:'#F09595',bg:'rgba(162,45,45,.25)'},
        {initials:'RS',name:'Rohan S',amt:'+₹120',c:'#5DCAA5',bg:'rgba(29,158,117,.2)'},
        {initials:'MV',name:'Meera V',amt:'₹0',c:'rgba(255,255,255,.35)',bg:'rgba(255,255,255,.07)'},
      ].map((m,i)=>(
        <div key={i} className="fp-member">
          <div className="fp-avatar" style={{background:m.bg,color:m.c}}>{m.initials}</div>
          <span className="fp-member-name">{m.name}</span>
          <span className="fp-member-amt" style={{color:m.c}}>{m.amt}</span>
        </div>
      ))}
      <div className="fp-insight">Priya owes you ₹460 via GPay · 98XXXXXX34</div>
    </div>
  );

  if (type === 'analytics') return (
    <div className="feat-preview">
      {circles}
      <div className="fp-lbl">Financial health · June</div>
      <div style={{position:'relative',zIndex:1,marginBottom:14}}>
        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:'2.2rem',fontWeight:600,color:'#fff',lineHeight:1}}>74<span style={{fontSize:'1rem',color:'rgba(93,202,165,.7)',marginLeft:4}}>/100</span></div>
        <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:'11px',color:'rgba(93,202,165,.75)',marginTop:3}}>Good — a few areas to improve</div>
        <div style={{height:4,background:'rgba(255,255,255,.06)',borderRadius:2,overflow:'hidden',marginTop:10}}>
          <div style={{height:'100%',width:'74%',background:'linear-gradient(90deg,#1D9E75,#5DCAA5)',borderRadius:2}}/>
        </div>
      </div>
      {[
        {l:'Food spending',v:'₹4,200',arrow:'↑ 18% vs May',c:'#F09595'},
        {l:'Transport',   v:'₹1,100',arrow:'↓ 12% vs May',c:'#5DCAA5'},
        {l:'Shopping',    v:'₹3,800',arrow:'↑ 95% of budget',c:'#FAC775'},
      ].map((r,i)=>(
        <div key={i} className="fp-row">
          <span className="fp-name">{r.l}</span>
          <span style={{textAlign:'right'}}>
            <span style={{fontFamily:"'Oswald',sans-serif",fontSize:'.88rem',fontWeight:600,color:'#fff',display:'block'}}>{r.v}</span>
            <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:'10px',color:r.c}}>{r.arrow}</span>
          </span>
        </div>
      ))}
    </div>
  );

  if (type === 'goals') return (
    <div className="feat-preview">
      {circles}
      <div className="fp-lbl">Savings goals · 3 active</div>
      {[
        {name:'MacBook Air M3',pct:62,c:'#1D9E75'},
        {name:'Goa Trip',      pct:38,c:'#378ADD'},
        {name:'Course fund',   pct:81,c:'#7F77DD'},
      ].map((g,i)=>(
        <div key={i} className="fp-goal">
          <div className="fp-goal-top">
            <span>{g.name}</span>
            <span className="fp-goal-pct" style={{color:g.c}}>{g.pct}%</span>
          </div>
          <div className="fp-bt">
            <div className="fp-bf" style={{width:`${g.pct}%`,background:g.c,animationDelay:`${i*.12}s`}}/>
          </div>
        </div>
      ))}
      <div className="fp-insight">MacBook — ₹30,400 to go · 3 months at current pace</div>
    </div>
  );

  if (type === 'subscriptions') return (
    <div className="feat-preview">
      {circles}
      <div className="fp-lbl">Monthly subscriptions · ₹1,756</div>
      <div className="fp-sub-row">
        <div className="fp-sub-item"><div className="fp-sub-name">Spotify</div><div className="fp-sub-price">₹119</div></div>
        <div className="fp-sub-item"><div className="fp-sub-name">Netflix</div><div className="fp-sub-price">₹649</div></div>
        <div className="fp-sub-item"><div className="fp-sub-name">YouTube</div><div className="fp-sub-price">₹189</div></div>
      </div>
      <div className="fp-sub-row">
        <div className="fp-sub-item"><div className="fp-sub-name">Gym</div><div className="fp-sub-price">₹799</div></div>
        <div className="fp-sub-item" style={{background:'rgba(29,158,117,.12)',border:'0.5px solid rgba(29,158,117,.25)'}}>
          <div className="fp-sub-name" style={{color:'rgba(93,202,165,.8)'}}>Renews in</div>
          <div className="fp-sub-price" style={{color:'#5DCAA5'}}>2 days</div>
        </div>
      </div>
      <div className="fp-insight">Netflix + YouTube = ₹838/mo. Consider which you use more.</div>
    </div>
  );

  return (
    <div className="feat-preview">
      {circles}
      <div className="fp-lbl">Your data stays yours</div>
      {[
        {l:'Bank connection',v:'None required'},
        {l:'OAuth integration',v:'Not used'},
        {l:'Data storage',v:'Your account only'},
        {l:'Setup cost',v:'Free forever'},
      ].map((r,i)=>(
        <div key={i} className="fp-row">
          <span className="fp-name">{r.l}</span>
          <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:'11px',fontWeight:600,color:'#5DCAA5'}}>{r.v}</span>
        </div>
      ))}
      <div className="fp-insight">No Plaid. No UPI SMS parsing. No third-party access. Just you.</div>
    </div>
  );
};

/* ─── Live preview panels ────────────────────── */
const PreviewPanel = ({ tab }) => {
  if (tab === 'split') return (
    <div className="prev-panel">
      <div className="pp-lbl">Flatmates Ledger · Meow Group</div>
      <div className="pp-stat-row">
        <div className="pp-stat"><div className="pp-stat-l">Total spent</div><div className="pp-stat-v">₹1,800</div></div>
        <div className="pp-stat"><div className="pp-stat-l">You are owed</div><div className="pp-stat-v green">₹0</div></div>
      </div>
      <div className="pp-row"><span className="pp-rn">Hostel Mess — June</span><span className="pp-rv">₹4,500</span></div>
      <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:'11px',color:'var(--ink-pale)',margin:'8px 0 7px',paddingLeft:'4px'}}>Split evenly · 3 members</div>
      <div className="pp-chips">
        <div className="pp-chip" style={{background:'#E1F5EE',color:'#0F6E56'}}>Sushmita<br/>₹1,500</div>
        <div className="pp-chip" style={{background:'#F7FAFA',color:'var(--ink-soft)'}}>Amy<br/>₹1,500</div>
        <div className="pp-chip" style={{background:'#F7FAFA',color:'var(--ink-soft)'}}>Raj<br/>₹1,500</div>
      </div>
      <div className="pp-row" style={{marginTop:9}}><span className="pp-rn">Wifi — May</span><span className="pp-rv">₹900</span></div>
    </div>
  );

  if (tab === 'goals') return (
    <div className="prev-panel">
      <div className="pp-lbl">Savings Goals</div>
      <div className="pp-stat-row" style={{marginBottom:14}}>
        <div className="pp-stat"><div className="pp-stat-l">Total saved</div><div className="pp-stat-v green">₹65,550</div></div>
        <div className="pp-stat"><div className="pp-stat-l">Still needed</div><div className="pp-stat-v">₹39,450</div></div>
      </div>
      {[
        {name:'MacBook Air M3',cat:'Tech',status:'On track',pct:62,saved:49600,target:80000,sc:'#1D9E75',sb:'#E1F5EE',bc:'#1D9E75'},
        {name:'Goa Trip',     cat:'Travel',status:'At risk', pct:38,saved:3800, target:10000,sc:'#A32D2D',sb:'#FCEBEB',bc:'#185FA5'},
        {name:'Emergency Fund',cat:'Finance',status:'On track',pct:55,saved:16500,target:30000,sc:'#1D9E75',sb:'#E1F5EE',bc:'#1D9E75'},
      ].map((g,i) => (
        <div key={i} className="pp-goal-row">
          <div className="pp-goal-top">
            <div>
              <div className="pp-goal-name">{g.name}</div>
              <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:'10px',color:'var(--ink-pale)',marginTop:2}}>{g.cat}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:'.9rem',fontWeight:600,color:'var(--ink)'}}>₹{g.saved.toLocaleString()}</div>
              <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:'10px',color:'var(--ink-pale)'}}>of ₹{g.target.toLocaleString()}</div>
            </div>
          </div>
          <div className="pp-gbar"><div className="pp-gfill" style={{width:`${g.pct}%`,background:g.bc,animationDelay:`${i*.1}s`}}/></div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span className="pp-budget-tag" style={{background:g.sb,color:g.sc}}>{g.status}</span>
            <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:'11px',fontWeight:700,color:g.bc}}>{g.pct}%</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="prev-panel">
      <div className="pp-lbl">June Budget Tracker</div>
      <div className="pp-stat-row" style={{marginBottom:14}}>
        <div className="pp-stat"><div className="pp-stat-l">Total spent</div><div className="pp-stat-v">₹14,280</div></div>
        <div className="pp-stat"><div className="pp-stat-l">Remaining</div><div className="pp-stat-v green">₹5,720</div></div>
      </div>
      {[
        {l:'Food & mess',  s:4200,t:5000,p:84,c:'#BA7517',tag:'84%',  tagBg:'#FFF3E0',tagC:'#7A4F0A'},
        {l:'Transport',   s:1100,t:2000,p:55,c:'#1D9E75',tag:'55%',  tagBg:'#E1F5EE',tagC:'#0F6E56'},
        {l:'Shopping',    s:3800,t:4000,p:95,c:'#A32D2D',tag:'Over!',tagBg:'#FCEBEB',tagC:'#791F1F'},
        {l:'Subscriptions',s:1249,t:2000,p:62,c:'#185FA5',tag:'62%', tagBg:'#E6F1FB',tagC:'#0C447C'},
      ].map((b,i) => (
        <div key={i} className="pp-brow">
          <div className="pp-blbl">
            <span style={{display:'flex',alignItems:'center',gap:7}}>
              {b.l}
              <span className="pp-budget-tag" style={{background:b.tagBg,color:b.tagC}}>{b.tag}</span>
            </span>
            <span>₹{b.s.toLocaleString()} / ₹{b.t.toLocaleString()}</span>
          </div>
          <div className="pp-btrack"><div className="pp-bfill" style={{width:`${b.p}%`,background:b.c,animationDelay:`${i*.08}s`}}/></div>
        </div>
      ))}
    </div>
  );
};

/* ─── Main component ─────────────────────────── */
const LandingPage = () => {
  const navigate = useNavigate();
  const [tab,         setTab]         = useState('split');
  const [activeFeat,  setActiveFeat]  = useState(0);
  const [navScrolled, setNavScrolled] = useState(false);

  /* nav shadow on scroll */
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* smooth-scroll for nav links */
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const trustItems = ['PG & hostel residents','Roommate groups','Working freshers','College trip squads'];
  const marqItems  = [...trustItems, ...trustItems, ...trustItems, ...trustItems];

  const f = FEATURES[activeFeat];

  const plans = [
    { name:'Free',    tagline:'Everything you need to start',    price:'0',  period:'/mo', featured:false,
      feats:['Expense & income tracking','Budget categories (up to 6)','Savings goals (up to 2)','1 roommate group','Basic monthly summary'] },
    { name:'Student', tagline:'Built for hostel & college life', price:'49', period:'/mo', featured:true, badge:'Most popular',
      feats:['Everything in Free','Unlimited categories & goals','Unlimited roommate groups','Subscription tracker','AI spend analysis','Financial health score'] },
    { name:'Pro',     tagline:'Coming soon',                     price:'—',  period:'',    featured:false, soon:true,
      feats:['Everything in Student','Multi-wallet management','Advanced AI predictions','CSV / PDF export','Priority support','Early access to features'] },
  ];

  return (
    <div style={{fontFamily:"'Montserrat',sans-serif",background:'#fff',color:'#1E3336',minHeight:'100vh',overflowX:'hidden',position:'relative'}}>
      <style>{CSS}</style>

      <ClickSpark sparkColor="#1D9E75" sparkSize={9} sparkRadius={18} sparkCount={8} duration={500}>

      {/* ── NAV ── */}
      <nav className={`nav${navScrolled?' scrolled':''}`}>
        <div className="nav-brand" onClick={() => window.scrollTo({top:0,behavior:'smooth'})}>MONEYWISE</div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => scrollTo('features')}>Features</button>
          <button className="nav-link" onClick={() => scrollTo('how-it-works')}>How it works</button>
          <button className="nav-link" onClick={() => scrollTo('pricing')}>Pricing</button>
        </div>
        <div className="nav-right">
          <button className="btn-ghost" onClick={() => navigate('/login')}>Sign in</button>
          <button className="btn-solid" onClick={() => navigate('/signup')}>Get started</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="hero">
        <div className="hero-left">
          <h1 className="hero-h1 afu d1">
            YOUR MONEY,<br/>
            <span style={{display:'inline-flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
              FINALLY&nbsp;
              <RotatingText
                texts={['CLEAR.','TRACKED.','SPLIT.','SAVED.','YOURS.']}
                mainClassName="rw"
                rotationInterval={2200}
                auto loop
              />
            </span>
          </h1>
          <p className="hero-sub afu d2">
            Track every rupee, split bills with roommates, hit your savings goals — one dashboard, no bank link, no setup fees.
          </p>
          <div className="hero-cta afu d3">
            <button className="cta-primary" onClick={() => navigate('/signup')}>Start for free</button>
            <button className="cta-link" onClick={() => navigate('/login')}>
              Sign in&nbsp;
              <span className="cta-arrow"><ArrowRight/></span>
            </button>
          </div>
        </div>

        <div className="hero-right afu d3">
          <div className="hcard">
            <div className="hc-circle" style={{width:220,height:220,top:-70,right:-70}}/>
            <div className="hc-circle" style={{width:130,height:130,bottom:-40,left:50}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18}}>
              <div>
                <div className="hc-lbl">Total spent · June 2026</div>
                <div className="hc-amt">₹14,280</div>
                <div className="hc-sub">₹5,720 remaining of ₹20,000</div>
              </div>
              <div className="hc-badge">↓ 12% vs May</div>
            </div>
            <div className="hc-div"/>
            {[
              {l:'Food & mess',v:'₹4,200 / ₹5,000',p:84,c:'#BA7517',d:'.4s'},
              {l:'Transport',  v:'₹1,100 / ₹2,000',p:55,c:'#1D9E75',d:'.55s'},
              {l:'Shopping',   v:'₹3,800 / ₹4,000',p:95,c:'#A32D2D',d:'.7s'},
            ].map((b,i) => (
              <div key={i}>
                <div className="hc-blbl"><span>{b.l}</span><span>{b.v}</span></div>
                <div className="hc-bt"><div className="hc-bf" style={{width:`${b.p}%`,background:b.c,animationDelay:b.d}}/></div>
              </div>
            ))}
            <div className="hc-grid">
              <div className="hc-mini"><div className="hc-mini-l">Income</div><div className="hc-mini-v">₹22,000</div></div>
              <div className="hc-mini"><div className="hc-mini-l">Savings</div><div className="hc-mini-v">₹7,720</div></div>
            </div>
          </div>
          {/* floating chips — positioned relative to hero-right, not hcard */}
          <div className="hchip afi d6" style={{top:-18,right:-22,animationDuration:'5s',animationDelay:'2s'}}>
            <div className="hchip-dot" style={{background:'#1D9E75'}}/>MacBook goal — 62% saved
          </div>
          <div className="hchip afi d7" style={{bottom:-14,left:-26,animationDuration:'7s',animationDelay:'1s'}}>
            <div className="hchip-dot" style={{background:'#BA7517'}}/>Shopping at 95% of budget
          </div>
        </div>
      </div>

      {/* ── TRUST MARQUEE ── */}
      <div className="trust-band">
        <div className="trust-track">
          {marqItems.map((t,i) => (
            <span key={i} className="trust-item">
              <span className="trust-dot"/>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES — ONE CARD AT A TIME ── */}
      <section className="feat-section" id="features">
        <div className="feat-inner">
          <div className="feat-top">
            <div>
              <div className="feat-eyebrow">What you get</div>
              <h2 className="feat-heading">
                Every tool<br/>a student<br/>wallet <em>needs</em>
              </h2>
            </div>
            <p className="feat-sub">
              No bloat. No bank logins. No hidden charges. Just what matters when you are living on a tight budget.
            </p>
          </div>

          {/* Tab nav */}
          <div className="feat-tabs">
            {FEATURES.map((ft) => (
              <button
                key={ft.id}
                className={`feat-tab${activeFeat===ft.id?' on':''}`}
                onClick={() => setActiveFeat(ft.id)}
              >
                {ft.label}
              </button>
            ))}
          </div>

          {/* Single card + mini preview */}
          <div className="feat-display" key={activeFeat}>
            <div className="feat-card-main">
              <div style={{position:'absolute',top:0,left:0,right:0,height:3,borderRadius:'16px 16px 0 0',background:f.accentColor,animation:'lineGrow .55s cubic-bezier(0.22,1,0.36,1) both'}}/>
              <div className="feat-card-number">{f.num}</div>
              <div className="feat-card-icon" style={{background:f.iconBg}}>
                <svg viewBox="0 0 24 24" style={{width:22,height:22}} fill="none"
                  stroke={f.iconBg==='rgba(29,158,117,.25)'?'#fff':f.accentColor}
                  strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  {/* Render the correct path by re-using the component approach */}
                </svg>
                <div style={{width:22,height:22}}>{f.icon}</div>
              </div>
              <div className="feat-card-title">{f.title}</div>
              <p className="feat-card-desc">{f.desc}</p>
              <div className="feat-card-tags">
                {f.tags.map((t,i) => (
                  <span key={i} className="feat-tag" style={f.tagStyle}>{t}</span>
                ))}
              </div>
            </div>
            <FeaturePreview type={f.preview}/>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-sec" id="how-it-works">
        <div className="how-inner">
          <div className="how-head">
            <div className="eyebrow ctr">How it works</div>
            <h2 className="s2 ctr">Up and running in <em>minutes</em></h2>
          </div>
          <div className="how-steps">
            <div className="how-connector"/>
            {[
              {n:'01',t:'Create account',  d:'Sign up with email only. No credit card. No bank connection. Under a minute.'},
              {n:'02',t:'Set budgets',     d:'Define monthly limits for food, rent, transport — any category you choose.'},
              {n:'03',t:'Log spending',    d:'Add expenses in seconds. Smart auto-categorisation does the tagging for you.'},
              {n:'04',t:'Watch clarity',   d:'Charts, insights, and alerts give you a complete picture every single month.'},
            ].map((s,i) => (
              <div key={i} className="how-step">
                <div className="how-dot"><span className="how-step-n">{s.n}</span></div>
                <div className="how-title">{s.t}</div>
                <div className="how-desc">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE PREVIEW ── */}
      <section className="prev-sec">
        <div className="prev-wrap">
          <div className="prev-sticky">
            <div className="eyebrow">Live preview</div>
            <h2 className="s2" style={{marginBottom:18}}>See it<br/><em>in action</em></h2>
            <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:'.88rem',color:'var(--ink-soft)',lineHeight:1.78,marginBottom:28,maxWidth:320}}>
              Click through the tabs. This is exactly what your dashboard looks like the moment you log in.
            </p>
            {['No setup required — start logging instantly','All data stored in your account','Works on any screen, any browser'].map((t,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:9,marginBottom:11,fontFamily:"'Montserrat',sans-serif",fontSize:'.83rem',color:'var(--ink-soft)'}}>
                <div style={{width:17,height:17,borderRadius:'50%',background:'#E1F5EE',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Chk/></div>
                {t}
              </div>
            ))}
          </div>
          <div>
            <div className="prev-tabs">
              {[{id:'split',l:'Bill split'},{id:'goals',l:'Goals'},{id:'budget',l:'Budget'}].map(t => (
                <button key={t.id} className={`prev-tab${tab===t.id?' on':''}`} onClick={() => setTab(t.id)}>{t.l}</button>
              ))}
            </div>
            <PreviewPanel tab={tab}/>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="plan-sec" id="pricing">
        <div className="plan-ring" style={{width:500,height:500}}/>
        <div className="plan-ring" style={{width:920,height:920,animationDuration:'65s',animationDirection:'reverse'}}/>
        <div className="plan-inner">
          <div className="plan-head">
            <div className="eyebrow ctr lt">Pricing</div>
            <h2 className="s2 lt ctr">Simple plans,<br/><em>honest pricing</em></h2>
            <p className="plan-sub">Start free. Upgrade when you need more.</p>
            <div className="plan-soon">More tiers launching soon</div>
          </div>
          <div className="plan-grid">
            {plans.map((p,i) => (
              <div key={i} className={`plan-card${p.featured?' feat':''}`}>
                {p.badge && <div className="plan-badge">{p.badge}</div>}
                <div className="plan-name">{p.name}</div>
                <div className="plan-tag">{p.tagline}</div>
                <div className="plan-price">
                  {p.price==='0'?'Free':p.price==='—'?'—':`₹${p.price}`}
                  {p.period && <span>{p.period}</span>}
                </div>
                <div className="plan-div"/>
                {p.feats.map((ft,j) => (
                  <div key={j} className="plan-feat">
                    <div className="plan-chk"><ChkW/></div>{ft}
                  </div>
                ))}
                <button className={`plan-btn ${p.featured?'solid':'ghost'}`} onClick={() => !p.soon && navigate('/signup')}>
                  {p.soon ? 'Notify me' : p.price==='0' ? 'Get started free' : 'Start Student plan'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="cta-sec">
        <div className="cta-ring" style={{width:280,height:280}}/>
        <div className="cta-ring" style={{width:560,height:560,animationDuration:'52s',animationDirection:'reverse'}}/>
        <h2 className="cta-h2 afu">Take control of<br/>your money <em>today</em></h2>
        <p className="cta-sub">No bank integration. No setup fee. Just a smarter way to manage your money through college and beyond.</p>
        <div className="cta-btns">
          <button className="cta-btn-p" onClick={() => navigate('/signup')}>Create free account</button>
          <button className="cta-btn-s" onClick={() => navigate('/login')}>Sign in</button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="foot-copy">© 2026 MoneyWise</div>
      </footer>

      </ClickSpark>
    </div>
  );
};

export default LandingPage;