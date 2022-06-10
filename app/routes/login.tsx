import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node'
import { useActionData } from '@remix-run/react'
import { useEffect, useRef, useState } from 'react'
import { FormField } from '~/components/formField'
import { Layout } from '~/components/layout'
import { getUser, login, register } from '~/utils/auth.server'
import { validateEmail, validateName, validatePassword } from '~/utils/validators.server'

enum Action {
  login,
  register
}

// #region Server
export const loader: LoaderFunction = async ({ request }) => {
  // If there's already a user in the session, redirect to the home page
  return (await getUser(request)) ? redirect('/') : null
}

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  let formAction = form.get('_action') as string | Action;
  const email = form.get('email');
  const password = form.get('password');
  let firstName = form.get('firstName');
  let lastName = form.get('lastName');

  if (typeof formAction === 'string') {
    formAction = parseInt(formAction, 10) as Action;
  }

  if ((formAction !== Action.login && formAction !== Action.register) || typeof email !== 'string' || typeof password !== 'string') {
    return json({ error: `Invalid Form Data`, form: formAction }, { status: 400 });
  }

  if (formAction === Action.register && (typeof firstName !== 'string' || typeof lastName !== 'string')) {
    return json({ error: `Invalid Form Data`, form: formAction }, { status: 400 });
  }

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
    ...(formAction === Action.register
      ? {
        firstName: validateName((firstName as string) || ''),
        lastName: validateName((lastName as string) || ''),
      }
      : {}),
  }

  if (Object.values(errors).some(Boolean))
    return json({ errors, fields: { email, password, firstName, lastName }, form: formAction }, { status: 400 })

  switch (formAction) {
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
  const actionData = useActionData()
  const firstLoad = useRef(true)
  const [errors, setErrors] = useState(actionData?.errors || {})
  const [formError, setFormError] = useState(actionData?.error || '')

  const [action, setAction] = useState(Action.login);
  const [formData, setFormData] = useState({
    email: actionData?.fields?.email || '',
    password: actionData?.fields?.password || '',
    firstName: actionData?.fields?.lastName || '',
    lastName: actionData?.fields?.firstName || '',
  })


  useEffect(() => {
    if (!firstLoad.current) {
      const newState = {
        email: '',
        password: '',
        firstName: '',
        lastName: '',
      }
      setErrors(newState)
      setFormError('')
      setFormData(newState)
    }
  }, [action])

  useEffect(() => {
    if (!firstLoad.current) {
      setFormError('')
    }
  }, [formData])

  useEffect(() => { firstLoad.current = false }, [])

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
          <div className="text-xs font-semibold text-center tracking-wide text-red-500 w-full">{formError}</div>
          {action === Action.register && (
            <>
              <FormField
                htmlFor="firstName"
                label="First Name"
                onChange={e => handleInputChange(e, 'firstName')}
                value={formData.firstName}
                error={errors?.firstName}
              />
              <FormField
                htmlFor="lastName"
                label="Last Name"
                onChange={e => handleInputChange(e, 'lastName')}
                value={formData.lastName}
                error={errors?.lastName}
              />
            </>
          )}
          <FormField
            htmlFor="email"
            label="Email"
            value={formData.email}
            onChange={e => handleInputChange(e, 'email')}
            error={errors?.email}
          />
          <FormField
            htmlFor="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={e => handleInputChange(e, 'password')}
            error={errors?.password}
          />
          <div className="w-full text-center">
            <button
              type="submit"
              name="_action"
              className="rounded-xl mt-2 bg-yellow-300 px-3 py-2 text-blue-600 font-semibold transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
              value={action}>
              {action === Action.login ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default Login;