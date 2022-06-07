import { ActionFunction, json } from '@remix-run/node'
import { useState } from 'react'
import { FormField } from '~/components/formField'
import { Layout } from '~/components/layout'
import { login, register } from '~/utils/auth.server'
import { validateEmail, validateName, validatePassword } from '~/utils/validators.server'

enum Action {
  login,
  register
}

// #region Server
export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const action = form.get('_action') as unknown as Action;
  const email = form.get('email');
  const password = form.get('password');
  let firstName = form.get('firstName');
  let lastName = form.get('lastName');

  if (typeof action !== typeof Action || typeof email !== 'string' || typeof password !== 'string') {
    return json({ error: `Invalid Form Data`, form: action }, { status: 400 });
  }

  if (action === Action.register && (typeof firstName !== 'string' || typeof lastName !== 'string')) {
    return json({ error: `Invalid Form Data`, form: action }, { status: 400 });
  }

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
    ...(action === Action.register
      ? {
        firstName: validateName((firstName as string) || ''),
        lastName: validateName((lastName as string) || ''),
      }
      : {}),
  }

  if (Object.values(errors).some(Boolean))
    return json({ errors, fields: { email, password, firstName, lastName }, form: action }, { status: 400 })

  switch (action) {
    case Action.login: {
      return await login({ email, password })
    }
    case Action.register: {
      firstName = firstName as string
      lastName = lastName as string
      return await register({ email, password, firstName, lastName })
    }
    default:
      return json({ error: `Invalid Form Data` }, { status: 400 });
  }
}
// #endregion

const Login = () => {
  const [action, setAction] = useState(Action.login);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  })

  // Updates the form data when an input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: keyof typeof formData) => {
    setFormData(form => ({ ...form, [field]: event.target.value }))
  }

  return (
    <Layout>
      <div className="h-full justify-center items-center flex flex-col gap-y-4">
        <button
          onClick={() => setAction((action) => action == Action.login ? Action.register : Action.login)}
          className="absolute top-8 right-8 rounded-xl bg-yellow-300 font-semibold text-blue-600 px-3 py-2 transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
        >
          {action === Action.login ? 'Sign Up' : 'Sign In'}
        </button>
        <h2 className="text-5xl font-extrabold text-yellow-300">Welcome to Kudos!</h2>
        <p className="font-semibold text-slate-300">{action === Action.login ? 'Log In To Give Some Praise!' : 'Sign Up To Get Started!'}</p>

        <form method="POST" className="rounded-2xl bg-gray-200 p-6 w-96">
          {action === Action.register && (
            <>
              <FormField
                htmlFor="firstName"
                label="First Name"
                onChange={e => handleInputChange(e, 'firstName')}
                value={formData.firstName}
              />
              <FormField
                htmlFor="lastName"
                label="Last Name"
                onChange={e => handleInputChange(e, 'lastName')}
                value={formData.lastName}
              />
            </>
          )}
          <FormField
            htmlFor="email"
            label="Email"
            value={formData.email}
            onChange={e => handleInputChange(e, 'email')}
          />
          <FormField
            htmlFor="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={e => handleInputChange(e, 'password')}
          />
          <div className="w-full text-center">
            <input
              type="submit"
              name="_action"
              className="rounded-xl mt-2 bg-yellow-300 px-3 py-2 text-blue-600 font-semibold transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
              value={action === Action.login ? "Sign In" : "Sign Up"}
            />
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default Login;