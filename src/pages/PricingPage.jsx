import React from 'react'

const plans = [
  { price: 200, hours: 24, day: ' (1 day) ' },
  { price: 400, hours: 48, day: ' (2 days) ' },
  { price: 500, hours: 72, day: ' (3 days) ' },
  { price: 1000, hours: 168, day: ' (1 week )' },
  { price: 3000, hours: 720, day: ' (1 month) ' },
  { price: 5000, hours: 1140, day: ' (2 Months)' },
]

function getBillIcon(price) {
  switch (price) {
    case 200:
      return '../src/components/pictures/2001.png'
    case 400:
      return '../src/components/pictures/400.png'
    case 500:
      return '../src/components/pictures/500.jpg'
    case 1000:
      return '../src/components/pictures/1000.jpg'
    case 3000:
      return '../src/components/pictures/3000.jpg'
    case 5000:
      return '../src/components/pictures/5000.jpg'
    default:
      return ''
  }
}

export default function PricingPage() {
  return (
    <div className="p-6 min-h-screen">
      <h2 className="text-3xl font-bold text-white text-center mb-6">
        Pricing Plans
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.price}
            className="group p-6 rounded-xl flex flex-col items-center text-center shadow-lg hover:shadow-2xl transition-shadow duration-300 "
          >
            {/* Image */}
            <img
              src={getBillIcon(p.price)}
              alt={`${p.price} F CFA`}
              className="rounded-sm cursor-pointer object-contain w-24 h-24 mb-3 transition-transform duration-300 ease-in-out group-hover:w-full group-hover:h-full group-hover:rounded-none"
            />

            {/* Montant */}
            <div className="text-xl font-bold text-white">{p.price} F</div>

            {/* Durée */}
            <div className="text-slate-400 mt-1 text-sm">
              {p.hours}h{p.day}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
