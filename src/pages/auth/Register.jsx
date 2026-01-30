import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import { 
  CheckCircleIcon, 
} from '@heroicons/react/24/solid';

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    email: '',
    password: '',
    city: '',
    country: 'Ivory Coast',
    commissionRate: 10
  })

  const [errors, setErrors] = useState({})
  const [valid, setValid] = useState({})
  const [checking, setChecking] = useState({})
  const [loading, setLoading] = useState(false)

  const handle = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value })
    setErrors({ ...errors, [k]: '' })
  }

  // ---------------- VALIDATIONS ----------------

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const validatePhone = (phone) =>
    /^(01|05|07)\d{8}$/.test(phone)

  const validatePassword = (password) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{10,}$/.test(password)

  // ---------------- CHECK LIVE ----------------

  const checkLive = async (field) => {
    const value = form[field]
    if (!value) return

    // local validations
    if (field === 'email' && !validateEmail(value)) {
      return setErrors(e => ({ ...e, email: 'Invalid email format' }))
    }

    if (field === 'phone' && !validatePhone(value)) {
      return setErrors(e => ({
        ...e,
        phone: 'Phone must be 10 digits and start with 01, 05 or 07'
      }))
    }

    if (field === 'password' && !validatePassword(value)) {
      return setErrors(e => ({
        ...e,
        password:
          'your password must be at least 10 alphanumeric characters with at least one special character'
      }))
    }

    
   

    setChecking(c => ({ ...c, [field]: true }))

    try {
      const res = await api.checkExists({ field, value })

      if (res.exists) {
        setErrors(e => ({ ...e, [field]: `${field} already exists` }))
        setValid(v => ({ ...v, [field]: false }))
      } else {
        setErrors(e => ({ ...e, [field]: '' }))
        setValid(v => ({ ...v, [field]: true }))
      }
    } catch {
      setErrors(e => ({ ...e, [field]: 'Verification failed' }))
      setValid(v => ({ ...v, [field]: false }))
    } finally {
      setChecking(c => ({ ...c, [field]: false }))
    }
  }

  
  // ---------------- SUBMIT ----------------
  
  const submit = async (e) => {
    e.preventDefault()

    if (Object.values(errors).some(Boolean)) return

    if (!form.city) {
      setErrors(e => ({ ...e, city: "Please, choose your commune !" }));
      return;
    }
    setLoading(true)
    try {
      await register(form)
      navigate('/owner')
    } catch {
      alert('Registration failed')
    } finally {
      setLoading(false)
    }
    
  }

  const FieldStatus = ({ name }) => (
    <>
      {checking[name] && <span className="absolute right-3 top-9 text-slate-400">…</span>}
      {valid[name] && <span className="absolute right-3 top-9 text-green-500"><CheckCircleIcon className="w-5 h-5" /></span>}
    </>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-lg bg-[rgba(6,10,14,0.6)] p-6 rounded-lg-soft neon"
      >
        <h2 className="text-2xl font-semibold mb-2">Register Business</h2>

        <div className="grid grid-cols-2 gap-3">

          {/* BUSINESS */}
          <div className="relative">
            <label className="text-sm">Business name <span className='text-red-600'>*</span></label>
            <input
              value={form.businessName}
              onChange={handle('businessName')}
              onBlur={() => checkLive('businessName')}
              className="mt-1 w-full p-2 rounded-md bg-slate-800"
            />
            <FieldStatus name="businessName" />
            {errors.businessName && <p className="text-red-500 text-xs">{errors.businessName}</p>}
          </div>

          {/* OWNER */}
          <div className="relative">
            <label className="text-sm">Owner FirstName <span className='text-red-600'>*</span></label>
            <input
              value={form.ownerName}
              onChange={handle('ownerName')}
              onBlur={() => checkLive('ownerName')}
              className="mt-1 w-full p-2 rounded-md bg-slate-800"
            />
            <FieldStatus name="ownerName" />
            {errors.ownerName && <p className="text-red-500 text-xs">{errors.ownerName}</p>}
          </div>

          {/* PHONE */}
          <div className="relative">
            <label className="text-sm">Phone <span className='text-red-600'>*</span></label>
            <input
              maxLength={10}
              value={form.phone}
              onChange={handle('phone')}
              onBlur={() => checkLive('phone')}
              className="mt-1 w-full p-2 rounded-md bg-slate-800"
            />
            <FieldStatus name="phone" />
            {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
          </div>

          {/* EMAIL */}
          <div className="relative">
            <label className="text-sm">Email <span className='text-red-600'>*</span></label>
            <input
              value={form.email}
              onChange={handle('email')}
              onBlur={() => checkLive('email')}
              className="mt-1 w-full p-2 rounded-md bg-slate-800"
            />
            <FieldStatus name="email" />
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>

          {/* PASSWORD */}
            <div className="relative">
              <label className="text-sm">Password <span className='text-red-600'>*</span></label>
              <input
                type="password"
                value={form.password}
                onChange={handle('password')}
                onBlur={() => checkLive('password')}
                className="mt-1 w-full p-2 rounded-md bg-slate-800"
              />
              {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
            </div>
            {/* COMMISSION */}
            <div className='relative'>
              <label className="text-sm">Commission rate %</label>
              <input
                type="number"
                value={form.commissionRate}
                disabled
                className="mt-1 w-full p-2 rounded-md bg-slate-800 text-slate-400 cursor-not-allowed"
              />
            </div>


          {/* CITY */}
          <div>
              <label className="text-sm">City</label>
              <select
                value={form.city}
                onChange={handle('city')}
                className="mt-1 w-full p-2 rounded-md bg-slate-800 text-white"
              >
                <option value="">Select a city</option>

                {/* Abidjan */}
                <option value="Abobo">Abobo</option>
                <option value="Adjamé">Adjamé</option>
                <option value="Attécoubé">Attécoubé</option>
                <option value="Bingerville">Bingerville</option>
                <option value="Cocody">Cocody</option>
                <option value="Koumassi">Koumassi</option>
                <option value="Marcory">Marcory</option>
                <option value="Plateau">Plateau</option>
                <option value="Port-Bouët">Port-Bouët</option>
                <option value="Treichville">Treichville</option>
                <option value="Yopougon">Yopougon</option>
                <option value="Anyama">Anyama</option>
                <option value="Songon">Songon</option>

                {/* Grandes villes */}
                <option value="Bouaké">Bouaké</option>
                <option value="Yamoussoukro">Yamoussoukro</option>
                <option value="Daloa">Daloa</option>
                <option value="San-Pédro">San-Pédro</option>
                <option value="Korhogo">Korhogo</option>
                <option value="Man">Man</option>
                <option value="Gagnoa">Gagnoa</option>
                <option value="Abengourou">Abengourou</option>
                <option value="Bondoukou">Bondoukou</option>
                <option value="Séguéla">Séguéla</option>
                <option value="Odienné">Odienné</option>
                <option value="Divo">Divo</option>
                <option value="Sassandra">Sassandra</option>
                <option value="Grand-Bassam">Grand-Bassam</option>
                <option value="Aboisso">Aboisso</option>
                <option value="Agboville">Agboville</option>
                <option value="Dabou">Dabou</option>
                <option value="Toumodi">Toumodi</option>
                <option value="Ferkessédougou">Ferkessédougou</option>
                <option value="Boundiali">Boundiali</option>
                <option value="Bouna">Bouna</option>
                <option value="Tingréla">Tingréla</option>
                <option value="Issia">Issia</option>
                <option value="Bangolo">Bangolo</option>
                <option value="Guiglo">Guiglo</option>
                <option value="Vavoua">Vavoua</option>
                <option value="Soubré">Soubré</option>
                <option value="Lakota">Lakota</option>
                <option value="Zuénoula">Zuénoula</option>
              </select>
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city}</p>
            )}
            </div>


          {/* COUNTRY */}
          <div>
            <label className="text-sm">Country</label>
            <select
              disabled
              value="Ivory Coast"
              className="mt-1 w-full p-2 rounded-md bg-slate-800 text-white cursor-not-allowed"
            >
              <option>Ivory Coast</option>
            </select>
          </div>

        </div>

        <div className="mt-4 flex justify-around">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-black px-4 py-2 rounded-md"
          >
            Register
          </button>
          <Link to="/login" className="text-sm text-slate-400">Login ?</Link>
        </div>
      </form>
    </div>
  )
}
