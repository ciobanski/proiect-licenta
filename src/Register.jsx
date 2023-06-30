import React, { useState } from 'react'; //Liniile 1-6 sunt responsabile cu importarea bibliotecilor utilizate in pagina
import { useNavigate } from 'react-router-dom';
import { FiUser, FiAtSign, FiLock } from 'react-icons/fi';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import database from './firebase';

const RegisterForm = () => { //Initializarea functiei RegisterForm
  const [name, setName] = useState(''); //declararea tuturor starilor folosind hook-uri
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => { //Functia handlesubmit() care se ocupa cu
    e.preventDefault(); //functionalitatea inregistrarii

    const auth = getAuth();

    createUserWithEmailAndPassword(auth, email, password) //Aici este implementata functionalitatea
      .then((userCredential) => { //propriu-zisa a paginii de inregistrare
        const user = userCredential.user;

        updateProfile(user, {
          displayName: name
        })
          .then(() => {
            const usersRef = ref(database, 'users/' + user.uid);
            const userData = {
              name: name,
              email: email
            };
            set(usersRef, userData)
              .then(() => {
                toast.success('Registration successful!', {
                  position: toast.POSITION.TOP_CENTER,
                  autoClose: 1000,
                  onClose: () => {
                    setName('');
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                  }
                });
              })
              .catch((error) => {
                console.log('Error storing user data:', error);
              });
          })
          .catch((error) => {
            console.log('Error updating user profile:', error); //Exemple de erori
          });
      })
      .catch((error) => {
        console.log('Registration error:', error);
      });
  };



  const handleConfirmPasswordChange = (e) => { //confirmarea parolei in al doilea camp de introdus parola
    const confirmPasswordInput = e.target;
    const confirmPasswordValue = confirmPasswordInput.value;
    setConfirmPassword(confirmPasswordValue);

    if (confirmPasswordValue !== password) {
      confirmPasswordInput.setCustomValidity("Passwords don't match");
    } else {
      confirmPasswordInput.setCustomValidity('');
    }
  };
  // Codul JSX pentru construirea interfetei
  return (
    <div className="main-container min-h-screen min-w-screen bg-cover bg-no-repeat bg-center" style={{ backgroundImage: "url('images/homebg.jpg')" }}>
      <div className="flex justify-center items-center min-h-screen">
        <div className="main-form bg-gray-900 bg-opacity-75 bg-blur rounded-lg flex w-11/12 lg:w-loginform h-[30rem] shadow-xl-black">
          <div className="promo hidden min-[420px]:flex md:flex lg:flex flex-col justify-center items-start bg-cover bg-no-repeat bg-center w-1/2 rounded-l-lg" style={{ backgroundImage: "url('images/promo.jpg')" }}></div>
          <form className="inputs flex flex-col flex-grow w-full lg:w-1/2 p-6 justify-center" onSubmit={handleSubmit}>
            <div className="mt-4">
              <label htmlFor="name" className="block text-gray-300 mb-1">Nume</label>
              <div className="relative">
                <FiUser className="text-gray-300 absolute top-[30.33333%]" />
                <input
                  type="text"
                  id="name"
                  className="w-full px-3 py-2 pl-6 border-b border-gray-300 text-gray-300 bg-transparent focus:outline-none placeholder-gray-300 placeholder-opacity-25"
                  value={name}
                  onChange={(e) => setName(e.target.value)} /*input-ul nume, acesta va fi salvat in baza de date pentru a fi afisat fiecarui profil*/
                  required
                  placeholder="Nume"
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="email" className="block text-gray-300 mb-1">E-mail</label>
              <div className="relative">
                <FiAtSign className="text-gray-300 absolute top-[30.33333%]" />
                <input
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 pl-6 border-b border-gray-300 text-gray-300 bg-transparent focus:outline-none placeholder-gray-300 placeholder-opacity-25"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} /*input email*/
                  required
                  placeholder="Adresa de e-mail"
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="password" className="block text-gray-300 mb-1">Parola</label>
              <div className="relative">
                <FiLock className="text-gray-300 absolute top-[30.33333%]" />
                <input
                  type="password"
                  id="password"
                  className="w-full px-3 py-2 pl-6 border-b border-gray-300 text-gray-300 bg-transparent focus:outline-none placeholder-gray-300 placeholder-opacity-25"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} /*input parola*/
                  required
                  placeholder="Parola"
                />
              </div>
            </div>
            <div className="mt-4 mb-4">
              <label htmlFor="confirmPassword" className="block text-gray-300 mb-1">Confirmă parola</label>
              <div className="relative">
                <FiLock className="text-gray-300 absolute top-[30.33333%]" />
                <input
                  type="password"
                  id="confirmPassword"
                  className="w-full px-3 py-2 pl-6 border-b border-gray-300 text-gray-300 bg-transparent focus:outline-none placeholder-gray-300 placeholder-opacity-25"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange} /*input confirmare parola*/
                  required
                  placeholder="Parola"
                />
              </div>
            </div>
            <div className="buttons flex flex-col items-start">
              <button /*Butonul de inregistrare*/ type="submit" className="my-4 p-2 bg-indigo-700 w-full lg:w-100 xl:w-100 text-white font-medium rounded hover:bg-indigo-900 transition-all">
                Înregistrează-te
              </button>
              <div className="links flex flex-row">
                <button /*Butonul de revenire la pagina de login*/ className="text-gray-400 hover:underline text-xs mr-0 mt-2 lg:mt-0" onClick={() => navigate('/')}>
                  Ai deja un cont?
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default RegisterForm;