import { json, redirect } from "react-router-dom";
import AuthForm from '../components/AuthForm';

function AuthenticationPage() {
  return <AuthForm />;
}

export default AuthenticationPage;

export const action = async ({ request, params }) => {
  const searchParams = new URL(request.url).searchParams
  const mode = searchParams.get('mode')

  if (mode !== 'signup' && mode !== 'login') {
    throw json({ message: 'unsupported mode' }, { status: 422 })
  }

  const data = await request.formData();
  const authData = {
    email: data.get('email'),
    password: data.get('password')
  }
  const res = await fetch('http://localhost:8080/' + mode, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(authData)
  })

  if (res.status === 422 || res.status === 401) {
    return res;
  }

  if (!res.ok) {
    throw json({ message: "Unable to authenticate" }, { status: 500 })
  }

  const resData = await res.json();
  const token = resData.token;

  localStorage.setItem('token', token);

  const experation = new Date();
  experation.setHours(experation.getHours() + 1)
  localStorage.setItem('expiration', experation.toISOString())

  return redirect('/')
}