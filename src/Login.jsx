import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAtSign, FiLock } from 'react-icons/fi';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        console.log('login success');
        toast.success('Autentificarea a avut succes!', {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 1000,
        });
        setTimeout(() => {
          navigate('/user-panel');
        }, 1500);
      })
      .catch((error) => {
        toast.error('Credențiale incorecte!', {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 2000,
        });
        console.log(error);
      });
  };

  return (
    <div className="main-container min-h-screen min-w-screen bg-cover bg-no-repeat bg-center" style={{ backgroundImage: "url('images/homebg.jpg')" }}>
      <div className="flex justify-center items-center min-h-screen">
        <div className="main-form bg-gray-900 bg-opacity-75 bg-blur rounded-lg flex w-11/12 lg:w-loginform h-[30rem] shadow-xl-black">
          <div className="promo hidden min-[420px]:flex md:flex lg:flex flex-col justify-center items-start bg-cover bg-no-repeat bg-center w-1/2 rounded-l-lg" style={{ backgroundImage: "url('images/promo.jpg')" }}></div>
          <form className="inputs flex flex-col flex-grow w-full lg:w-1/2 p-6 justify-center" onSubmit={handleSubmit}>
            <div className="mt-4">
              <label htmlFor="email" className="block text-gray-300 mb-1">E-mail</label>
              <div className="relative">
                <FiAtSign className="text-gray-300 absolute top-[30.33333%]" />
                <input
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 pl-6 border-b border-gray-300 text-gray-300 bg-transparent focus:outline-none placeholder-gray-300 placeholder-opacity-25"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Adresa de e-mail"
                />
              </div>
            </div>
            <div className="mt-4 mb-4">
              <label htmlFor="password" className="block text-gray-300 mb-1">Parola</label>
              <div className="relative">
                <FiLock className="text-gray-300 absolute top-[30.33333%]" />
                <input
                  type="password"
                  id="password"
                  className="w-full px-3 py-2 pl-6 border-b border-gray-300 text-gray-300 bg-transparent focus:outline-none placeholder-gray-300 placeholder-opacity-25"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Parola"
                />
              </div>
            </div>
            <div className="buttons flex flex-col items-start">
              <button type="submit" className="my-4 p-2 bg-indigo-700 w-full lg:w-100 xl:w-100 text-white font-medium rounded hover:bg-indigo-900 transition-all">
                Autentifică-te
              </button>
              <div className="links flex flex-row">
                <button className="text-gray-400 hover:underline text-xs ml-0 mt-2 lg:mt-0" onClick={() => navigate('/register')}>Încă nu ai un cont?</button>
              </div>
            </div>

          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default LoginForm;