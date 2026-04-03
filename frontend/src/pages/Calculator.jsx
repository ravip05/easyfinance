/**
 * pages/Calculator.jsx
 *
 * Full React port of #page-calculator from LoanCRM_v9.html.
 * All three calculator tabs extracted with vanilla JS math converted to
 * controlled React state + live useMemo computations.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  Tab 1: EMI Calculator   (calcEMI + renderBankComparison)           │
 * │  Tab 2: Eligibility Check (calcEligibility)                         │
 * │  Tab 3: FOIR / DSR        (calcFOIR)                               │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Design decisions:
 *   • useMemo for derived values — recalculates whenever any slider/input
 *     changes with zero debounce lag, matching the prototype's oninput= behaviour.
 *   • No useEffect for calculations — state → derived value is a pure function.
 *   • BANK_POLICIES data embedded directly (mirrors the const in the prototype).
 *   • All original CSS class names preserved (.calc-result, .calc-row, etc.)
 *   • Range sliders display live value labels above them (same as prototype).
 *   • Bank comparison table recalculates instantly when sliders change.
 */

import { useMemo, useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Bank comparison data (const BANK_POLICIES from prototype, rate-only subset)
// ─────────────────────────────────────────────────────────────────────────────
const BANKS = [
  { name: 'PNB Housing', rate: 8.45,  color: '#059669' },
  { name: 'SBI',         rate: 8.50,  color: '#2563eb' },
  { name: 'Axis Bank',   rate: 8.65,  color: '#7c3aed' },
  { name: 'HDFC Bank',   rate: 8.75,  color: '#dc2626' },
  { name: 'ICICI Bank',  rate: 9.00,  color: '#ea580c' },
  { name: 'Kotak',       rate: 9.25,  color: '#0891b2' },
]

const LOAN_TYPES = ['Home Loan', 'Business Loan', 'Personal Loan', 'Car Loan', 'LAP']
const EMP_TYPES  = ['Salaried', 'Self-Employed', 'Business']

// ─────────────────────────────────────────────────────────────────────────────
// Pure math helpers — direct ports of prototype JS functions
// ─────────────────────────────────────────────────────────────────────────────

/** Standard EMI formula */
function calcEMIValue(principal, annualRate, tenureYears) {
  const p = principal
  const r = annualRate / 12 / 100
  const n = tenureYears * 12
  if (r === 0) return p / n
  return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

/** Format a rupee amount as ₹25,00,000 */
function fmtINR(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN')
}

/** Format a rupee amount as ₹45L / ₹2.5Cr */
function fmtCompact(n) {
  if (n >= 10_000_000) return '₹' + (n / 10_000_000).toFixed(1) + 'Cr'
  if (n >= 100_000)    return '₹' + (n / 100_000).toFixed(1) + 'L'
  if (n >= 1_000)      return '₹' + (n / 1_000).toFixed(0) + 'K'
  return '₹' + n
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI atoms
// ─────────────────────────────────────────────────────────────────────────────

/** Labelled slider row — matches the three sliders in the EMI card */
function SliderRow({ label, id, min, max, step, value, onChange, displayValue }) {
  return (
    <div className="form-group">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="form-label">{label}</div>
        <strong id={`${id}-disp`} style={{ color: 'var(--accent)', fontSize: 13 }}>
          {displayValue}
        </strong>
      </div>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

/** Single result row inside .calc-result */
function CalcRow({ label, value, accent }) {
  return (
    <div className="calc-row">
      <span className="calc-lbl">{label}</span>
      <span className="calc-val" style={accent ? { color: 'var(--accent)', fontSize: 20 } : undefined}>
        {value}
      </span>
    </div>
  )
}

/** Progress bar used in Eligibility */
function ProgressBar({ pct, color }) {
  return (
    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: color }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 1 — EMI Calculator
// ─────────────────────────────────────────────────────────────────────────────
function EmiTab() {
  // Slider state — mirrors the three range inputs in the prototype
  const [principal,   setPrincipal]   = useState(2_500_000)   // ₹25L
  const [annualRate,  setAnnualRate]  = useState(8.5)          // 8.50% p.a.
  const [tenureYears, setTenureYears] = useState(20)           // 20 years
  const [loanType,    setLoanType]    = useState('Home Loan')

  // ── Derived calculations (useMemo = calcEMI() equivalent) ─────────────────
  const { emi, totalPayment, totalInterest } = useMemo(() => {
    const e   = calcEMIValue(principal, annualRate, tenureYears)
    const tot = e * tenureYears * 12
    return {
      emi:           e,
      totalPayment:  tot,
      totalInterest: tot - principal,
    }
  }, [principal, annualRate, tenureYears])

  // ── Bank comparison (renderBankComparison() port) ──────────────────────────
  const bankRows = useMemo(() => {
    const n = tenureYears * 12
    return BANKS.map((b) => ({
      ...b,
      emi: calcEMIValue(principal, b.rate, tenureYears),
    })).sort((a, b) => a.emi - b.emi)
  }, [principal, tenureYears])

  // Highlight — cheapest bank row
  const minEmi = bankRows[0]?.emi ?? 0

  return (
    <div className="grid-2">
      {/* ── Left: inputs + result ── */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 18 }}>EMI Calculator</div>

        <SliderRow
          label="Loan Amount"
          id="la"
          min={100_000} max={10_000_000} step={50_000}
          value={principal}
          onChange={setPrincipal}
          displayValue={fmtINR(principal)}
        />
        <SliderRow
          label="Interest Rate (% p.a.)"
          id="ir"
          min={5} max={24} step={0.25}
          value={annualRate}
          onChange={setAnnualRate}
          displayValue={`${annualRate.toFixed(2)}%`}
        />
        <SliderRow
          label="Tenure"
          id="tn"
          min={1} max={30} step={1}
          value={tenureYears}
          onChange={setTenureYears}
          displayValue={`${tenureYears} year${tenureYears > 1 ? 's' : ''}`}
        />

        <div className="form-group">
          <div className="form-label">Loan Type</div>
          <select
            className="form-select"
            value={loanType}
            onChange={(e) => setLoanType(e.target.value)}
          >
            {LOAN_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Result panel */}
        <div className="calc-result">
          <CalcRow label="Principal"      value={fmtINR(principal)} />
          <CalcRow label="Total Interest" value={fmtINR(totalInterest)} />
          <CalcRow label="Total Payment"  value={fmtINR(totalPayment)} />
          <CalcRow label="Monthly EMI"    value={fmtINR(emi)} accent />
        </div>

        {/* Visual breakdown donut */}
        {principal > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
              <svg width="100" height="100" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="48" fill="none" stroke="#e2e8f0" strokeWidth="16" />
                <circle
                  cx="60" cy="60" r="48" fill="none"
                  stroke="var(--accent)" strokeWidth="16"
                  strokeDasharray={`${(principal / (totalPayment || 1)) * (2 * Math.PI * 48)} ${2 * Math.PI * 48}`}
                />
                <circle
                  cx="60" cy="60" r="48" fill="none"
                  stroke="var(--gold)" strokeWidth="16"
                  strokeDasharray={`${(totalInterest / (totalPayment || 1)) * (2 * Math.PI * 48)} ${2 * Math.PI * 48}`}
                  strokeDashoffset={`${-(principal / (totalPayment || 1)) * (2 * Math.PI * 48)}`}
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 800 }}>
                  {totalPayment > 0 ? Math.round((principal / totalPayment) * 100) : 0}%
                </span>
                <span style={{ fontSize: 9, color: 'var(--text3)' }}>Principal</span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 80 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent)', display: 'inline-block' }} />
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>Principal: {fmtINR(principal)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--gold)', display: 'inline-block' }} />
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>Interest: {fmtINR(totalInterest)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Right: bank comparison ── */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>🏦 Bank Rate Comparison</div>

        <div style={{ marginBottom: 12, fontSize: 12, color: 'var(--text3)' }}>
          For {fmtCompact(principal)} · {tenureYears}-yr tenure
        </div>

        <div id="bank-compare">
          {bankRows.map((b) => {
            const isBest = b.emi === minEmi
            return (
              <div
                className="bank-row"
                key={b.name}
                style={isBest ? { background: 'var(--accent-light)', borderRadius: 8, padding: '9px 8px', margin: '2px -8px' } : undefined}
              >
                <div
                  className="bank-tag"
                  style={{ color: b.color, border: `1px solid ${b.color}33`, fontSize: 10, width: 60 }}
                >
                  {b.name.split(' ')[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text2)' }}>
                    {b.rate.toFixed(2)}% p.a.
                  </div>
                </div>
                <div className="bank-emi" style={{ color: b.color }}>
                  {fmtINR(b.emi)}
                </div>
                {isBest && (
                  <span
                    className="badge badge-active"
                    style={{ fontSize: 9, marginLeft: 6 }}
                  >
                    Best
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Savings vs most expensive */}
        {bankRows.length >= 2 && (
          <div style={{
            marginTop: 16, padding: '10px 14px',
            background: 'var(--green-light)',
            border: '1px solid #a7f3d0',
            borderRadius: 10, fontSize: 12,
          }}>
            <strong style={{ color: 'var(--green)' }}>
              Save {fmtINR((bankRows[bankRows.length - 1].emi - bankRows[0].emi) * tenureYears * 12)} total
            </strong>
            <span style={{ color: 'var(--text2)', marginLeft: 4 }}>
              by choosing {bankRows[0].name.split(' ')[0]} over {bankRows[bankRows.length - 1].name.split(' ')[0]}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 2 — Eligibility Check
// ─────────────────────────────────────────────────────────────────────────────
function EligibilityTab() {
  const [income,      setIncome]      = useState(100_000)
  const [existing,    setExisting]    = useState(10_000)
  const [annualRate,  setAnnualRate]  = useState(8.5)
  const [tenureYears, setTenureYears] = useState(20)
  const [age,         setAge]         = useState(35)
  const [cibil,       setCibil]       = useState(750)

  // ── Derived result (calcEligibility() port) ──────────────────────────────
  const result = useMemo(() => {
    // 50% FOIR baseline rule
    const maxEmiCapacity = (income * 0.5) - existing
    
    let eligible = true
    let reason = ''
    
    // Qualitative guardrails
    if (age < 18) { eligible = false; reason = 'Minimum age requirement is 18 years.' }
    else if (age > 65) { eligible = false; reason = 'Maximum age limit is 65 years.' }
    else if (cibil < 700) { eligible = false; reason = 'Minimum CIBIL score of 700 required.' }
    else if (income < 25000) { eligible = false; reason = 'Minimum monthly income of ₹25,000 required.' }
    else if (maxEmiCapacity <= 0) { eligible = false; reason = 'Existing EMIs exceed maximum allowed obligation (50% FOIR).' }

    // Calc loan principal based on EMI capacity
    const r = annualRate / 12 / 100
    const n = tenureYears * 12
    let maxLoan = 0
    if (maxEmiCapacity > 0 && r > 0) {
      maxLoan = maxEmiCapacity * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n))
    }

    if (eligible && maxLoan < 100000) {
      eligible = false
      reason = 'Calculated eligible amount is below minimum threshold (₹1 Lakh).'
    }

    const meter = Math.min(100, Math.max(0, ((cibil || 500) - 300) / 600 * 100))
    const mColor = meter > 70 ? 'var(--green)' : meter > 50 ? 'var(--gold)' : 'var(--red)'
    
    const foirPct = income > 0 ? ((existing / income) * 100).toFixed(0) : 0
    const availPct = income > 0 && maxEmiCapacity > 0 ? ((maxEmiCapacity / income) * 100).toFixed(0) : 0

    return { eligible, maxLoan, meter, mColor, reason, foirPct, availPct, maxEmiCapacity }
  }, [income, existing, annualRate, tenureYears, age, cibil])

  return (
    <div className="grid-2">
      {/* ── Left: inputs ── */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>Loan Eligibility Calculator</div>
        
        <SliderRow
          label="Monthly Income"
          id="eli-inc"
          min={25000} max={1000000} step={5000}
          value={income}
          onChange={setIncome}
          displayValue={fmtINR(income)}
        />
        <SliderRow
          label="Existing EMIs"
          id="eli-ext"
          min={0} max={500000} step={2000}
          value={existing}
          onChange={setExisting}
          displayValue={fmtINR(existing)}
        />
        <SliderRow
          label="Interest Rate (% p.a.)"
          id="eli-rate"
          min={5} max={18} step={0.25}
          value={annualRate}
          onChange={setAnnualRate}
          displayValue={`${annualRate.toFixed(2)}%`}
        />
        <SliderRow
          label="Tenure"
          id="eli-ten"
          min={1} max={30} step={1}
          value={tenureYears}
          onChange={setTenureYears}
          displayValue={`${tenureYears} year${tenureYears > 1 ? 's' : ''}`}
        />
        
        <div style={{display: 'flex', gap: 16, marginTop: 12}}>
          <div style={{flex: 1}}>
            <div className="form-group">
              <div className="form-label" style={{display: 'flex', justifyContent: 'space-between'}}>
                Age 
                <strong style={{color: 'var(--accent)'}}>{age}</strong>
              </div>
              <input
                type="range"
                min={18} max={80} step={1}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
              />
            </div>
          </div>
          <div style={{flex: 1}}>
            <div className="form-group">
              <div className="form-label" style={{display: 'flex', justifyContent: 'space-between'}}>
                CIBIL Score
                <strong style={{
                    color: cibil >= 750 ? 'var(--green)'
                         : cibil >= 700 ? 'var(--gold)'
                         : 'var(--red)',
                }}>{cibil}</strong>
              </div>
              <input
                type="range"
                min={300} max={900} step={10}
                value={cibil}
                onChange={(e) => setCibil(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: result panel ── */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>Eligibility Result</div>
        <div id="eli-result">
          {/* Confidence meter */}
          <div style={{ marginBottom: 14 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 12, marginBottom: 5,
            }}>
              <span style={{ color: 'var(--text2)' }}>Credit Profile Match</span>
              <strong>{result.meter.toFixed(0)}%</strong>
            </div>
            <ProgressBar pct={result.meter} color={result.mColor} />
          </div>

          {result.eligible ? (
            <>
              {/* Eligible — green box */}
              <div style={{
                background: 'var(--green-light)',
                border: '1px solid #a7f3d0',
                borderRadius: 10, padding: 16,
                textAlign: 'center', marginBottom: 12,
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)' }}>
                  ✅ ELIGIBLE FOR LOAN
                </div>
                <div style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: 32, fontWeight: 800,
                  color: 'var(--green)', margin: '6px 0',
                }}>
                  {fmtCompact(result.maxLoan)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                  Maximum Loan Amount
                </div>
              </div>
              
              <div className="calc-result" style={{marginBottom: 12}}>
                <CalcRow label="Repayment Capacity (Max EMI)" value={fmtINR(result.maxEmiCapacity)} accent />
              </div>
              
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>
                📊 FOIR Used: {result.foirPct}% · Available Capacity: {result.availPct}%
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                🏦 Recommended: SBI, HDFC, ICICI
              </div>
            </>
          ) : (
            /* Not eligible — red box */
            <div style={{
              background: 'var(--red-light)',
              border: '1px solid #fecaca',
              borderRadius: 10, padding: 16,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--red)' }}>
                ❌ NOT CURRENTLY ELIGIBLE
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6 }}>
                {result.reason}
              </div>
              {result.maxEmiCapacity <= 0 && income >= 25000 && (
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 10 }}>
                  Tip: Your existing EMIs exceed 50% of your income. Reduce obligations to qualify.
                </div>
              )}
            </div>
          )}

          {/* CIBIL score band */}
          <div style={{
            marginTop: 12, padding: '10px 14px',
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 10, fontSize: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text2)' }}>CIBIL Profile</span>
              <strong style={{
                color: cibil >= 750 ? 'var(--green)'
                     : cibil >= 700 ? 'var(--gold)'
                     : 'var(--red)',
              }}>
                {cibil} — {
                  cibil >= 750 ? 'Excellent'
                  : cibil >= 700 ? 'Good'
                  : cibil >= 650 ? 'Fair'
                  : 'Poor'
                }
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 3 — FOIR / DSR Calculator
// ─────────────────────────────────────────────────────────────────────────────
function FoirTab() {
  const [income,   setIncome]   = useState('')
  const [proposed, setProposed] = useState('')
  const [existing, setExisting] = useState('')

  // ── Derived FOIR (calcFOIR() port) ────────────────────────────────────────
  const result = useMemo(() => {
    const inc  = parseFloat(income)   || 0
    const prop = parseFloat(proposed) || 0
    const ext  = parseFloat(existing) || 0
    if (!inc) return null

    const total = prop + ext
    const foir  = (total / inc) * 100

    const status =
      foir <= 40 ? { label: 'Excellent', color: 'var(--green)', bg: 'var(--green-light)', border: '#a7f3d0', icon: '✅' } :
      foir <= 50 ? { label: 'Acceptable', color: 'var(--gold)',  bg: 'var(--gold-light)',  border: '#fde68a', icon: '⚠️' } :
                   { label: 'High Risk',   color: 'var(--red)',   bg: 'var(--red-light)',   border: '#fecaca', icon: '❌' }

    return { foir, total, inc, prop, ext, status }
  }, [income, proposed, existing])

  // Visual gauge percentage (capped 0–100 for display, red zone > 50)
  const gaugePct = result ? Math.min(100, result.foir * 2) : 0

  return (
    <div className="grid-2">
      {/* ── Left: inputs ── */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>FOIR / DSR Calculator</div>

        <div className="form-group">
          <div className="form-label">Gross Monthly Income (₹)</div>
          <input
            className="form-input"
            type="number"
            placeholder="80000"
            id="foir-income"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
          />
        </div>

        <div className="form-group">
          <div className="form-label">Proposed EMI (₹)</div>
          <input
            className="form-input"
            type="number"
            placeholder="20000"
            id="foir-proposed"
            value={proposed}
            onChange={(e) => setProposed(e.target.value)}
          />
        </div>

        <div className="form-group">
          <div className="form-label">Existing EMIs (₹)</div>
          <input
            className="form-input"
            type="number"
            placeholder="5000"
            id="foir-existing"
            value={existing}
            onChange={(e) => setExisting(e.target.value)}
          />
        </div>

        {/* Quick explainer */}
        <div style={{
          marginTop: 8, padding: '10px 14px',
          background: 'var(--accent-light)',
          border: '1px solid #bfdbfe',
          borderRadius: 10, fontSize: 12,
          color: 'var(--text2)',
        }}>
          <strong style={{ color: 'var(--accent)' }}>FOIR</strong> (Fixed Obligation to Income Ratio)
          = Total EMIs ÷ Gross Income × 100.
          Most banks approve loans when FOIR ≤ 50%.
        </div>
      </div>

      {/* ── Right: result ── */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>FOIR Analysis</div>
        <div id="foir-result">
          {!result ? (
            <div className="empty">
              <div className="empty-icon">📊</div>
              <div className="empty-text">Fill in income details for FOIR analysis</div>
            </div>
          ) : (
            <>
              {/* Big percentage */}
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: 52, fontWeight: 800,
                  color: result.status.color,
                  lineHeight: 1.1,
                }}>
                  {result.foir.toFixed(1)}%
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                  {result.status.icon} {result.status.label}
                </div>
              </div>

              {/* Visual progress bar */}
              <div style={{ marginBottom: 14 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 10, color: 'var(--text3)', marginBottom: 4,
                }}>
                  <span>0%</span>
                  <span style={{ color: 'var(--green)', fontWeight: 700 }}>40% Excellent</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 700 }}>50% Limit</span>
                  <span>100%</span>
                </div>
                <div style={{
                  height: 12, background: 'var(--bg2)',
                  borderRadius: 6, overflow: 'hidden', position: 'relative',
                }}>
                  {/* Zone colours */}
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: '80%',  // 40% of 50 = 80% of visual bar
                    background: 'linear-gradient(to right, #a7f3d0, #fde68a 70%, #fecaca)',
                    opacity: 0.4,
                  }} />
                  {/* Actual value needle */}
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: `${gaugePct}%`,
                    background: result.status.color,
                    borderRadius: 6,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>

              {/* Breakdown table */}
              <div style={{
                background: result.status.bg,
                border: `1px solid ${result.status.border}`,
                borderRadius: 10, padding: 14,
                marginBottom: 10,
              }}>
                {[
                  ['Monthly Income',   fmtINR(result.inc)],
                  ['Proposed EMI',     fmtINR(result.prop)],
                  ['Existing EMIs',    fmtINR(result.ext)],
                  ['Total Obligation', fmtINR(result.total)],
                ].map(([label, val], i, arr) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: i === arr.length - 1 ? 13 : 12,
                      fontWeight: i === arr.length - 1 ? 700 : 400,
                      padding: '5px 0',
                      borderTop: i > 0 ? `1px solid ${result.status.border}` : 'none',
                    }}
                  >
                    <span style={{ color: 'var(--text2)' }}>{label}</span>
                    <strong style={i === arr.length - 1 ? { color: result.status.color } : undefined}>
                      {val}
                    </strong>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                {result.foir > 50
                  ? '❌ Most banks will decline at this FOIR. Reduce existing EMIs or increase income.'
                  : result.foir > 40
                  ? '⚠️ Acceptable range. Some banks may require additional collateral.'
                  : '✅ Excellent FOIR. Strong approval chances across all major banks.'}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Root Calculator page — tab switcher
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'emi',         label: '💰 EMI Calculator'  },
  { key: 'eligibility', label: '🏦 Eligibility Check' },
  { key: 'foir',        label: '📊 FOIR / DSR'        },
]

export default function Calculator() {
  const [activeTab, setActiveTab] = useState('emi')

  return (
    <div id="page-calculator" className="page active">

      {/* Tab bar */}
      <div className="tabs">
        {TABS.map((t) => (
          <div
            key={t.key}
            className={`tab${activeTab === t.key ? ' active' : ''}`}
            onClick={() => setActiveTab(t.key)}
            role="tab"
            aria-selected={activeTab === t.key}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setActiveTab(t.key)}
          >
            {t.label}
          </div>
        ))}
      </div>

      {/* Tab content — mounted/unmounted so each tab resets independently */}
      {activeTab === 'emi'         && <EmiTab />}
      {activeTab === 'eligibility' && <EligibilityTab />}
      {activeTab === 'foir'        && <FoirTab />}

    </div>
  )
}
