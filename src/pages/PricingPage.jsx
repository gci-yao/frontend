import React from 'react'

const plans = [
  { price: '200F', hours: 24 , day:' (1 jr) '},
  { price: '400F', hours: 48 , day:' (2 jrs) '},
  { price: '500F', hours: 72 , day:' (3 jrs) '},
  { price: '1000F', hours: 168, day:' (1 Sem )' },
  { price: '3000F', hours: 720 , day:' (1 Ms) '},
  { price: '5000F', hours: 1140 , day:' (2 Ms)'},
]

export default function PricingPage() {
  return (
    <div>
      <h2 className="text-2xl">Pricing Plans</h2>
      <div className="mt-4 grid grid-cols-4 gap-4">
        {plans.map((p) => (
          <div key={p.price} className="bg-[rgba(6,10,14,0.6)] p-4 rounded-lg-soft">
            <div className="text-slate-400">{p.price}</div>
            <div className="text-2xl font-semibold">{p.hours}h {p.day}</div>
            <button className="mt-3 bg-black text-black px-3 py-1 rounded-md">👉</button>
          </div>
        ))}
      </div>
    </div>
  )
}
