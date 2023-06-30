import React, { useEffect, useState } from 'react'; //import de biblioteci
import { useNavigate, useLocation } from 'react-router-dom';
import { IoCreateOutline, IoTrashOutline, IoPencilOutline } from 'react-icons/io5';
import { RiLogoutBoxLine } from 'react-icons/ri';
import { getAuth, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getDatabase, ref as databaseRef, get, set } from 'firebase/database';
import { getStorage, ref as storageRef, deleteObject, uploadBytes } from 'firebase/storage';
import database from './firebase';

const UserPanel = () => { //initializarea functiei UserPanel
  const [userData, setUserData] = useState(null); //declarare stari prin hook-uri si declarare alte variabile
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const photoUrlParam = queryParams.get('photoUrl');
  const storage = getStorage();


  const goToCanvas = () => { //functia care duce catre editorul foto
    navigate('/canvas');
  };
  const handleEditPhoto = (photoUrl) => { //functia care duce fotografii deja salvate catre editorul foto
    navigate(`/canvas?photoUrl=${encodeURIComponent(photoUrl)}`);
  };
  const handleLogout = () => { //functia care gestioneaza butonul de deconectare
    setShowLogoutConfirmation(true);
  };

  const handleLogoutConfirmation = () => { //functionalitatea deconectarii
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        console.log('User logged out successfully.');
        navigate('/', { replace: true });
      })
      .catch((error) => {
        console.log('Error logging out:', error);
      });
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirmation(false);
  };

  const handleDeleteConfirmation = () => { //functia care gestioneaza confirmarea stergerii unei fotografii din galerie
    const user = getAuth().currentUser;
    if (user) {
      const userPhotosRef = databaseRef(database, `users/${user.uid}/urls`);
      const storageReference = storageRef(getStorage(), selectedPhoto);
      get(userPhotosRef)
        .then((snapshot) => {
          const photoUrls = snapshot.val();
          if (photoUrls && Array.isArray(photoUrls)) {
            const updatedPhotoUrls = photoUrls.filter((url) => url !== selectedPhoto);
            set(userPhotosRef, updatedPhotoUrls)
              .then(() => {
                console.log('Photo URL updated successfully in the database.');
                deleteObject(storageReference)
                  .then(() => {
                    console.log('Photo deleted successfully from Firebase Storage.');
                    setPhotos(updatedPhotoUrls);
                    setSelectedPhoto(null);
                    setShowDeleteConfirmation(false);
                  })
                  .catch((error) => {
                    console.log('Error deleting photo from Firebase Storage:', error);
                  });
              })
              .catch((error) => {
                console.log('Error updating photo URL in the database:', error);
              });
          }
        })
        .catch((error) => {
          console.log('Error retrieving photo URLs from the database:', error);
        });
    }
  };

  const handleCancelDelete = () => {
    setSelectedPhoto(null);
    setShowDeleteConfirmation(false);
  };

  useEffect(() => { //functia care afiseaza fotografiile fiecarui utilizator in baza de date
    const auth = getAuth();

    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const user = auth.currentUser;
        if (user) {
          const userPhotosRef = databaseRef(database, `users/${user.uid}/urls`);

          get(userPhotosRef)
            .then((snapshot) => {
              if (snapshot.exists()) {
                const photoUrls = Object.values(snapshot.val());
                setPhotos(photoUrls);
              } else {
                console.log('User photos not found in the database.');
              }
            })
            .catch((error) => {
              console.log('Error retrieving user photos:', error);
            });
        } else {
          console.log('User not authenticated.');
        }
      })
      .catch((error) => {
        console.log('Error setting auth persistence:', error);
      });
  }, []);

  useEffect(() => { //functia care verifica daca un utilizator este conectat
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = databaseRef(database, `users/${user.uid}`);

        get(userRef)
          .then((snapshot) => {
            if (snapshot.exists()) {
              setUserData(snapshot.val());
            } else {
              console.log('User data not found in the database.');
            }
          })
          .catch((error) => {
            console.log('Error retrieving user data:', error);
          });
      } else {
        setUserData(null);
        console.log('User not authenticated.');
      }
    });

    return () => unsubscribe();
  }, []);
  //codul JSX pentru interfata
  return (
    <div>
      <div className='bg-gradient-to-b from-blue-100 to-indigo-200 w-screen h-screen fixed z-30'>
        <nav className="bg-gradient-to-r from-indigo-300 via-purple-400 to-blue-500 w-full p-3 drop-shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="logo flex items-center">
                <img src="/images/logo.png" alt="Logo" className="w-8 h-8" />
                <h1 className="ml-2 text-xl font-bold text-slate-900">FotoFix</h1>
              </div>
            </div>
            <div className="relative">
              {userData && (
                <div className="relative z-50">
                  <div className="user-button text-indigo-50 h-10 bg-transparent p-2 flex items-center rounded-md">
                    <img className="w-8 h-8 rounded-full mr-2" src="./images/pfp.png  " alt="" />
                    <span /*Aici este afisat numele fiecarui utilizator*/ className="text-sm whitespace-nowrap overflow-hidden overflow-ellipsis max-[290px]:hidden">
                      {userData.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
        <div className='photo-grid-container h-[calc(100vh-4rem)] overflow-y-auto'>
          <div /*aici sunt afisate imaginile in galerie*/ className="photo-grid bg-indigo-100 bg-opacity-50 rounded-md drop-shadow-md grid grid-cols-1 scroll sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 m-6 p-4">
            {photos.map((photoUrl) => (
              <div key={photoUrl} className="bg-white rounded-lg shadow-md overflow-hidden relative">
                <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-end justify-end">
                  <button
                    className="bg-indigo-500 text-white p-2 rounded-md transition-colors duration-300 hover:bg-indigo-600"
                    onClick={() => handleEditPhoto(photoUrl)}
                  >
                    <IoPencilOutline className="w-5 h-5" />
                  </button>
                  <button
                    className="bg-red-500 text-white ml-1 p-2 rounded-md transition-colors duration-300 hover:bg-red-600"
                    onClick={() => {
                      setSelectedPhoto(photoUrl);
                      setShowDeleteConfirmation(true);
                    }}
                  >
                    <IoTrashOutline className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div></div>

        {showLogoutConfirmation && (
          <div /*Functionalitatea deconectarii*/ className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-md">
              <p className="mb-4">Ești sigur că vrei să te deconectezi?</p>
              <div className="flex justify-end">
                <button className="text-gray-500 mr-2" onClick={handleCancelLogout}>
                  Nu
                </button>
                <button className="text-red-500" onClick={handleLogoutConfirmation}>
                  Da
                </button>
              </div>
            </div>
          </div>
        )}
        <button /*Butonul de trimis catre Editorul foto*/
          className="p-4 rounded-2xl fixed bottom-4 right-4 drop-shadow-sm bg-indigo-300 hover:bg-purple-200 transition-colors duration-500"
          onClick={goToCanvas}
        >
          <IoCreateOutline className="w-6 h-6 text-slate-600" />
        </button>
        <button
          className="logout-button fixed bottom-4 left-4 p-4 rounded-2xl drop-shadow-sm bg-indigo-300 hover:bg-purple-200 transition-colors duration-500"
          onClick={handleLogout} /*Butonul de deconectare*/
        >
          <RiLogoutBoxLine className="w-6 h-6 text-slate-600" />
        </button>
        {showDeleteConfirmation && ( /*Conditia de stergere a imaginilor printr-un meniu modal de confirmare*/
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-md">
              <p className="mb-4">Ești sigur că vrei să stergi această fotografie?</p>
              <div className="flex justify-end">
                <button className="text-gray-500 mr-2" onClick={handleCancelDelete}>
                  Nu
                </button>
                <button className="text-red-500" onClick={handleDeleteConfirmation}>
                  Da
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPanel;
